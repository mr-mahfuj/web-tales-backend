import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ForbiddenError, NotFoundError } from '../common/errors.js';
import type { AuthenticatedUser } from '../types/auth.js';
import { Role, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const requireAdmin = (): RequestHandler => requireRole(Role.ADMIN);

export function requireOwnerOrAdmin(
    model: Extract<keyof PrismaClient, string>,
    paramName: string,
    ownerField: string,
): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === Role.ADMIN) {
            next();
            return;
        }

        const resourceId = req.params[paramName];
        if (typeof resourceId !== 'string') {
            next(new NotFoundError('Resource not found'));
            return;
        }

        const delegate = prisma[model] as unknown as {
            findUnique: (args: {
                where: { id: string };
                select: Record<string, true>;
            }) => Promise<Record<string, unknown> | null>;
        };

        const record = await delegate.findUnique({
            where: { id: resourceId },
            select: { [ownerField]: true },
        });

        if (!record) {
            next(new NotFoundError('Resource not found'));
            return;
        }

        if (record[ownerField] === req.user.id) {
            next();
            return;
        }

        next(new ForbiddenError('You can only modify your own resources'));
    };
}

export function requireSelfOrAdmin(): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            next(new ForbiddenError('Authentication required'));
            return;
        }
        if (req.user.role === Role.ADMIN) {
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
