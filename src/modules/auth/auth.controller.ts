import {asyncHandler} from "../../middleware/asyncHandler";
import {Request, Response} from "express";
import {HTTP_STATUS} from "../../config/http.config";
import {
    emailSchema,
    loginSchema,
    registerSchema, resetPasswordSchema,
    verificationEmailSchema
} from "../../common/validators/auth.validator";
import {AuthService} from "./auth.service";
import {
    clearAuthenticationCookies,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    setAuthenticationCookies
} from "../../common/utils/cookie";
import {UnauthorizedException} from "../../common/utils/catch-errors";
import {session} from "passport";


export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public register = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const userAgent = req.headers['user-agent'];
        const body = registerSchema.parse(req.body)
        const { user } = await this.authService.register(body)
        return res.status(HTTP_STATUS.CREATED).json({
            message: "User registered successfully",
            data: user
        })
    })

    public login = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const userAgent = req.headers['user-agent'];
        const body = loginSchema.parse({
            ...req.body,
            userAgent: userAgent
        })

        const { user, accessToken, refreshToken, mfaRequired } = await this.authService.login(body)

        if(mfaRequired) return res.status(HTTP_STATUS.OK).json({
            message: "Verify MFA authentication",
            mfaRequired,
            user
        })

        return setAuthenticationCookies(
            res,
            accessToken,
            refreshToken,
        ).status(HTTP_STATUS.OK).json({
            message: "User login successfully",
            mfaRequired,
            user
        })
    })

    public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const refreshToken = req.cookies.refreshToken as string
        if(!refreshToken) throw new UnauthorizedException("Missing refresh token")

        const {accessToken, newRefreshToken} = await this.authService.refreshToken(refreshToken)
        if(newRefreshToken) res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions())

        return res.status(HTTP_STATUS.OK)
            .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
            .json({message: "Refresh access token successfully"})
    })

    public verifyEmail = asyncHandler(async(req: Request, res: Response): Promise<any> => {
        const {code} = verificationEmailSchema.parse(req.body)
        await this.authService.verifyEmail(code)

        return res.status(HTTP_STATUS.OK).json({
            message: "Email verified successfully",
        })
    })

    public forgotPassword = asyncHandler(async(req: Request, res: Response): Promise<any> => {
        const email: string = emailSchema.parse(req.body.email)
        await this.authService.forgotPassword(email)

        return res.status(HTTP_STATUS.OK).json({
            message: "Password reset email sent"
        })
    })

    public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const body = resetPasswordSchema.parse(req.body)
        await this.authService.resetPassword(body)

        return clearAuthenticationCookies(res).status(HTTP_STATUS.OK).json({
            message: "Password reset successfully",
        })
    })

    public logout = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const sessionId = req.sessionId
        if(!sessionId) throw new UnauthorizedException("Session is invalid")

        await this.authService.logout(sessionId)
        return clearAuthenticationCookies(res).status(HTTP_STATUS.OK).json({
            message: "User logout successfully",
        })
    })
}