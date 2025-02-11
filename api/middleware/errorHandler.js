"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_config_1 = require("../config/http.config");
const AppError_1 = require("../common/utils/AppError");
const zod_1 = require("zod");
const cookie_1 = require("../common/utils/cookie");
const formatZodError = (res, error) => {
    var _a;
    const errors = (_a = error === null || error === void 0 ? void 0 : error.issues) === null || _a === void 0 ? void 0 : _a.map(err => ({
        field: err.path.join("."),
        message: err.message
    }));
    return res.status(http_config_1.HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation failed.",
        errors: errors
    });
};
const errorHandler = (error, req, res, next) => {
    if (req.path === cookie_1.REFRESH_PATH)
        (0, cookie_1.clearAuthenticationCookies)(res);
    if (error instanceof SyntaxError)
        return res.status(http_config_1.HTTP_STATUS.BAD_REQUEST).json({
            message: "Invalid JSON format, please check your request body"
        });
    if (error instanceof zod_1.z.ZodError)
        return formatZodError(res, error);
    if (error instanceof AppError_1.AppError) {
        return res.status(error.status_code).json({
            message: error.message,
            errorCode: error.error_code
        });
    }
    return res.status(http_config_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        errorCode: (error === null || error === void 0 ? void 0 : error.message) || "Unknown Error"
    });
};
exports.errorHandler = errorHandler;
