import { z } from 'zod';
import { NAME, USERNAME } from '../constants/user.js';
import { createListQuerySchema } from './listQuerySchema.js';
import { idSchema } from './idSchema.js';

export const usernameSchema = z
    .string()
    .trim()
    .min(USERNAME.MIN, `Username must be at least ${USERNAME.MIN} characters`)
    .max(USERNAME.MAX, `Username cannot exceed ${USERNAME.MAX} characters`);

const nameSchema = z
    .string()
    .trim()
    .min(NAME.MIN, 'Name is required')
    .max(NAME.MAX, `Name cannot exceed ${NAME.MAX} characters`);

export const emailSchema = z
    .email({
        message: 'Invalid email address',
    })
    .transform((email) => email.trim().toLowerCase());

const userOrderBySchema = z.enum(['joinDate', 'username', 'name', 'email']).default('joinDate');

export const createUserBodySchema = z
    .object({
        username: usernameSchema,
        name: nameSchema,
        email: emailSchema,
    })
    .strict();

export const updateUserBodySchema = createUserBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const updateUserProfileBodySchema = z
    .object({
        name: nameSchema.optional(),
        username: usernameSchema.optional(),
        email: emailSchema.optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const userIdParamsSchema = z.object({
    userId: idSchema,
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export const createUserSchema = {
    body: createUserBodySchema,
};

export const updateUserSchema = {
    params: userIdParamsSchema,
    body: updateUserBodySchema,
};

export const updateUserProfileSchema = {
    body: updateUserProfileBodySchema,
};

export const getUserSchema = {
    params: userIdParamsSchema,
};

export const getUserProfileSchema = getUserSchema;

export const deleteUserSchema = {
    params: userIdParamsSchema,
};

export const listUsersQuerySchema = createListQuerySchema(userOrderBySchema);

export const getAllUsersSchema = {
    query: listUsersQuerySchema,
};

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
