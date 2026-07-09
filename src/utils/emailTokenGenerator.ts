import jwt from 'jsonwebtoken';
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
            expiresIn: '2m',
        },
    );
}
