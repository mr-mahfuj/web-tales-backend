import type { User } from '@prisma/client';
import prisma from '../config/prisma.js';
import type { UserWithAuth } from '../types/userWithAuth.js';

export class AuthRepository {
    async createUserWithAuth(data: UserWithAuth): Promise<User> {
        return prisma.user.create({
            data: {
                username: data.username,
                name: data.name,
                email: data.email,
                ...(data.role ? { role: data.role } : {}),
                ...(data.isEmailVerified ? { isEmailVerified: data.isEmailVerified } : {}),
                auth: {
                    create: {
                        password: data.hashedPassword,
                        passwordLastModificationTime: new Date(),
                    },
                },
            },
        });
    }

    async findAuthByUserId(userId: string) {
        return prisma.auth.findUnique({ where: { userId } });
    }

    async setPasswordChangeToken(userId: string, token: string) {
        return prisma.auth.update({
            where: { userId },
            data: {
                passwordChangeToken: token,
                isPasswordChangeTokenValid: true,
            },
        });
    }

    async invalidatePasswordChangeToken(userId: string) {
        return prisma.auth.update({
            where: { userId },
            data: {
                isPasswordChangeTokenValid: false,
            },
        });
    }

    async changePasswordAndConsumeToken(userId: string, hashedPassword: string) {
        return prisma.auth.update({
            where: { userId },
            data: {
                password: hashedPassword,
                passwordLastModificationTime: new Date(),
                isPasswordChangeTokenValid: false,
            },
        });
    }
}
