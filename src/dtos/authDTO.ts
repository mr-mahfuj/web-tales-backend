import type { z } from 'zod';
import type {
    changePasswordBodySchema,
    loginBodySchema,
    registerBodySchema,
    resendConfirmationEmailBodySchema,
} from '../schemas/authSchema.js';

export type RegisterDto = z.output<typeof registerBodySchema>;
export type LoginDto = z.output<typeof loginBodySchema>;
export type ChangePasswordDto = z.output<typeof changePasswordBodySchema>;
export type ResendConfirmationEmailDto = z.output<typeof resendConfirmationEmailBodySchema>;
