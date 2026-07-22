import type { z } from 'zod';
import type {
    confirmPasswordChangeBodySchema,
    initiatePasswordChangeBodySchema,
    loginBodySchema,
    registerBodySchema,
    resendConfirmationEmailBodySchema,
} from '../schemas/authSchema.js';

export type RegisterDTO = z.output<typeof registerBodySchema>;
export type LoginDTO = z.output<typeof loginBodySchema>;
export type InitiatePasswordChangeDTO = z.output<typeof initiatePasswordChangeBodySchema>;
export type ConfirmPasswordChangeDTO = z.output<typeof confirmPasswordChangeBodySchema>;
export type ResendConfirmationEmailDTO = z.output<typeof resendConfirmationEmailBodySchema>;
