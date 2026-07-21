import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import {
    ConflictError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import type {
    ConfirmPasswordChangeDTO,
    InitiatePasswordChangeDTO,
    LoginDTO,
    RegisterDTO,
    ResendConfirmationEmailDTO,
} from '../dtos/authDTO.js';
import { env } from '../config/env.js';
import { UserService } from './user.services.js';
import { Role } from '@prisma/client';
import {
    sendPasswordChangeConfirmationEmail,
    sendPasswordChangedNotification,
    sendVerificationEmail,
} from '../utils/mailer.js';
import { generatePasswordChangeToken } from '../utils/emailTokenGenerator.js';

const authRepository = new AuthRepository();
const userService = new UserService();

function signToken(userId: string, role: Role = Role.ADMIN) {
    return jwt.sign({ sub: userId, role }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
    });
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
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
            },
        };
    }

    async login(data: LoginDTO) {
        const user = await userService.findUserByEmail(data.email);
        if (!user) throw new UnauthorizedError();

        if (!user.isEmailVerified) throw new UnauthorizedError();

        const auth = await authRepository.findAuthByUserId(user.id);
        if (!auth) throw new UnauthorizedError();

        const isPasswordValid = await bcrypt.compare(data.password, auth.password);
        if (!isPasswordValid) throw new ValidationError();

        const token = signToken(user.id, user.role);

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
            },
        };
    }

    async confirmEmail(token: string) {
        const payload = jwt.verify(token, env.jwtSecret) as {
            userId?: string;
            email?: string;
            type?: string;
        };

        if (payload.type !== 'email-verification' || !payload.userId || !payload.email) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_EMAIL_CONFIRMATION_TOKEN);
        }

        const user = await userService.findUserByEmail(payload.email);
        if (!user || user.id !== payload.userId) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        await userService.markEmailVerified(user.id);
    }

    async resendConfirmationEmail(data: ResendConfirmationEmailDTO) {
        const user = await userService.findUserByEmail(data.email);

        if (!user) throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        if (user.isEmailVerified) {
            throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        await sendVerificationEmail({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
    }

    async initiatePasswordChange(userId: string, data: InitiatePasswordChangeDTO) {
        const auth = await this.findAuthByUserId(userId);

        const isPasswordValid = await bcrypt.compare(data.oldPassword, auth.password);
        if (!isPasswordValid) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_OLD_PASSWORD);
        }

        const user = await userService.getUserById(userId);

        const token = generatePasswordChangeToken(userId, env.passwordChangeTokenExpiresIn);

        await authRepository.setPasswordChangeToken(userId, token);

        await sendPasswordChangeConfirmationEmail({
            userId,
            email: user.email,
            username: user.username,
            token,
        });
    }

    async validatePasswordChangeToken(token: string) {
        const payload = this.verifyPasswordChangeJwt(token);

        const auth = await this.findAuthByUserId(payload.sub!);

        if (auth.passwordChangeToken !== token || !auth.isPasswordChangeTokenValid) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_OR_EXPIRED_PASSWORD_CHANGE_TOKEN);
        }

        return {
            token,
        };
    }

    async confirmPasswordChange(data: ConfirmPasswordChangeDTO) {
        const payload = this.verifyPasswordChangeJwt(data.token);

        const auth = await this.findAuthByUserId(payload.sub!);

        if (auth.passwordChangeToken !== data.token || !auth.isPasswordChangeTokenValid) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_OR_EXPIRED_PASSWORD_CHANGE_TOKEN);
        }

        const isSameAsCurrent = await bcrypt.compare(data.newPassword, auth.password);
        if (isSameAsCurrent) {
            throw new ValidationError(ERROR_MESSAGES.PASSWORD_MUST_BE_DIFFERENT);
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, env.saltRounds);

        await authRepository.changePasswordAndConsumeToken(payload.sub!, hashedPassword);

        const user = await userService.getUserById(payload.sub!);

        await sendPasswordChangedNotification({
            email: user.email,
            username: user.username,
        });
    }

    private verifyPasswordChangeJwt(token: string): {
        sub?: string;
        type?: string;
    } {
        const payload = jwt.verify(token, env.jwtSecret) as {
            sub?: string;
            type?: string;
        };

        if (payload.type !== 'password-change' || !payload.sub) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_PASSWORD_CHANGE_TOKEN);
        }

        return payload;
    }

    async findAuthByUserId(userId: string) {
        const auth = await authRepository.findAuthByUserId(userId);
        if (!auth) throw new NotFoundError();
        return auth;
    }
}
