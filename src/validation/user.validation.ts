import { z } from 'zod';
import { NAME, USERNAME } from '../constants/user.constants.js';

const userIdSchema = z.uuid({
    message: 'Invalid user id',
});

const usernameSchema = z
    .string()
    .trim()
    .min(USERNAME.MIN, `Username must be at least ${USERNAME.MIN} characters`)
    .max(USERNAME.MAX, `Username cannot exceed ${USERNAME.MAX} characters`);

const nameSchema = z
    .string()
    .trim()
    .min(NAME.MIN, 'Name is required')
    .max(NAME.MAX, `Name cannot exceed ${NAME.MAX} characters`);

const emailSchema = z
    .email({
        message: 'Invalid email address',
    })
    .transform((email) => email.trim().toLowerCase());

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

export const userIdParamsSchema = z.object({
    userId: userIdSchema,
});

export const createUserSchema = {
    body: createUserBodySchema,
};

export const updateUserSchema = {
    params: userIdParamsSchema,
    body: updateUserBodySchema,
};

export const getUserSchema = {
    params: userIdParamsSchema,
};

export const deleteUserSchema = {
    params: userIdParamsSchema,
};
