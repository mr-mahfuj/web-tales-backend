import { AppError } from './AppError.js';

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
