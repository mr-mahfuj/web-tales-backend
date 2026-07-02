import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';
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
                const paramsResult = schema.params.safeParse(req.params);

                if (!paramsResult.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(paramsResult.error.issues),
                            paramsResult.error,
                        ),
                    );
                }

                res.locals.validated = { params: paramsResult.data };
            }

            if (schema.body) {
                const bodyResult = schema.body.safeParse(req.body);

                if (!bodyResult.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(bodyResult.error.issues),
                            bodyResult.error,
                        ),
                    );
                }

                res.locals.validated = {
                    ...(res.locals.validated as Record<string, unknown> | undefined),
                    body: bodyResult.data,
                };
            }

            if (schema.query) {
                const queryResult = schema.query.safeParse(req.query);

                if (!queryResult.success) {
                    return next(
                        new ValidationError(
                            'Validation failed',
                            formatZodIssues(queryResult.error.issues),
                            queryResult.error,
                        ),
                    );
                }

                res.locals.validated = {
                    ...(res.locals.validated as Record<string, unknown> | undefined),
                    query: queryResult.data,
                };
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

        res.locals.validated = result.data;
        return next();
    };
}
