"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
    get status_code() {
        return this.statusCode;
    }
    get error_code() {
        return this.errorCode;
    }
}
exports.AppError = AppError;
