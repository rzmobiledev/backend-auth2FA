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
exports.MfaController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const http_config_1 = require("../../config/http.config");
const mfa_validator_1 = require("../../common/validators/mfa.validator");
const cookie_1 = require("../../common/utils/cookie");
class MfaController {
    constructor(mfaService) {
        this.generateMFASetup = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { message, secret, qrImageUrl } = yield this.mfaService.generateMFASetup(req);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message,
                secret,
                qrImageUrl
            });
        }));
        this.verifyMFASetup = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { code, secretKey } = mfa_validator_1.verifyMFASchema.parse(Object.assign({}, req.body));
            const { message, userPreferences } = yield this.mfaService.verifyMFASetup(req, code, secretKey);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message,
                userPreferences
            });
        }));
        this.revokeMFA = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { message, userPreferences } = yield this.mfaService.revokeMFA(req);
            return res.status(http_config_1.HTTP_STATUS.OK).json({
                message,
                userPreferences
            });
        }));
        this.verifyMFAForLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { code, email, userAgent } = mfa_validator_1.verifyMFAForLoginSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers['user-agent'] }));
            const { user, accessToken, refreshToken } = yield this.mfaService.verifyMFAForLogin(code, email, userAgent);
            return (0, cookie_1.setAuthenticationCookies)(res, accessToken, refreshToken).status(http_config_1.HTTP_STATUS.OK).json({
                message: "Verified & login successfully",
                user,
            });
        }));
        this.mfaService = mfaService;
    }
}
exports.MfaController = MfaController;
