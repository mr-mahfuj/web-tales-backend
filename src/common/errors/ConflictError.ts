import { AppError } from './AppError.js';

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
