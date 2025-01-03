import {Request} from "express"
import {BadRequestException, NotFoundException, UnauthorizedException} from "../../common/utils/catch-errors"
import UserModel, {UserDocument} from "../../database/models/user.model"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import sessionModel from "../../database/models/session.model";
import {refreshTokenSignOptions, signJWTToken} from "../../common/utils/jwt";
import SessionModel from "../../database/models/session.model";

export class MfaService {

    public async generateMFASetup(req: Request): Promise<any>{
        const user: UserDocument | typeof UserModel | undefined = req.user

        if(!user) throw new UnauthorizedException("User not authorized")
        if(user.userPreferences?.enable2FA) return {
            message: "MFA already enabled"
        }

        let secretKey: string | undefined = user.userPreferences?.twoFactorSecret
        if(!secretKey) {
            const secret = speakeasy.generateSecret({
                name: "Squeezy"
            });
            secretKey = secret.base32
            user.userPreferences.twoFactorSecret = secretKey
            await user.save()
        }
        const url = speakeasy.otpauthURL({
            secret: secretKey,
            label: `${user.name}`,
            issuer: "squeezy.com",
            encoding: "base32"
        })
        const qrImageUrl = await qrcode.toDataURL(url)
        return {
            message: "Scan QR Code or use setup key",
            secret: secretKey,
            qrImageUrl,
        }
    }

    public async verifyMFASetup(req: Request, code: string, secretKey: string): Promise<any>{
        const user: UserDocument | undefined = req.user
        if(!user) throw new UnauthorizedException("User not authorized")
        if(user.userPreferences?.enable2FA) return {
            message: "MFA already enabled"
        }

        const isValid: boolean = speakeasy.totp.verify({
            secret: secretKey,
            encoding: "base32",
            token: code
        })

        if(!isValid) throw new BadRequestException("Invalid MFA code. Please try again")
        user.userPreferences.enable2FA = true;
        await user.save()

        return {
            message: "MFA setup completed sucessfully",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA,
            }
        }
    }

    public async revokeMFA(req: Request): Promise<any>{
        const user: UserDocument | undefined = req.user
        if(!user) throw new UnauthorizedException("User not authorized")

        if(!user.userPreferences?.enable2FA) return {
            message: "MFA is not enabled",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA
            }
        }

        user.userPreferences.twoFactorSecret = undefined
        user.userPreferences.enable2FA = false
        await user.save()

        if(!user.userPreferences?.enable2FA) return {
            message: "MFA revoke successfully",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA
            }
        }
    }

    public async verifyMFAForLogin(code: string, email: string, userAgent: string): Promise<any>{
        const user: UserDocument | null = await UserModel.findOne({email})

        if(!user) throw new NotFoundException("User not found")
        if(!user.userPreferences?.enable2FA && !user.userPreferences?.twoFactorSecret) {
            throw new UnauthorizedException("MFA is not enabled for this user")
        }

        const isValid: boolean = speakeasy.totp.verify({
            secret: user.userPreferences?.twoFactorSecret!,
            encoding: "base32",
            token: code
        })

        if(!isValid) throw new BadRequestException("Invalid MFA code. Please try again")

        const session = await SessionModel.create({
            userId: user._id,
            userAgent: userAgent,
        })

        const accessToken = signJWTToken({
            userId: user._id,
            sessionId: session._id
        })

        const refreshToken = signJWTToken({
            sessionId: session._id,
        }, refreshTokenSignOptions)

        return {
            user,
            accessToken,
            refreshToken
        }
    }
}