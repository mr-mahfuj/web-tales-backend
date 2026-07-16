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

    async updatePassword(userId: string, hashedPassword: string) {
        return prisma.auth.update({
            where: { userId },
            data: {
                password: hashedPassword,
                passwordLastModificationTime: new Date(),
            },
        });
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

    async consumePasswordChangeToken(userId: string, hashedPassword: string) {
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
