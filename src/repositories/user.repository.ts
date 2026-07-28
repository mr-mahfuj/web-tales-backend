import type { Prisma, User } from '@prisma/client';
import prisma from '../config/prisma.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/userDTO.js';
import type { ListUsersQuery } from '../schemas/userSchema.js';
import { userListSelect } from '../utils/userSelect.js';

const getUserOrderBy = (
    orderBy?: ListUsersQuery['orderBy'],
): Prisma.UserOrderByWithRelationInput => {
    switch (orderBy) {
        case 'username':
            return { username: 'asc' };
        case 'name':
            return { name: 'asc' };
        case 'email':
            return { email: 'asc' };
        case 'joinDate':
        default:
            return { joinDate: 'desc' };
    }
};

const buildUserWhere = (search?: string): Prisma.UserWhereInput => {
    return {
        isDeleted: false,
        ...(search && {
            OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };
};

export class UserRepository {
    async create(data: CreateUserDTO): Promise<User> {
        return prisma.user.create({ data });
    }

    async findAll(query: ListUsersQuery): Promise<{
        data: Prisma.UserGetPayload<{ select: typeof userListSelect }>[];
        total?: number;
    }> {
        const where = buildUserWhere(query.search);
        const orderBy = getUserOrderBy(query.orderBy);

        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                skip: query.offset,
                take: query.limit,
                select: userListSelect,
            }),
            query.count ? prisma.user.count({ where }) : Promise.resolve(undefined),
        ]);

        return {
            data,
            ...(total !== undefined ? { total } : {}),
        };
    }

    async findById(userId: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: { id: userId, isDeleted: false },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: { email, isDeleted: false },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: { username, isDeleted: false },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return user !== null;
    }

    async existsByUsername(username: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
        return user !== null;
    }

    async existsByEmailExcludingUser(email: string, userId: string): Promise<boolean> {
        const user = await prisma.user.findFirst({
            where: { email, isDeleted: false, NOT: { id: userId } },
            select: { id: true },
        });
        return user !== null;
    }

    async existsByUsernameExcludingUser(username: string, userId: string): Promise<boolean> {
        const user = await prisma.user.findFirst({
            where: { username, isDeleted: false, NOT: { id: userId } },
            select: { id: true },
        });
        return user !== null;
    }

    async update(userId: string, data: UpdateUserDTO): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: data as Prisma.UserUpdateInput,
        });
    }

    async markEmailVerified(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        });
    }

    async softDelete(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { isDeleted: true },
        });
    }
}
