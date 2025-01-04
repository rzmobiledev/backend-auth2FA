"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const get_env_1 = require("../common/utils/get-env");
const origin = (0, get_env_1.getEnv)("APP_ORIGIN", "localhost");
const NODE_ENV = (0, get_env_1.getEnv)("NODE_ENV", "development");
const APP_ORIGIN = origin.split(',');
const appConfig = () => ({
    NODE_ENV: NODE_ENV,
    APP_ORIGIN: APP_ORIGIN[0],
    CORS_ORIGIN: APP_ORIGIN,
    FRONTEND_ORIGIN: (0, get_env_1.getEnv)("FRONTEND_ORIGIN"),
    PORT: (0, get_env_1.getEnv)("PORT", "5000"),
    BASE_PATH: (0, get_env_1.getEnv)("BASE_PATH", "/api/v1"),
    MONGO_URI: (0, get_env_1.getEnv)("MONGODB_URI"),
    JWT: {
        SECRET: (0, get_env_1.getEnv)("JWT_SECRET"),
        EXPIRES_IN: (0, get_env_1.getEnv)("JWT_EXPIRES_IN", "1h"),
        REFRESH_SECRET: (0, get_env_1.getEnv)("JWT_REFRESH_SECRET"),
        REFRESH_EXPIRES_IN: (0, get_env_1.getEnv)("JWT_REFRESH_EXPIRES_IN", "1h")
    },
    MAILER_SENDER: (0, get_env_1.getEnv)("MAILER_SENDER"),
    RESEND_API_KEY: (0, get_env_1.getEnv)("RESEND_API_KEY")
});
exports.config = appConfig();
