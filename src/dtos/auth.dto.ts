import type { z } from 'zod';
import type {
    changePasswordBodySchema,
    loginBodySchema,
    registerBodySchema,
} from '../schemas/auth.schema.js';

export type RegisterDto = z.output<typeof registerBodySchema>;
export type LoginDto = z.output<typeof loginBodySchema>;
export type ChangePasswordDto = z.output<typeof changePasswordBodySchema>;
