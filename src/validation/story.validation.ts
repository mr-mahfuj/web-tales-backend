import { z } from 'zod';
import { TITLE, BODY } from '../constants/story.constants.js';

const storyIdSchema = z.uuid({
    message: 'Invalid story id',
});

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

export const createStoryBodySchema = z
    .object({
        userId: z.uuid({
            message: 'Invalid user id',
        }),
        title: titleSchema,
        body: bodySchema,
    })
    .strict();

export const updateStoryBodySchema = createStoryBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const storyIdParamsSchema = z.object({
    storyId: storyIdSchema,
});

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
