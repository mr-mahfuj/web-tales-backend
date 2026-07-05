import { type Role } from '@prisma/client';
import type { UserDTO } from '../dtos/user.dto.js';

type PrismaUser = {
    id: string;
    username: string;
    name: string;
    email: string;
    joinDate: Date;
    role: Role;
};

export const toUserDTO = (user: PrismaUser): UserDTO => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    joinDate: user.joinDate,
    role: user.role,
});
