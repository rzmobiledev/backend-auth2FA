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
exports.AuthService = void 0;
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const catch_errors_1 = require("../../common/utils/catch-errors");
const error_code_enum_1 = require("../../common/enums/error_code.enum");
const verification_model_1 = __importDefault(require("../../database/models/verification.model"));
const verification_model_2 = __importDefault(require("../../database/models/verification.model"));
const verification_model_3 = __importDefault(require("../../database/models/verification.model"));
const date_time_1 = require("../../common/utils/date-time");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const app_config_1 = require("../../config/app.config");
const jwt_1 = require("../../common/utils/jwt");
const mailer_1 = require("../../mailers/mailer");
const template_1 = require("../../mailers/templates/template");
const bcrypt_1 = require("../../common/utils/bcrypt");
const session_model_2 = __importDefault(require("../../database/models/session.model"));
class AuthService {
    register(registerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = registerData;
            const existingUser = yield user_model_1.default.exists({ email });
            if (existingUser) {
                throw new catch_errors_1.BadRequestException("User already exists with this email", error_code_enum_1.ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }
            const newUser = yield user_model_1.default.create({ name, email, password });
            const userId = newUser._id;
            const verification = yield verification_model_1.default.create({
                userId,
                type: "EMAIL_VERIFICATION" /* VerificationEnum.EMAIL_VERIFICATION */,
                createdAt: new Date(),
                expiresAt: (0, date_time_1.fortyFiveMinutesFromNow)()
            });
            // sending verification email link
            const verificationUrl = `${app_config_1.config.FRONTEND_ORIGIN}/confirm-account?code=${verification.code}`;
            yield (0, mailer_1.sendEmail)(Object.assign({ to: newUser.email }, (0, template_1.verifyEmailTemplate)(verificationUrl)));
            return {
                user: newUser
            };
        });
    }
    login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { email, password, userAgent } = loginData;
            const user = yield user_model_1.default.findOne({ email });
            if (!user) {
                throw new catch_errors_1.BadRequestException("Invalid email or password provided", error_code_enum_1.ErrorCode.AUTH_USER_NOT_FOUND);
            }
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                throw new catch_errors_1.BadRequestException("Invalid email or password provided", error_code_enum_1.ErrorCode.AUTH_USER_NOT_FOUND);
            }
            if ((_a = user.userPreferences) === null || _a === void 0 ? void 0 : _a.enable2FA)
                return {
                    user: null,
                    accessToken: "",
                    refreshToken: "",
                    mfaRequired: true
                };
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
                refreshToken,
                mfaRequired: false
            };
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payload } = (0, jwt_1.verifyJwtToken)(refreshToken);
            if (!payload)
                throw new catch_errors_1.UnauthorizedException("Invalid refresh token");
            const session = yield session_model_1.default.findById(payload.sessionId);
            const now = Date.now();
            if (!session)
                throw new catch_errors_1.UnauthorizedException("Session does not exist");
            if (session.expiredAt.getTime() < now)
                throw new catch_errors_1.UnauthorizedException("Session expired");
            const sessionRequiresRefresh = (session.expiredAt.getTime() - now) < date_time_1.ONE_DAY_IN_MS;
            if (sessionRequiresRefresh) {
                session.expiredAt = (0, date_time_1.calculateExpirationDate)(app_config_1.config.JWT.REFRESH_EXPIRES_IN);
                yield session.save();
            }
            const newRefreshToken = sessionRequiresRefresh ? (0, jwt_1.signJWTToken)({ sessionId: session._id }, jwt_1.refreshTokenSignOptions) : undefined;
            const accessToken = (0, jwt_1.signJWTToken)({
                userId: session.userId,
                sessionId: session._id
            });
            return {
                accessToken,
                newRefreshToken
            };
        });
    }
    verifyEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const validCode = yield verification_model_2.default.findOne({
                code: code,
                type: "EMAIL_VERIFICATION" /* VerificationEnum.EMAIL_VERIFICATION */,
                expiresAt: { $gt: new Date() }
            });
            if (!validCode)
                throw new catch_errors_1.UnauthorizedException("Invalid or expired verification");
            const updateUser = yield user_model_1.default.findByIdAndUpdate(validCode.userId, { isEmailVerified: true }, { new: true });
            if (!updateUser)
                throw new catch_errors_1.BadRequestException("Unable to verify email address", error_code_enum_1.ErrorCode.VALIDATION_ERROR);
            yield validCode.deleteOne();
            return {
                user: updateUser
            };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findOne({ email });
            if (!user)
                throw new catch_errors_1.NotFoundException("User not found");
            // check mail rate limit is 2 emails per 3 or 10 min
            const timeAgo = (0, date_time_1.threeMinutesAgo)();
            const maxAttempts = 2;
            const count = yield verification_model_3.default.countDocuments({
                userId: user._id,
                type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                createdAt: { $gt: timeAgo },
            });
            if (count >= maxAttempts)
                throw new catch_errors_1.HttpException("Too many requests, try again later");
            const expiresAt = (0, date_time_1.anHourFromNow)();
            const validCode = yield verification_model_3.default.create({
                userId: user._id,
                type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                createdAt: new Date(),
                expiresAt
            });
            // const resetLink = `${config.FRONTEND_ORIGIN}${config.BASE_PATH}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`
            const resetLink = `${app_config_1.config.FRONTEND_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;
            const { data, error } = yield (0, mailer_1.sendEmail)(Object.assign({ to: user.email }, (0, template_1.passwordResetTemplate)(resetLink)));
            if (!(data === null || data === void 0 ? void 0 : data.id))
                throw new catch_errors_1.InternalServerException(`${error === null || error === void 0 ? void 0 : error.name} ${error === null || error === void 0 ? void 0 : error.message}`);
            return {
                url: resetLink,
                emailId: data.id
            };
        });
    }
    resetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ password, verificationCode }) {
            const validCode = yield verification_model_2.default.findOne({
                code: verificationCode,
                type: "PASSWORD_RESET" /* VerificationEnum.PASSWORD_RESET */,
                expiresAt: { $gt: new Date() }
            });
            if (!validCode)
                throw new catch_errors_1.NotFoundException("Invalid or expired verification verification code");
            const hashedPassword = yield (0, bcrypt_1.hashValue)(password);
            const updateUser = yield user_model_1.default.findByIdAndUpdate(validCode.userId, {
                password: hashedPassword
            });
            if (!updateUser)
                throw new catch_errors_1.BadRequestException("Failed to reset password");
            yield validCode.deleteOne();
            yield session_model_2.default.deleteMany({
                userId: updateUser._id
            });
            return {
                user: updateUser,
            };
        });
    }
    logout(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return session_model_1.default.findByIdAndDelete(sessionId);
        });
    }
}
exports.AuthService = AuthService;
