import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../common/errors.js';
import { env } from '../config/env.js';
import { UserService } from '../services/user.services.js';
import type { UserDTO } from '../dtos/user.dto.js';
import type { Role } from '../constants/role.type.js';

export interface AuthenticatedUser {
    id: string;
    role: Role;
    record?: UserDTO;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
    }
}

declare module 'express' {
    interface Request {
        user?: AuthenticatedUser;
    }
}

interface AccessTokenPayload extends jwt.JwtPayload {
    sub: string;
    role?: Role;
}

const userService = new UserService();

function extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;

    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
}

export async function authenticateToken(
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> {
    const token = extractToken(req);

    if (!token) {
        throw new UnauthorizedError('Missing or malformed authorization header');
    }

    let payload: AccessTokenPayload;
    try {
        payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token has expired');
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        }
        throw err;
    }

    if (!payload.sub) {
        throw new UnauthorizedError('Invalid token payload');
    }

    const record = await userService.getUserById(payload.sub).catch(() => null);

    req.user = {
        id: payload.sub,
        role: payload.role ?? record?.role ?? 'USER',
        ...(record ? { record } : {}),
    };

    next();
}
