import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';
import { formatZodIssues } from '../utils/error-formatters.js';

export function validate(schema: z.ZodType): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            return next(
                new ValidationError(
                    'Validation failed',
                    formatZodIssues(result.error.issues),
                    result.error,
                ),
            );
        }

        res.locals.validated = result.data;
        return next();
    };
}
