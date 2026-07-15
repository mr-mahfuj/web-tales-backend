import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import { ConflictError, NotFoundError, ValidationError } from '../common/errors.js';
import type { RegisterDTO, LoginDTO, ResendConfirmationEmailDTO } from '../dtos/authDTO.js';
import { env } from '../config/env.js';
import { UserService } from './user.services.js';
import { Role } from '@prisma/client';
import { sendVerificationEmail } from '../utils/mailer.js';

const authRepository = new AuthRepository();
const userService = new UserService();

function signToken(userId: string, role: Role = Role.ADMIN) {
    return jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export class AuthService {
    async register(data: RegisterDTO) {
        if (await userService.existsByEmail(data.email)) throw new ConflictError();
        if (await userService.existsByUsername(data.username)) throw new ConflictError();

        const hashedPassword = await bcrypt.hash(data.password, env.saltRounds);

        const user = await authRepository.createUserWithAuth({
            username: data.username,
            name: data.name,
            email: data.email,
            hashedPassword,
        });

        await sendVerificationEmail({
            userId: user.id,
            email: user.email,
            username: user.username,
        });

        return {
            message: 'Registration successful. Please confirm your email address.',
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        };
    }

    async login(data: LoginDTO) {
        const user = await userService.findUserByEmail(data.email);
        if (!user) {
            throw new ValidationError();
        }

        if (!user.isEmailVerified) {
            throw new ValidationError('Please verify your email before logging in.');
        }

        const auth = await authRepository.findAuthByUserId(user.id);
        if (!auth) {
            throw new ValidationError();
        }

        const isPasswordValid = await bcrypt.compare(data.password, auth.password);
        if (!isPasswordValid) {
            throw new ValidationError();
        }

        const token = signToken(user.id, user.role);

        return {
            token,
            user: { id: user.id, username: user.username, name: user.name, email: user.email },
        };
    }

    async confirmEmail(token: string) {
        let payload: { userId?: string; email?: string; type?: string };
        try {
            payload = jwt.verify(token, env.jwtSecret) as {
                userId?: string;
                email?: string;
                type?: string;
            };
        } catch (error) {
            throw new ValidationError('Invalid or expired email confirmation token');
        }

        if (payload.type !== 'email-verification' || !payload.userId || !payload.email) {
            throw new ValidationError('Invalid email confirmation token');
        }

        const user = await userService.findUserByEmail(payload.email);
        if (!user || user.id !== payload.userId) {
            throw new NotFoundError('User not found.');
        }

        if (user.isEmailVerified) {
            return { message: 'Email is already verified.' };
        }

        await userService.markEmailVerified(user.id);

        return { message: 'Email confirmed successfully.' };
    }

    async resendConfirmationEmail(data: ResendConfirmationEmailDTO) {
        const user = await userService.findUserByEmail(data.email);

        if (user && !user.isEmailVerified) {
            await sendVerificationEmail({
                userId: user.id,
                email: user.email,
                username: user.username,
            });
        }

        return {
            message: 'Verification link has been sent.',
        };
    }

    async findAuthByUserId(userId: string) {
        const auth = await authRepository.findAuthByUserId(userId);
        if (!auth) throw new NotFoundError();
        return auth;
    }

    async updatePassword(userId: string, hashedPassword: string) {
        return authRepository.updatePassword(userId, hashedPassword);
    }
}
