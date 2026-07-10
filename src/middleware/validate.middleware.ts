import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationError } from '../common/errors.js';
import { formatZodIssues } from '../utils/error-formatters.js';
import type { ValidationSchema, Validated } from '../types/validation.type.js'; // ← moved

function validateRequest<S extends ValidationSchema>(req: Request, schema: S): Validated<S> {
    const validated: Record<string, unknown> = {};

    if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
            throw new ValidationError(
                'Validation failed',
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
                'Validation failed',
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
                'Validation failed',
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
        try {
            req.validated = validateRequest(req, schema);
            next();
        } catch (err) {
            next(err);
        }
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
        try {
            req.validated = validateRequest(req, schema);
            Promise.resolve(handler(req as Request & { validated: Validated<S> }, res, next)).catch(
                next,
            );
        } catch (err) {
            next(err);
        }
    };
}
