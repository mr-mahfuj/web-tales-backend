import type { Prisma } from "@prisma/client";
import type { UserDTO } from "../dtos/user.dto.js";
import prisma from "../config/prisma.js";

export class UserRepository {
    async create(data: Prisma.UserCreateInput): Promise<UserDTO> {
        return prisma.user.create({
            data,
        });
    }

    async findAll(): Promise<UserDTO[]> {
        return prisma.user.findMany({
            where: {
                isDeleted: false,
            }, 
            orderBy: {
                id: "asc",
            },
        });
    }

    async findById(userId: string): Promise<UserDTO | null> {
        return prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        return prisma.user.findFirst({
            where: {
                email: email,
                isDeleted: false,
            },
        });
    }

    async update(userId: string, data: Prisma.UserUpdateInput): Promise<UserDTO> {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data,
        });
    }
}
