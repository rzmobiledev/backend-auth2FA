import {AppError} from "./AppError";
import {ErrorCode} from "../enums/error_code.enum";
import {HTTP_STATUS} from "../../config/http.config";

export class NotFoundException extends AppError {

    constructor(
        message: string = "Resource Not Found",
        errorCode?: ErrorCode,
        statusCode?: number
    ) {
        super(message, errorCode || ErrorCode.RESOURCE_NOT_FOUND, statusCode || HTTP_STATUS.NOT_FOUND);
    }
}

export class UnauthorizedException extends AppError {
    constructor(
        message = "Unauthorized Access",
        errorCode?: ErrorCode,
        statusCode?: number,
    ) {
        super(message, errorCode || ErrorCode.ACCESS_UNAUTHORIZED, statusCode || HTTP_STATUS.UNAUTHORIZED, );
    }
}

export class BadRequestException extends AppError {
    constructor(
        message = "Bad Request",
        errorCode?: ErrorCode,
        statusCode?: number,
    ) {
        super(message, errorCode || ErrorCode.BAD_REQUEST, statusCode || HTTP_STATUS.BAD_REQUEST);
    }
}

export class InternalServerError extends AppError {
    constructor(
        message = "Internal Server Error",
        errorCode?: ErrorCode.INTERNAL_SERVER_ERROR,
        statusCode?: number
    ) {
        super(message, errorCode || ErrorCode.INTERNAL_SERVER_ERROR, statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export class HttpException extends AppError {
    constructor(
        message = "Http Exception Error",
        errorCode?: ErrorCode,
        statusCode?: number
    ) {
        super(message, errorCode || ErrorCode.AUTH_TOO_MANY_ATTEMPTS, statusCode || HTTP_STATUS.TOO_MANY_REQUEST);
    }
}

export class InternalServerException extends AppError {
    constructor(
        message= "Internal Server Error",
        errorCode?: ErrorCode,
        statusCode?: number
    ) {
        super(
            message,
            errorCode || ErrorCode.INTERNAL_SERVER_ERROR,
            statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}
