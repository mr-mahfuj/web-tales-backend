import type { Role } from '@prisma/client';

export interface CreateUserDTO {
    username: string;
    name: string;
    email: string;
}

export interface UpdateUserDTO {
    username?: string;
    name?: string;
    email?: string;
}

export interface UserDTO {
    id: string;
    username: string;
    name: string;
    email: string;
    joinDate: Date;
    role: Role;
    isDeleted: boolean;
}
