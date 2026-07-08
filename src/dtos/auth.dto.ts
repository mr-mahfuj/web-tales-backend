import type { z } from 'zod';
import type {
    changePasswordBodySchema,
    loginBodySchema,
    registerBodySchema,
} from '../schemas/auth.schema.js';

export type RegisterDto = z.infer<typeof registerBodySchema>;
export type LoginDto = z.infer<typeof loginBodySchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordBodySchema>;
