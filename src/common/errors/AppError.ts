export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface AppErrorOptions {
    statusCode?: number;
    code?: string;
    details?: unknown;
    cause?: unknown;
    logLevel?: LogLevel;
    isOperational?: boolean;
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly status: 'fail' | 'error';
    public readonly code: string;
    public readonly details?: unknown;
    public readonly logLevel: LogLevel;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        {
            statusCode = 500,
            code = 'INTERNAL_SERVER_ERROR',
            details,
            cause,
            logLevel = 'error',
            isOperational = true,
        }: AppErrorOptions = {},
    ) {
        super(message, { cause });

        Object.setPrototypeOf(this, new.target.prototype);

        this.name = new.target.name;
        this.statusCode = statusCode;
        this.status = statusCode < 500 ? 'fail' : 'error';
        this.code = code;
        this.details = details;
        this.logLevel = logLevel;
        this.isOperational = isOperational;

        Error.captureStackTrace?.(this, new.target);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            status: this.status,
            statusCode: this.statusCode,
            details: this.details,
        };
    }
}
