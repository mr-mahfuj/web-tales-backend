import { z } from 'zod';
import { PASSWORD } from '../constants/auth.js';
import { usernameSchema, emailSchema } from './userSchema.js';

const passwordSchema = z
    .string()
    .min(PASSWORD.MIN, `Password must be at least ${PASSWORD.MIN} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

export const registerBodySchema = z
    .object({
        username: usernameSchema,
        name: z.string().trim().min(PASSWORD.REQUIRED, 'Name is required'),
        email: emailSchema,
        password: passwordSchema,
    })
    .strict();

export const loginBodySchema = z
    .object({
        email: emailSchema,
        password: z.string().min(PASSWORD.REQUIRED, 'Password is required'),
    })
    .strict();

export const changePasswordBodySchema = z
    .object({
        oldPassword: z.string().min(PASSWORD.REQUIRED, 'Old password is required'),
        newPassword: passwordSchema,
    })
    .strict()
    .refine((data) => data.oldPassword !== data.newPassword, {
        message: 'New password must be different from the old password',
        path: ['newPassword'],
    });

export const registerSchema = { body: registerBodySchema };
export const loginSchema = { body: loginBodySchema };
export const changePasswordSchema = { body: changePasswordBodySchema };

export const resendConfirmationEmailBodySchema = z
    .object({
        email: emailSchema,
    })
    .strict();

export const resendConfirmationEmailSchema = {
    body: resendConfirmationEmailBodySchema,
};

export type ResendConfirmationEmailDTO = z.output<typeof resendConfirmationEmailBodySchema>;
