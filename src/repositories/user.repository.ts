import { Prisma, type Role } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import prisma from '../config/prisma.js';
import { QUERY_CONSTANTS } from '../constants/pagination.constants.js';
import { toUserDTO } from '../utils/user.mapper.js';
import type { ListUsersQuery } from '../validation/user.validation.js';

type UserSearchRow = {
    id: string;
    username: string;
    name: string;
    email: string;
    joinDate: Date;
    role: Role;
};

const getUserOrderByClause = (orderBy: ListUsersQuery['orderBy']) => {
    switch (orderBy) {
        case 'username':
            return Prisma.sql`u."username" ASC`;
        case 'name':
            return Prisma.sql`u."name" ASC`;
        case 'email':
            return Prisma.sql`u."email" ASC`;
        case 'joinDate':
        default:
            return Prisma.sql`u."joinDate" DESC`;
    }
};

const buildUserWhereClause = (search?: string) => {
    if (!search) {
        return Prisma.sql`WHERE u."isDeleted" = false`;
    }

    return Prisma.sql`WHERE u."isDeleted" = false
        AND (
            similarity(u."username", ${search}) >= ${QUERY_CONSTANTS.FUZZY_SEARCH_THRESHOLD}
            OR similarity(u."name", ${search}) >= ${QUERY_CONSTANTS.FUZZY_SEARCH_THRESHOLD}
            OR similarity(u."email", ${search}) >= ${QUERY_CONSTANTS.FUZZY_SEARCH_THRESHOLD}
        )`;
};

const buildUserOrderClause = (orderBy: ListUsersQuery['orderBy'], search?: string) => {
    if (!search) {
        return Prisma.sql`ORDER BY ${getUserOrderByClause(orderBy)}`;
    }

    return Prisma.sql`ORDER BY GREATEST(
            similarity(u."username", ${search}),
            similarity(u."name", ${search}),
            similarity(u."email", ${search})
        ) DESC, ${getUserOrderByClause(orderBy)}`;
};

export class UserRepository {
    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        return await operation();
    }

    async create(data: CreateUserDTO): Promise<UserDTO> {
        return this.execute(async () => {
            const user = await prisma.user.create({
                data,
            });

            return toUserDTO(user);
        });
    }

    async findAll(query: ListUsersQuery): Promise<{ data: UserDTO[]; total?: number }> {
        return this.execute(async () => {
            const searchTerm = query.search?.trim();
            const whereClause = buildUserWhereClause(searchTerm);
            const orderClause = buildUserOrderClause(query.orderBy, searchTerm);

            const users = await prisma.$queryRaw<UserSearchRow[]>(Prisma.sql`
                SELECT
                    u."id",
                    u."username",
                    u."name",
                    u."email",
                    u."joinDate",
                    u."role"
                FROM "User" u
                ${whereClause}
                ${orderClause}
                OFFSET ${query.offset}
                LIMIT ${query.limit}
            `);

            const totalResult = query.count
                ? await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
                      SELECT COUNT(*)::int AS count
                      FROM "User" u
                      ${whereClause}
                  `)
                : [];

            const total = totalResult[0]?.count;

            return {
                data: users.map(toUserDTO),
                ...(total !== undefined ? { total } : {}),
            };
        });
    }

    async findById(userId: string): Promise<UserDTO | null> {
        return this.execute(async () => {
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                    isDeleted: false,
                },
            });

            return user ? toUserDTO(user) : null;
        });
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        return this.execute(async () => {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                    isDeleted: false,
                },
            });

            return user ? toUserDTO(user) : null;
        });
    }

    async update(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        return this.execute(async () => {
            const user = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: data as Prisma.UserUpdateInput,
            });

            return toUserDTO(user);
        });
    }

    async softDelete(userId: string): Promise<UserDTO> {
        return this.execute(async () => {
            const user = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    isDeleted: true,
                },
            });

            return toUserDTO(user);
        });
    }
}
