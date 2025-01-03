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
exports.authenticateJWT = exports.setupJwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const catch_errors_1 = require("../utils/catch-errors");
const error_code_enum_1 = require("../enums/error_code.enum");
const app_config_1 = require("../../config/app.config");
const user_module_1 = require("../../modules/user/user.module");
const passport_1 = __importDefault(require("passport"));
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
        (req) => {
            const accessToken = req.cookies.accessToken;
            if (!accessToken)
                throw new catch_errors_1.UnauthorizedException("Unauthorized access token", error_code_enum_1.ErrorCode.AUTH_TOKEN_NOT_FOUND);
            return accessToken;
        }
    ]),
    secretOrKey: app_config_1.config.JWT.SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
    passReqToCallback: true,
};
const setupJwtStrategy = (passport) => {
    // @ts-ignore
    passport.use(new passport_jwt_1.Strategy(options, (req, payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_module_1.userService.findUserById(payload.userId);
            if (!user) {
                return done(null, false);
            }
            req.sessionId = payload.sessionId;
            return done(null, user, payload);
        }
        catch (err) {
            return done(err, false);
        }
    })));
};
exports.setupJwtStrategy = setupJwtStrategy;
exports.authenticateJWT = passport_1.default.authenticate('jwt', { session: false });
