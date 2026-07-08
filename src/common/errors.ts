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

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 400,
            code: 'BAD_REQUEST',
            details,
            cause,
            logLevel: 'warn',
        });
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 409,
            code: 'CONFLICT',
            details,
            cause,
            logLevel: 'warn',
        });
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database Error', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 500,
            code: 'DATABASE_ERROR',
            details,
            cause,
            logLevel: 'error',
        });
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 403,
            code: 'FORBIDDEN',
            details,
            cause,
            logLevel: 'warn',
        });
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            details,
            cause,
            logLevel: 'error',
        });
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 404,
            code: 'NOT_FOUND',
            details,
            cause,
            logLevel: 'info',
        });
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 401,
            code: 'UNAUTHORIZED',
            details,
            cause,
            logLevel: 'warn',
        });
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation Failed', details?: unknown, cause?: unknown) {
        super(message, {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details,
            cause,
            logLevel: 'warn',
        });
    }
}
