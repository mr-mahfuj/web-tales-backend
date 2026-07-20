import type { RequestHandler } from 'express';
import { ForbiddenError, NotFoundError } from '../common/errors.js';
import type { AuthenticatedUser } from '../types/auth.js';
import { Role, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function requireRole(...roles: AuthenticatedUser['role'][]): RequestHandler {
    return (req, _res, next) => {
        if (!req.user) return next(new ForbiddenError('Authentication required'));
        if (!roles.includes(req.user.role))
            return next(new ForbiddenError('Insufficient permissions'));
        next();
    };
}

export const requireAdmin = (): RequestHandler => requireRole(Role.ADMIN);

export function requireOwnerOrAdmin(
    model: Extract<keyof PrismaClient, string>,
    paramName: string,
    ownerField: string,
): RequestHandler {
    return async (req, _res, next) => {
        if (!req.user) return next(new ForbiddenError('Authentication required'));
        if (req.user.role === Role.ADMIN) return next();

        const resourceId = req.params[paramName];
        if (typeof resourceId !== 'string') return next(new NotFoundError('Resource not found'));

        const record = await (
            prisma[model] as unknown as {
                findUnique: (args: {
                    where: { id: string };
                    select: Record<string, true>;
                }) => Promise<Record<string, unknown> | null>;
            }
        ).findUnique({
            where: { id: resourceId },
            select: { [ownerField]: true },
        });

        if (!record) return next(new NotFoundError('Resource not found'));
        if (record[ownerField] === req.user.id) return next();
        next(new ForbiddenError('You can only modify your own resources'));
    };
}

export function requireSelfOrAdmin(): RequestHandler {
    return (req, _res, next) => {
        if (!req.user) return next(new ForbiddenError('Authentication required'));
        if (req.user.role === Role.ADMIN) return next();
        if (req.params['userId'] === req.user.id) return next();
        next(new ForbiddenError('You can only access your own profile'));
    };
}
