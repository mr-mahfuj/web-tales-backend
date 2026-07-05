import type { Role } from '@prisma/client';
import type { z } from 'zod';
import type { createUserBodySchema, updateUserBodySchema } from '../validation/user.validation.js';

export type CreateUserDTO = z.infer<typeof createUserBodySchema>;
export type UpdateUserDTO = z.infer<typeof updateUserBodySchema>;

export interface UserDTO {
    id: string;
    username: string;
    name: string;
    email: string;
    joinDate: Date;
    role: Role;
}
