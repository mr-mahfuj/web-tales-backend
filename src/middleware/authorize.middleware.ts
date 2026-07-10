import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../common/errors.js';
import type { AuthenticatedUser } from '../types/auth.type.js';

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

export type OwnerIdResolver<P extends Record<string, string>> = (
    req: Request<P>,
) => Promise<string | undefined> | string | undefined;

export function requireOwnerOrAdmin<P extends Record<string, string> = Record<string, string>>(
    ownerIdOf: OwnerIdResolver<P>,
): RequestHandler<P> {
    return async (req: Request<P>, _res: Response, next: NextFunction) => {
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

            if (!ownerId) {
                next(new NotFoundError('Resource not found'));
                return;
            }
            if (ownerId === req.user.id) {
                next();
                return;
            }
            next(new ForbiddenError('You can only modify your own resources'));
        } catch (err) {
            next(err);
        }
    };
}

export function requireSelfOrAdmin(): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        const targetUserId = req.params['userId'];
        if (typeof targetUserId === 'string' && targetUserId === req.user.id) {
            next();
            return;
        }
        next(new ForbiddenError('You can only access your own profile'));
    };
}
