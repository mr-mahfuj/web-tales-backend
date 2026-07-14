import { z } from 'zod';
import { TITLE, BODY, SUMMARY } from '../constants/story.js';
import { CATEGORY } from '../constants/categoryFilter.js';
import { createListQuerySchema } from './listQuerySchema.js';
import { idSchema } from './idSchema.js';

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const titleSchema = z
    .string()
    .trim()
    .min(TITLE.MIN, `Story title must be at least ${TITLE.MIN} characters`)
    .max(TITLE.MAX, `Story title cannot exceed ${TITLE.MAX} characters`);

const bodySchema = z
    .string()
    .trim()
    .min(BODY.MIN, 'Story body is required')
    .max(BODY.MAX, `Story body cannot exceed ${BODY.MAX} characters`);

const storyOrderBySchema = z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt');

const categoryIdsSchema = z.array(idSchema).optional();

export const createStoryBodySchema = z
    .object({
        userId: idSchema,
        title: titleSchema,
        body: bodySchema,
        categoryIds: categoryIdsSchema,
        summary: z
            .string()
            .trim()
            .min(SUMMARY.MIN_CHAR_LENGTH)
            .max(SUMMARY.MAX_CHAR_LENGTH)
            .optional(),
        generateSummary: z.boolean().optional(),
    })
    .strict();

export const updateStoryBodySchema = createStoryBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const storyIdParamsSchema = z.object({
    storyId: idSchema,
});

export type StoryIdParams = z.infer<typeof storyIdParamsSchema>;

export const createStorySchema = {
    body: createStoryBodySchema,
};

export const updateStorySchema = {
    params: storyIdParamsSchema,
    body: updateStoryBodySchema,
};

export const getStorySchema = {
    params: storyIdParamsSchema,
};

export const deleteStorySchema = {
    params: storyIdParamsSchema,
};

export const listStoriesQuerySchema = createListQuerySchema(storyOrderBySchema).extend({
    category: z.preprocess(
        emptyToUndefined,
        z
            .string()
            .trim()
            .min(CATEGORY.MIN, 'Category filter cannot be empty')
            .max(CATEGORY.MAX, 'Category filter is too long')
            .optional(),
    ),
});

export const getAllStoriesSchema = {
    query: listStoriesQuerySchema,
};

export type ListStoriesQuery = z.infer<typeof listStoriesQuerySchema>;
