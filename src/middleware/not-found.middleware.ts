import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { NotFoundError } from '../common/errors/NotFoundError.js';

export const notFoundHandler: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    return next(
        new NotFoundError('Route not found', {
            path: req.originalUrl,
            method: req.method,
        }),
    );
};
