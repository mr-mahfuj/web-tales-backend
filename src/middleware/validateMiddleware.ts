import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import { formatZodIssues } from '../utils/errorFormatters.js';
import type { ValidationSchema, Validated } from '../types/validation.js';

function validateRequest<S extends ValidationSchema>(req: Request, schema: S): Validated<S> {
    const validated: Record<string, unknown> = {};

    if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
            throw new ValidationError(
                ERROR_MESSAGES.VALIDATION_FAILED,
                formatZodIssues(result.error.issues),
                result.error,
            );
        }
        validated.params = result.data;
    }

    if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
            throw new ValidationError(
                ERROR_MESSAGES.VALIDATION_FAILED,
                formatZodIssues(result.error.issues),
                result.error,
            );
        }
        validated.body = result.data;
        req.body = result.data;
    }

    if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
            throw new ValidationError(
                ERROR_MESSAGES.VALIDATION_FAILED,
                formatZodIssues(result.error.issues),
                result.error,
            );
        }
        validated.query = result.data;
    }

    return validated as Validated<S>;
}

export function validate<S extends ValidationSchema>(schema: S): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        req.validated = validateRequest(req, schema);
        next();
    };
}

export function withValidation<S extends ValidationSchema>(
    schema: S,
    handler: (
        req: Request & { validated: Validated<S> },
        res: Response,
        next: NextFunction,
    ) => unknown,
): RequestHandler {
    return (req, res, next) => {
        req.validated = validateRequest(req, schema);
        Promise.resolve(handler(req as Request & { validated: Validated<S> }, res, next)).catch(
            next,
        );
    };
}
