import type { z } from 'zod';
import type {
    createCategoryBodySchema,
    updateCategoryBodySchema,
} from '../schemas/categorySchema.js';
import type { Category } from '@prisma/client';

export type CreateCategoryDTO = z.output<typeof createCategoryBodySchema>;
export type UpdateCategoryDTO = z.output<typeof updateCategoryBodySchema>;

export class CategoryDTO {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly createdAt: Date;

    constructor(category: Category) {
        this.id = category.id;
        this.name = category.name;
        this.description = category.description;
        this.createdAt = category.createdAt;
    }
}
