"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerException = exports.HttpException = exports.InternalServerError = exports.BadRequestException = exports.UnauthorizedException = exports.NotFoundException = void 0;
const AppError_1 = require("./AppError");
const error_code_enum_1 = require("../enums/error_code.enum");
const http_config_1 = require("../../config/http.config");
class NotFoundException extends AppError_1.AppError {
    constructor(message = "Resource Not Found", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.RESOURCE_NOT_FOUND, statusCode || http_config_1.HTTP_STATUS.NOT_FOUND);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends AppError_1.AppError {
    constructor(message = "Unauthorized Access", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.ACCESS_UNAUTHORIZED, statusCode || http_config_1.HTTP_STATUS.UNAUTHORIZED);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class BadRequestException extends AppError_1.AppError {
    constructor(message = "Bad Request", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.BAD_REQUEST, statusCode || http_config_1.HTTP_STATUS.BAD_REQUEST);
    }
}
exports.BadRequestException = BadRequestException;
class InternalServerError extends AppError_1.AppError {
    constructor(message = "Internal Server Error", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.INTERNAL_SERVER_ERROR, statusCode || http_config_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
exports.InternalServerError = InternalServerError;
class HttpException extends AppError_1.AppError {
    constructor(message = "Http Exception Error", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.AUTH_TOO_MANY_ATTEMPTS, statusCode || http_config_1.HTTP_STATUS.TOO_MANY_REQUEST);
    }
}
exports.HttpException = HttpException;
class InternalServerException extends AppError_1.AppError {
    constructor(message = "Internal Server Error", errorCode, statusCode) {
        super(message, errorCode || error_code_enum_1.ErrorCode.INTERNAL_SERVER_ERROR, statusCode || http_config_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
exports.InternalServerException = InternalServerException;
