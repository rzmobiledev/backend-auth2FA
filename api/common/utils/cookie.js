"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthenticationCookies = exports.setAuthenticationCookies = exports.getAccessTokenCookieOptions = exports.getRefreshTokenCookieOptions = exports.REFRESH_PATH = void 0;
const app_config_1 = require("../../config/app.config");
const date_time_1 = require("./date-time");
exports.REFRESH_PATH = `${app_config_1.config.BASE_PATH}/auth/refresh`;
const defaultCookie = {
    httpOnly: true,
    secure: app_config_1.config.NODE_ENV === "production",
    sameSite: app_config_1.config.NODE_ENV === "production" ? "strict" : "lax"
};
const getRefreshTokenCookieOptions = () => {
    const expiresIn = app_config_1.config.JWT.REFRESH_EXPIRES_IN;
    const expires = (0, date_time_1.calculateExpirationDate)(expiresIn);
    return Object.assign(Object.assign({}, defaultCookie), { expires, path: exports.REFRESH_PATH });
};
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const getAccessTokenCookieOptions = () => {
    const expiresIn = app_config_1.config.JWT.EXPIRES_IN;
    const expires = (0, date_time_1.calculateExpirationDate)(expiresIn);
    return Object.assign(Object.assign({}, defaultCookie), { expires, path: "/" });
};
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const setAuthenticationCookies = (res, accessToken, refreshToken) => res
    .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookieOptions)())
    .cookie("refreshToken", refreshToken, (0, exports.getRefreshTokenCookieOptions)());
exports.setAuthenticationCookies = setAuthenticationCookies;
const clearAuthenticationCookies = (res) => {
    return res.clearCookie("accessToken").clearCookie("refreshToken", {
        path: exports.REFRESH_PATH
    });
};
exports.clearAuthenticationCookies = clearAuthenticationCookies;
