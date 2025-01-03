import {MfaService} from "./mfa.service";
import {asyncHandler} from "../../middleware/asyncHandler";
import {Request, Response} from "express"
import {HTTP_STATUS} from "../../config/http.config";
import {verifyMFAForLoginSchema, verifyMFASchema} from "../../common/validators/mfa.validator";
import {setAuthenticationCookies} from "../../common/utils/cookie";

export class MfaController {
    private mfaService: MfaService;

    constructor(mfaService: MfaService) {
        this.mfaService = mfaService;
    }

    public generateMFASetup = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const {message, secret, qrImageUrl} = await this.mfaService.generateMFASetup(req)

        return res.status(HTTP_STATUS.OK).json({
            message,
            secret,
            qrImageUrl
        })
    })

    public verifyMFASetup = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const { code, secretKey } = verifyMFASchema.parse({
            ...req.body
        })
        const {message, userPreferences} = await this.mfaService.verifyMFASetup(req, code, secretKey)
        return res.status(HTTP_STATUS.OK).json({
            message,
            userPreferences
        })
    })

    public revokeMFA = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const { message, userPreferences } = await this.mfaService.revokeMFA(req)
        return res.status(HTTP_STATUS.OK).json({
            message,
            userPreferences
        })
    })

    public verifyMFAForLogin = asyncHandler(async (req: Request, res: Response): Promise<any> => {
        const { code, email, userAgent } = verifyMFAForLoginSchema.parse({
            ...req.body,
            userAgent: req.headers['user-agent']
        })
        const { user, accessToken, refreshToken } = await this.mfaService.verifyMFAForLogin(code, email, userAgent!)

        return setAuthenticationCookies(res, accessToken, refreshToken).status(HTTP_STATUS.OK).json({
            message: "Verified & login successfully",
            user,
        })

    })
}