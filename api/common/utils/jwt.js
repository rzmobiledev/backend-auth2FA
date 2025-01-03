"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.signJWTToken = exports.refreshTokenSignOptions = exports.AccessTokenSignOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../../config/app.config");
const defaultJWT = {
    audience: ["user"]
};
exports.AccessTokenSignOptions = {
    expiresIn: app_config_1.config.JWT.EXPIRES_IN,
    secret: app_config_1.config.JWT.SECRET
};
exports.refreshTokenSignOptions = {
    expiresIn: app_config_1.config.JWT.REFRESH_EXPIRES_IN,
    secret: app_config_1.config.JWT.REFRESH_SECRET
};
const signJWTToken = (payload, options) => {
    const _a = options || exports.AccessTokenSignOptions, { secret } = _a, opts = __rest(_a, ["secret"]);
    return jsonwebtoken_1.default.sign(payload, secret, Object.assign(Object.assign({}, defaultJWT), opts));
};
exports.signJWTToken = signJWTToken;
const verifyJwtToken = (token, options) => {
    try {
        const _a = options || exports.refreshTokenSignOptions, { secret = app_config_1.config.JWT.SECRET } = _a, opts = __rest(_a, ["secret"]);
        const payload = jsonwebtoken_1.default.verify(token, secret, Object.assign(Object.assign({}, defaultJWT), opts));
        return { payload };
    }
    catch (error) {
        return { error: error.message };
    }
};
exports.verifyJwtToken = verifyJwtToken;
