"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const http_config_1 = require("../../config/http.config");
const auth_validator_1 = require("../../common/validators/auth.validator");
const cookie_1 = require("../../common/utils/cookie");
const catch_errors_1 = require("../../common/utils/catch-errors");
class AuthController {
    constructor(authService) {
        this.register = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userAgent = req.headers['user-agent'];
            const body = auth_validator_1.registerSchema.parse(req.body);
            const { user } = yield this.authService.register(body);
            return res.status(http_config_1.HTTP_STATUS.CREATED).json({
                message: "User registered successfully",
                data: user
            });
        }));
        this.login = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userAgent = req.headers['user-agent'];
            const body = auth_validator_1.loginSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: userAgent }));
            const { user, accessToken, refreshToken, mfaRequired } = yield this.authService.login(body);
            if (mfaRequired)
                return res.status(http_config_1.HTTP_STATUS.OK).json({
                    message: "Verify MFA authentication",
                    mfaRequired,
                    user
                });
            return (0, cookie_1.setAuthenticationCookies)(res, accessToken, refreshToken).status(http_config_1.HTTP_STATUS.OK).json({
                message: "User login successfully",
                mfaRequired,
                user
            });
        }));
        this.refreshToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                throw new catch_errors_1.UnauthorizedException("Missing refresh token");
            const { accessToken, newRefreshToken } = yield this.authService.refreshToken(refreshToken);
            if (newRefreshToken)
                res.cookie("refreshToken", newRefreshToken, (0, cookie_1.getRefreshTokenCookieOptions)());
            return res.status(http_config_1.HTTP_STATUS.OK)
                .cookie("accessToken", accessToken, (0, cookie_1.getAccessTokenCookieOptions)())
                .json({ message: "Refresh access token successfully" });
        }));
        this.verifyEmail = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { code } = auth_validator_1.verificationEmailSchema.parse(req.body);
            yield this.authService.verifyEmail(code);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message: "Email verified successfully",
            });
        }));
        this.forgotPassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const email = auth_validator_1.emailSchema.parse(req.body.email);
            yield this.authService.forgotPassword(email);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message: "Password reset email sent"
            });
        }));
        this.resetPassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const body = auth_validator_1.resetPasswordSchema.parse(req.body);
            yield this.authService.resetPassword(body);
            return (0, cookie_1.clearAuthenticationCookies)(res).status(http_config_1.HTTP_STATUS.OK).json({
                message: "Password reset successfully",
            });
        }));
        this.logout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.sessionId;
            if (!sessionId)
                throw new catch_errors_1.UnauthorizedException("Session is invalid");
            yield this.authService.logout(sessionId);
            return (0, cookie_1.clearAuthenticationCookies)(res).status(http_config_1.HTTP_STATUS.OK).json({
                message: "User logout successfully",
            });
        }));
        this.authService = authService;
    }
}
exports.AuthController = AuthController;
