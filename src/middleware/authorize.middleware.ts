import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ForbiddenError } from '../common/errors.js';
import type { AuthenticatedUser } from './auth.middleware.js';

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

export function requireOwnerOrAdmin(
    ownerIdOf: (req: Request) => string | string[] | undefined,
): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === 'ADMIN') {
            next();
            return;
        }
        const ownerId = ownerIdOf(req);
        const matched = typeof ownerId === 'string' && ownerId === req.user.id;
        if (matched) {
            next();
            return;
        }
        next(new ForbiddenError('You can only modify your own resources'));
    };
}
