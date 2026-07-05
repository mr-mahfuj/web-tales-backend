import { AppError } from './AppError.js';

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
