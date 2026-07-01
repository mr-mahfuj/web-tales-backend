import { AppError } from './AppError.js';

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
