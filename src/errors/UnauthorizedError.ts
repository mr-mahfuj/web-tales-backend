import { AppError } from './AppError.js';

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
