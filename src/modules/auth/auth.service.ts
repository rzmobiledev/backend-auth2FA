import {LoginDto, RegisterDto, ResetPasswordDto} from "../../common/interface/auth.interface";
import UserModel, {UserDocument} from "../../database/models/user.model";
import {
    BadRequestException,
    HttpException, InternalServerError, InternalServerException,
    NotFoundException,
    UnauthorizedException
} from "../../common/utils/catch-errors";
import {ErrorCode} from "../../common/enums/error_code.enum";
import VerificationCodeModel from "../../database/models/verification.model";
import verificationModel from "../../database/models/verification.model";
import VerificationModel from "../../database/models/verification.model";
import {VerificationEnum} from "../../common/enums/verification.code.enum";
import {
    calculateExpirationDate,
    fortyFiveMinutesFromNow,
    ONE_DAY_IN_MS,
    threeMinutesAgo,
    anHourFromNow
} from "../../common/utils/date-time";
import SessionModel from "../../database/models/session.model";
import {appConfigType, config} from "../../config/app.config"
import {refreshTokenSignOptions, RefreshTPayload, signJWTToken, verifyJwtToken} from "../../common/utils/jwt";
import {Document} from "mongoose";
import {sendEmail} from "../../mailers/mailer";
import {passwordResetTemplate, verifyEmailTemplate} from "../../mailers/templates/template";
import {HTTP_STATUS} from "../../config/http.config";
import {hashValue} from "../../common/utils/bcrypt";
import sessionModel from "../../database/models/session.model";

export class AuthService {
    public async register(registerData: RegisterDto): Promise<{user: Document}>{
        const {name, email, password} = registerData;

        const existingUser = await UserModel.exists({email});

        if(existingUser){
            throw new BadRequestException(
                "User already exists with this email",
                ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
        }

        const newUser = await UserModel.create({name, email, password});

        const userId = newUser._id

        const verification = await VerificationCodeModel.create({
            userId,
            type: VerificationEnum.EMAIL_VERIFICATION,
            createdAt: new Date(),
            expiresAt: fortyFiveMinutesFromNow()
        })

        // sending verification email link
        const verificationUrl = `${config.FRONTEND_ORIGIN}/confirm-account?code=${verification.code}`;
        await sendEmail({
            to: newUser.email,
            ...verifyEmailTemplate(verificationUrl)
        })

        return {
            user: newUser
        }
    }

    public async login(loginData: LoginDto){
        const {email, password, userAgent} = loginData
        const user: UserDocument | null = await UserModel.findOne({email})
        if(!user){
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            )
        }

        const isPasswordValid: boolean = await user.comparePassword(password)
        if(!isPasswordValid){
            throw new BadRequestException(
                "Invalid email or password provided",
                ErrorCode.AUTH_USER_NOT_FOUND
            )
        }

        if(user.userPreferences?.enable2FA) return {
            user: null,
            accessToken: "",
            refreshToken:"",
            mfaRequired: true
        }

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
            refreshToken,
            mfaRequired: false
        }
    }

    public async refreshToken(refreshToken: string): Promise<Record<string, string | undefined>>{
        const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken)

        if(!payload) throw new UnauthorizedException("Invalid refresh token")

        const session = await SessionModel.findById(payload.sessionId)
        const now: number = Date.now()

        if(!session) throw new UnauthorizedException("Session does not exist")

        if(session.expiredAt.getTime() < now) throw new UnauthorizedException("Session expired")

        const sessionRequiresRefresh: boolean = (session.expiredAt.getTime() - now) < ONE_DAY_IN_MS

        if(sessionRequiresRefresh) {
            session.expiredAt = calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN)
            await session.save()
        }

        const newRefreshToken = sessionRequiresRefresh ? signJWTToken({sessionId: session._id}, refreshTokenSignOptions) : undefined

        const accessToken = signJWTToken({
            userId: session.userId,
            sessionId: session._id
        })

        return {
            accessToken,
            newRefreshToken
        }
    }

    public async verifyEmail(code: string): Promise<object> {
        const validCode = await verificationModel.findOne({
            code: code,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expiresAt: { $gt: new Date()}
        })

        if(!validCode) throw new UnauthorizedException("Invalid or expired verification")

        const updateUser: Document<UserDocument, any, any> | null = await UserModel.findByIdAndUpdate(validCode.userId,
            { isEmailVerified: true }, { new: true }
        )

        if(!updateUser) throw new BadRequestException(
            "Unable to verify email address",
            ErrorCode.VALIDATION_ERROR
        )

        await validCode.deleteOne()

        return {
            user: updateUser
        }
    }

    public async forgotPassword(email: string): Promise<{url: string, emailId: string}> {
        const user = await UserModel.findOne({email})
        if(!user) throw new NotFoundException("User not found")

        // check mail rate limit is 2 emails per 3 or 10 min
        const timeAgo: Date = threeMinutesAgo()
        const maxAttempts = 2

        const count = await VerificationModel.countDocuments({
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            createdAt: {$gt : timeAgo},
        })

        if(count >= maxAttempts) throw new HttpException(
            "Too many requests, try again later"
        )

        const expiresAt: Date = anHourFromNow()
        const validCode = await VerificationModel.create({
            userId: user._id,
            type: VerificationEnum.PASSWORD_RESET,
            createdAt: new Date(),
            expiresAt
        })

        // const resetLink = `${config.FRONTEND_ORIGIN}${config.BASE_PATH}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`
        const resetLink = `${config.FRONTEND_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`

        const { data, error } = await sendEmail({
            to: user.email,
            ...passwordResetTemplate(resetLink)
        })

        if(!data?.id) throw new InternalServerException(
            `${error?.name} ${error?.message}`
        )

        return {
            url: resetLink,
            emailId: data.id
        }
    }

    public async resetPassword({password, verificationCode}: ResetPasswordDto): Promise<any> {
        const validCode = await verificationModel.findOne({
            code: verificationCode,
            type: VerificationEnum.PASSWORD_RESET,
            expiresAt: { $gt: new Date()}
        })

        if(!validCode) throw new NotFoundException("Invalid or expired verification verification code")

        const hashedPassword = await hashValue(password)

        const updateUser = await UserModel.findByIdAndUpdate(
            validCode.userId, {
                password: hashedPassword
            }
        )

        if(!updateUser) throw new BadRequestException("Failed to reset password")
        await validCode.deleteOne()

        await sessionModel.deleteMany({
            userId: updateUser._id
        })

        return {
            user: updateUser,
        }
    }

    public async logout(sessionId: string): Promise<any> {
        return SessionModel.findByIdAndDelete(sessionId)
    }
}