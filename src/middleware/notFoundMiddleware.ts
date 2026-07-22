import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { NotFoundError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';

export const notFoundHandler: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    return next(
        new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND, {
            path: req.originalUrl,
            method: req.method,
        }),
    );
};
