import type { Category, Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { type CreateCategoryDTO, type UpdateCategoryDTO } from '../dtos/categoryDTO.js';

export class CategoryRepository {
    async create(data: CreateCategoryDTO): Promise<Category> {
        return prisma.category.create({
            data: {
                name: data.name,
                description: data.description ?? null,
            },
        });
    }

    async findAll(): Promise<Category[]> {
        return prisma.category.findMany();
    }

    async findById(id: string): Promise<Category | null> {
        return prisma.category.findFirst({ where: { id } });
    }

    async findByName(name: string): Promise<Category | null> {
        return prisma.category.findFirst({ where: { name } });
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
        return prisma.category.update({
            where: {
                id: id,
            },
            data: data as Prisma.CategoryUpdateInput,
        });
    }

    async delete(id: string): Promise<boolean> {
        await prisma.category.delete({
            where: { id: id },
        });
        return true;
    }

    async existsById(id: string): Promise<boolean> {
        const category = await prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        return category !== null;
    }

    async existsByName(name: string): Promise<boolean> {
        const category = await prisma.category.findUnique({
            where: { name },
            select: { id: true },
        });
        return category !== null;
    }
}
