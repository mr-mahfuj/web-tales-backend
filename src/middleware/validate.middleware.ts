import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import { StatusCode } from '../constants/status-code.enum.js';

type ValidationIssue = {
    field: string;
    message: string;
    code: string;
};

type ValidationErrorResponse = {
    success: false;
    message: string;
    errors: ValidationIssue[];
};

export function validate(schema: z.ZodType): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors: ValidationIssue[] = result.error.issues.map((issue) => ({
                field: issue.path.length > 0 ? issue.path.join('.') : 'request',
                message: issue.message,
                code: issue.code,
            }));

            return res.status(StatusCode.BadRequest).json({
                success: false,
                message: 'Validation failed',
                errors,
            } satisfies ValidationErrorResponse);
        }

        res.locals.validated = result.data;
        return next();
    };
}
