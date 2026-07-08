import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../common/errors.js';
import type { AuthenticatedUser } from './auth.middleware.js';

export type OwnerIdResolver = (
    req: Request,
) => string | string[] | undefined | Promise<string | string[] | undefined>;

export function requireRole(...roles: AuthenticatedUser['role'][]): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new ForbiddenError('Insufficient permissions'));
            return;
        }
        next();
    };
}

export function requireOwnerOrAdmin(ownerIdOf: OwnerIdResolver): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }

        try {
            const ownerId = await ownerIdOf(req);

            if (ownerId === undefined || ownerId === null) {
                next(new NotFoundError('Resource not found'));
                return;
            }

            const matched =
                typeof ownerId === 'string'
                    ? ownerId === req.user.id
                    : ownerId.includes(req.user.id);

            if (matched) {
                next();
                return;
            }
            next(new ForbiddenError('You can only modify your own resources'));
        } catch (err) {
            next(err);
        }
    };
}

export function requireSelfOrAdmin(paramName = 'userId'): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        const targetUserId = req.params[paramName];
        if (targetUserId && targetUserId === req.user.id) {
            next();
            return;
        }
        next(new ForbiddenError('You can only access your own profile'));
    };
}
