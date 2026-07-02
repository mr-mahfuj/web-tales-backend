import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import prisma from '../config/prisma.js';
import type { IUserRepository } from '../interfaces/IUserRepository.js';

export class UserRepository implements IUserRepository {
    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        return await operation();
    }

    async create(data: CreateUserDTO): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.create({
                data,
            }),
        );
    }

    async findAll(): Promise<UserDTO[]> {
        return this.execute(() =>
            prisma.user.findMany({
                where: {
                    isDeleted: false,
                },
                orderBy: {
                    id: 'asc',
                },
            }),
        );
    }

    async findById(userId: string): Promise<UserDTO | null> {
        return this.execute(() =>
            prisma.user.findFirst({
                where: {
                    id: userId,
                    isDeleted: false,
                },
            }),
        );
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        return this.execute(() =>
            prisma.user.findFirst({
                where: {
                    email,
                    isDeleted: false,
                },
            }),
        );
    }

    async update(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.update({
                where: {
                    id: userId,
                },
                data,
            }),
        );
    }

    async softDelete(userId: string): Promise<UserDTO> {
        return this.execute(() =>
            prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    isDeleted: true,
                },
            }),
        );
    }
}
