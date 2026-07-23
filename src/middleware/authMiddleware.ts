import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import { env } from '../config/env.js';
import { UserService } from '../services/user.services.js';
import type { AccessTokenPayload } from '../types/authAccessToken.js';
import { Role } from '@prisma/client';

const userService = new UserService();

function extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        const token = header.slice('Bearer '.length).trim();
        if (token.length > 0) return token;
    }

    const cookieToken = req.cookies?.token;
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
        return cookieToken;
    }

    return null;
}

export async function authenticateToken(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    const token = extractToken(req);

    if (!token) {
        throw new UnauthorizedError(ERROR_MESSAGES.MISSING_AUTH_HEADER);
    }

    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;

    if (!payload.sub) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN_PAYLOAD);
    }

    const record = await userService.getUserById(payload.sub).catch(() => null);

    req.user = {
        id: payload.sub,
        role: payload.role ?? record?.role ?? Role.USER,
        ...(record ? { record } : {}),
    };

    next();
}
