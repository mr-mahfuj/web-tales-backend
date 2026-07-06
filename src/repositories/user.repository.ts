import type { Prisma } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import prisma from '../config/prisma.js';
import { toUserDTO } from '../utils/user.mapper.js';

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

    async findAll(): Promise<UserDTO[]> {
        return this.execute(async () => {
            const users = await prisma.user.findMany({
                where: {
                    isDeleted: false,
                },
                orderBy: {
                    id: 'asc',
                },
            });

            return users.map(toUserDTO);
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
