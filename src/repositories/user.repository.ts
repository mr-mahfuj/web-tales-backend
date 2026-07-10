import type { Prisma, User } from '@prisma/client';
import prisma from '../config/prisma.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto.js';
import type { ListUsersQuery } from '../schemas/user.schema.js';
import { userListSelect } from '../types/user.select.js';

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

const getUserWhere = (search?: string): Prisma.UserWhereInput => {
    const trimmed = search?.trim();

    return {
        isDeleted: false,
        ...(trimmed && {
            OR: [
                { username: { contains: trimmed, mode: 'insensitive' } },
                { name: { contains: trimmed, mode: 'insensitive' } },
                { email: { contains: trimmed, mode: 'insensitive' } },
            ],
        }),
    };
};

const userListSelect = {
    id: true,
    username: true,
    name: true,
    email: true,
    joinDate: true,
    role: true,
    isDeleted: true,
} satisfies Prisma.UserSelect;

export class UserRepository {
    async create(data: CreateUserDTO): Promise<User> {
        return prisma.user.create({ data });
    }

    async findAll(query: ListUsersQuery): Promise<{
        data: Prisma.UserGetPayload<{ select: typeof userListSelect }>[];
        total?: number;
    }> {
        const where = getUserWhere(query.search);
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

    async update(userId: string, data: UpdateUserDTO): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: data as Prisma.UserUpdateInput,
        });
    }

    async softDelete(userId: string): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: { isDeleted: true },
        });
    }
}
