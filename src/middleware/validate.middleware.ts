import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../common/errors.js';
import { formatZodIssues } from '../utils/error-formatters.js';

type SplitValidationSchema = {
    params?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
};

function isSplitValidationSchema(
    schema: z.ZodType | SplitValidationSchema,
): schema is SplitValidationSchema {
    return typeof (schema as z.ZodType).safeParse !== 'function';
}

export function validate(schema: z.ZodType | SplitValidationSchema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (isSplitValidationSchema(schema)) {
            if (schema.params) {
                const result = schema.params.safeParse(req.params);
                if (!result.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(result.error.issues),
                            result.error,
                        ),
                    );
                }
                req.params = result.data as Request['params'];
            }
            if (schema.body) {
                const result = schema.body.safeParse(req.body);
                if (!result.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(result.error.issues),
                            result.error,
                        ),
                    );
                }
                req.body = result.data as Request['body'];
            }
            if (schema.query) {
                const result = schema.query.safeParse(req.query);
                if (!result.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(result.error.issues),
                            result.error,
                        ),
                    );
                }
                Object.assign(req.query, result.data);
            }
            return next();
        }

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
        const data = result.data as { body: unknown; params: unknown; query: unknown };
        if (data.body !== undefined) req.body = data.body as Request['body'];
        if (data.params !== undefined) req.params = data.params as Request['params'];
        if (data.query !== undefined) Object.assign(req.query, data.query);
        return next();
    };
}
