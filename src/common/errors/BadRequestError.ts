import { AppError } from './AppError.js';

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
