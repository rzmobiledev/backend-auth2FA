import {ErrorCode} from "../enums/error_code.enum";

export class AppError extends Error {
    private statusCode: number
    private errorCode?: string

    constructor(
        message: string,
        errorCode: ErrorCode | undefined,
        statusCode: number
    ) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

    public get status_code(){
        return this.statusCode;
    }

    public get error_code() {
        return this.errorCode
    }
}