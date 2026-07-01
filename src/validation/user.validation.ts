import { z } from 'zod';

const USERNAME_MIN = 3;
const USERNAME_MAX = 50;
const NAME_MAX = 100;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const userIdSchema = z.uuid({
    message: 'Invalid user id',
});

const usernameSchema = z
    .string()
    .trim()
    .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
    .max(USERNAME_MAX, `Username cannot exceed ${USERNAME_MAX} characters`);

const nameSchema = z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(NAME_MAX, `Name cannot exceed ${NAME_MAX} characters`);

const emailSchema = z
    .email({
        message: 'Invalid email address',
    })
    .transform((email) => email.trim().toLowerCase());

const createUserBodySchema = z
    .object({
        username: usernameSchema,
        name: nameSchema,
        email: emailSchema,
    })
    .strict();

const updateUserBodySchema = createUserBodySchema
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
        message: 'At least one field must be provided',
    });

export const createUserSchema = z.strictObject({
    body: createUserBodySchema,
});

export const updateUserSchema = z.strictObject({
    params: z.strictObject({
        userId: userIdSchema,
    }),
    body: updateUserBodySchema,
});

export const getUserSchema = z.strictObject({
    params: z.strictObject({
        userId: userIdSchema,
    }),
});

export const listUsersSchema = z.strictObject({
    query: z.strictObject({
        page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
        limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    }),
});
