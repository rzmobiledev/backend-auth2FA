import {UserDocument} from "../../database/models/user.model";
import {SessionDocument} from "../../database/models/session.model";
import jwt, { SignOptions, VerifyOptions} from "jsonwebtoken";
import { config} from "../../config/app.config"
import {Request} from "express";

export type AccessTPayload = {
    userId: UserDocument["_id"]
    sessionId: SessionDocument["_id"]
}

export type RefreshTPayload = {
    sessionId: SessionDocument["_id"]
}

type SignOptsAndSecret = SignOptions & {
    secret: string
}

const defaultJWT: SignOptions =  {
    audience: ["user"]
}

export const AccessTokenSignOptions: SignOptsAndSecret = {
    expiresIn: config.JWT.EXPIRES_IN,
    secret: config.JWT.SECRET
}

export const refreshTokenSignOptions: SignOptsAndSecret = {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    secret: config.JWT.REFRESH_SECRET
}

export const signJWTToken = (
    payload: AccessTPayload | RefreshTPayload,
    options?: SignOptsAndSecret
): string => {
    const { secret, ...opts } = options || AccessTokenSignOptions
    return jwt.sign(payload, secret, {
        ...defaultJWT,
        ...opts
    })
}

export const verifyJwtToken = <T extends object = AccessTPayload>(
    token: string,
    options?: VerifyOptions & { secret: string }
) => {
    try{
        const {secret = config.JWT.SECRET, ...opts} = options || refreshTokenSignOptions
        const payload = jwt.verify(token, secret, {
            ...defaultJWT,
            ...opts
        }) as T
        return { payload }
    }catch(error: any){
        return { error: error.message }
    }
}