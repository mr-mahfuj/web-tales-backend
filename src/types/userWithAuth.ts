import type { Role } from '@prisma/client';

export type UserWithAuth = {
    username: string;
    name: string;
    email: string;
    hashedPassword: string;
    role?: Role;
    isEmailVerified?: boolean;
};
