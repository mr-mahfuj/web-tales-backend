import { AppError } from './AppError.js';

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
