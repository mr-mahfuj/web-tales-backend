import type { UserDTO } from '../dtos/userDTO.js';
import type { Role } from '@prisma/client';

export interface AuthenticatedUser {
    id: string;
    role: Role;
    record?: UserDTO;
}
