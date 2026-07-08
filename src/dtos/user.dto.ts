import type { Role, User } from '@prisma/client';
import type { z } from 'zod';
import type { createUserBodySchema, updateUserBodySchema } from '../schemas/user.schema.js';

export type CreateUserDTO = z.infer<typeof createUserBodySchema>;
export type UpdateUserDTO = z.infer<typeof updateUserBodySchema>;

export class UserDTO {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly email: string;
    readonly joinDate: Date;
    readonly role: Role;

    constructor(user: User) {
        this.id = user.id;
        this.username = user.username;
        this.name = user.name;
        this.email = user.email;
        this.joinDate = user.joinDate;
        this.role = user.role;
    }
}
