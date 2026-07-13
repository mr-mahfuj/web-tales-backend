import type jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

export interface AccessTokenPayload extends jwt.JwtPayload {
    sub: string;
    role?: Role;
}
