import type { z } from 'zod';
import type {
    changePasswordBodySchema,
    loginBodySchema,
    registerBodySchema,
    resendConfirmationEmailBodySchema,
} from '../schemas/authSchema.js';

export type RegisterDTO = z.output<typeof registerBodySchema>;
export type LoginDTO = z.output<typeof loginBodySchema>;
export type ChangePasswordDTO = z.output<typeof changePasswordBodySchema>;
export type ResendConfirmationEmailDTO = z.output<typeof resendConfirmationEmailBodySchema>;
