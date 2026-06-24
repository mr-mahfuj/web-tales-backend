import type {Prisma} from "@prisma/client";
import prisma from "../config/prisma.js";

export class UserRepository {
    async create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
        });
    }

    async findAll() {
        return prisma.user.findMany({
            where: {
                isDeleted: false,
            }, 
            orderBy: {
                id: "asc",
            },
        });
    }

    async findById(userId: string) {
        return prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email: email,
                isDeleted: false,
            },
        });
    }

    async update(userId: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data,
        });
    }
}
