import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env.js';

export function generateEmailVerificationToken(userId: string, email: string) {
    return jwt.sign(
        {
            userId,
            email,
            type: 'email-verification',
        },
        env.jwtSecret,
        {
            expiresIn: env.emailConfirmationTokenExpiresIn,
        },
    );
}

export function generatePasswordChangeToken(userId: string, expiresIn: StringValue) {
    return jwt.sign(
        {
            sub: userId,
            type: 'password-change',
        },
        env.jwtSecret,
        {
            expiresIn,
        },
    );
}
