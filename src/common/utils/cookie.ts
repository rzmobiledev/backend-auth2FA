import {Response, CookieOptions} from "express"
import {config} from "../../config/app.config";
import {calculateExpirationDate} from "./date-time";

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaultCookie: CookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax"
}

export const getRefreshTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.REFRESH_EXPIRES_IN
    const expires = calculateExpirationDate(expiresIn)
    return {
        ...defaultCookie,
        expires,
        path: REFRESH_PATH
    }
}

export const getAccessTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.JWT.EXPIRES_IN
    const expires = calculateExpirationDate(expiresIn)
    return {
        ...defaultCookie,
        expires,
        path: "/"
    }
}

export const setAuthenticationCookies = (
    res: Response,
    accessToken: String,
    refreshToken: String,
): Response => res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())

export const clearAuthenticationCookies = (res: Response): Response => {
    return res.clearCookie("accessToken").clearCookie("refreshToken", {
        path: REFRESH_PATH
    })
}