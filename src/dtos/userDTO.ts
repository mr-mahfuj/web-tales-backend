import type { Role, User } from '@prisma/client';
import type { z } from 'zod';
import type { createUserBodySchema, updateUserBodySchema } from '../schemas/userSchema.js';

export type CreateUserDTO = z.output<typeof createUserBodySchema>;
export type UpdateUserDTO = z.output<typeof updateUserBodySchema>;
export type UpdateUserProfileDTO = z.output<typeof updateUserBodySchema>;

type UserLike = Pick<User, 'id' | 'username' | 'name' | 'email' | 'joinDate' | 'role'>;

export class UserDTO {
    readonly id: string;
    readonly username: string;
    readonly name: string;
    readonly email: string;
    readonly joinDate: Date;
    readonly role: Role;

    constructor(user: UserLike) {
        this.id = user.id;
        this.username = user.username;
        this.name = user.name;
        this.email = user.email;
        this.joinDate = user.joinDate;
        this.role = user.role;
    }
}
