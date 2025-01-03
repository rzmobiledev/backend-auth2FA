import {
    ExtractJwt,
    StrategyOptionsWithoutRequest,
    Strategy,
    VerifiedCallback, VerifyCallbackWithRequest, VerifyCallback,
} from "passport-jwt";
import {PassportStatic} from "passport";
import {NextFunction, Request} from "express"
import {UnauthorizedException} from "../utils/catch-errors";
import {ErrorCode} from "../enums/error_code.enum";
import {config} from "../../config/app.config";
import {userService} from "../../modules/user/user.module";
import passport from "passport";
import {AppError} from "../utils/AppError";
import {UserDocument} from "../../database/models/user.model";


interface JwtPayload {
    userId: string
    sessionId: string
}

const options: StrategyOptionsWithoutRequest = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        <T extends Request>(req: T): string => {
            const accessToken = req.cookies.accessToken
            if(!accessToken) throw new UnauthorizedException(
                "Unauthorized access token",
                ErrorCode.AUTH_TOKEN_NOT_FOUND
            )
            return accessToken
        }
    ]),
    secretOrKey: config.JWT.SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
    passReqToCallback: <any>true,
}

export const setupJwtStrategy = (passport: PassportStatic) => {

    // @ts-ignore
    passport.use(new Strategy(options, async<T extends Request>(req: T, payload: JwtPayload, done: VerifiedCallback): Promise<void> => {
        try{
            const user = await userService.findUserById(payload.userId)
            if(!user) {
                return done(null,  false)
            }
            req.sessionId = payload.sessionId
            return done(null, user, payload)
        }catch(err){
            return done(err, false)
        }
    }))
}

export const authenticateJWT = passport.authenticate(
    'jwt', {session: false}
)