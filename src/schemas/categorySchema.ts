import { z } from 'zod';
import { idSchema } from './idSchema.js';

const nameSchema = z.string().trim().min(1, 'Category name must be provided.');

const descriptionSchema = z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
    z.string().trim().nullable(),
);

export const createCategoryBodySchema = z
    .object({
        name: nameSchema,
        description: descriptionSchema.default(null),
    })
    .strict();

export const updateCategoryBodySchema = createCategoryBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const categoryIdParamsSchema = z.object({
    categoryId: idSchema,
});

export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;

export const createCategorySchema = {
    body: createCategoryBodySchema,
};

export const updateCategorySchema = {
    params: categoryIdParamsSchema,
    body: updateCategoryBodySchema,
};

export const getCategorySchema = {
    params: categoryIdParamsSchema,
};

export const deleteCategorySchema = {
    params: categoryIdParamsSchema,
};
