import type { Prisma } from '@prisma/client';

export const userListSelect = {
    id: true,
    username: true,
    name: true,
    email: true,
    joinDate: true,
    role: true,
    isDeleted: true,
} satisfies Prisma.UserSelect;

export const userDetailSelect = {
    ...userListSelect,
    isEmailVerified: true,
} satisfies Prisma.UserSelect;
