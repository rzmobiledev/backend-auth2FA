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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const catch_errors_1 = require("../../common/utils/catch-errors");
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const jwt_1 = require("../../common/utils/jwt");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
class MfaService {
    generateMFASetup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = req.user;
            if (!user)
                throw new catch_errors_1.UnauthorizedException("User not authorized");
            if ((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA)
                return {
                    message: "MFA already enabled"
                };
            let secretKey = (_b = user.userPreferences) === null || _b === void 0 ? void 0 : _b.twoFactorSecret;
            if (!secretKey) {
                const secret = speakeasy_1.default.generateSecret({
                    name: "Squeezy"
                });
                secretKey = secret.base32;
                user.userPreferences.twoFactorSecret = secretKey;
                yield user.save();
            }
            const url = speakeasy_1.default.otpauthURL({
                secret: secretKey,
                label: `${user.name}`,
                issuer: "squeezy.com",
                encoding: "base32"
            });
            const qrImageUrl = yield qrcode_1.default.toDataURL(url);
            return {
                message: "Scan QR Code or use setup key",
                secret: secretKey,
                qrImageUrl,
            };
        });
    }
    verifyMFASetup(req, code, secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = req.user;
            if (!user)
                throw new catch_errors_1.UnauthorizedException("User not authorized");
            if ((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA)
                return {
                    message: "MFA already enabled"
                };
            const isValid = speakeasy_1.default.totp.verify({
                secret: secretKey,
                encoding: "base32",
                token: code
            });
            if (!isValid)
                throw new catch_errors_1.BadRequestException("Invalid MFA code. Please try again");
            user.userPreferences.enable2FA = true;
            yield user.save();
            return {
                message: "MFA setup completed sucessfully",
                userPreferences: {
                    enable2FA: user.userPreferences.enable2FA,
                }
            };
        });
    }
    revokeMFA(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = req.user;
            if (!user)
                throw new catch_errors_1.UnauthorizedException("User not authorized");
            if (!((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA))
                return {
                    message: "MFA is not enabled",
                    userPreferences: {
                        enable2FA: user.userPreferences.enable2FA
                    }
                };
            user.userPreferences.twoFactorSecret = undefined;
            user.userPreferences.enable2FA = false;
            yield user.save();
            if (!((_b = user.userPreferences) === null || _b === void 0 ? void 0 : _b.enable2FA))
                return {
                    message: "MFA revoke successfully",
                    userPreferences: {
                        enable2FA: user.userPreferences.enable2FA
                    }
                };
        });
    }
    verifyMFAForLogin(code, email, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const user = yield user_model_1.default.findOne({ email });
            if (!user)
                throw new catch_errors_1.NotFoundException("User not found");
            if (!((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA) && !((_b = user.userPreferences) === null || _b === void 0 ? void 0 : _b.twoFactorSecret)) {
                throw new catch_errors_1.UnauthorizedException("MFA is not enabled for this user");
            }
            const isValid = speakeasy_1.default.totp.verify({
                secret: (_c = user.userPreferences) === null || _c === void 0 ? void 0 : _c.twoFactorSecret,
                encoding: "base32",
                token: code
            });
            if (!isValid)
                throw new catch_errors_1.BadRequestException("Invalid MFA code. Please try again");
            const session = yield session_model_1.default.create({
                userId: user._id,
                userAgent: userAgent,
            });
            const accessToken = (0, jwt_1.signJWTToken)({
                userId: user._id,
                sessionId: session._id
            });
            const refreshToken = (0, jwt_1.signJWTToken)({
                sessionId: session._id,
            }, jwt_1.refreshTokenSignOptions);
            return {
                user,
                accessToken,
                refreshToken
            };
        });
    }
}
exports.MfaService = MfaService;
