import { getEnv} from "../common/utils/get-env"

export type JWTType = {
    SECRET: string,
    EXPIRES_IN: string,
    REFRESH_SECRET: string,
    REFRESH_EXPIRES_IN: string
}

export type AppConfig = {
    NODE_ENV: string,
    APP_ORIGIN: string | string[],
    CORS_ORIGIN: string[],
    FRONTEND_ORIGIN: string,
    PORT: string,
    BASE_PATH: string,
    MONGO_URI: string,
    JWT: JWTType,
    MAILER_SENDER: string,
    RESEND_API_KEY: string
}

const origin = getEnv("APP_ORIGIN", "localhost")
const NODE_ENV = getEnv("NODE_ENV", "development")
const APP_ORIGIN = origin.split(',').map((origin: string): string => origin)

const appConfig: () => AppConfig = (): AppConfig => ({
    NODE_ENV: NODE_ENV,
    APP_ORIGIN: APP_ORIGIN[0],
    CORS_ORIGIN: APP_ORIGIN,
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN"),
    PORT: getEnv("PORT", "5000"),
    BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
    MONGO_URI: getEnv("MONGODB_URI"),
    JWT: {
        SECRET: getEnv("JWT_SECRET"),
        EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1h"),
        REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
        REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "1h")
    },
    MAILER_SENDER: getEnv("MAILER_SENDER"),
    RESEND_API_KEY: getEnv("RESEND_API_KEY")
})
export const config:AppConfig = appConfig()
export type appConfigType = ReturnType<typeof appConfig>