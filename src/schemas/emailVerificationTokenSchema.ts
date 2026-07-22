import { z } from 'zod';

const emailVerificationTokenParamsSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

export const emailVerificationTokenSchema = {
    params: emailVerificationTokenParamsSchema,
};
