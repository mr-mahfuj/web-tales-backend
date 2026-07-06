import type { Prisma } from '@prisma/client';
import { type User } from '@prisma/client';
import prisma from '../config/prisma.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto.js';
import type { ListUsersQuery } from '../validation/user.validation.js';

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

export class UserRepository {
    async create(data: CreateUserDTO): Promise<User> {
        return prisma.user.create({ data });
    }

    async findAll(query: ListUsersQuery): Promise<{ data: User[]; total?: number }> {
        const where = getUserWhere(query.search);
        const orderBy = getUserOrderBy(query.orderBy);

        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                skip: query.offset,
                take: query.limit,
                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    joinDate: true,
                    role: true,
                    isDeleted: true,
                },
            }),
            query.count ? prisma.user.count({ where }) : Promise.resolve(undefined),
        ]);

        return {
            data,
            ...(total !== undefined && { total }),
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
