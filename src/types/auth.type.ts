import type { UserDTO } from '../dtos/user.dto.js';
import type { Role } from './role.type.js';

export interface AuthenticatedUser {
    id: string;
    role: Role;
    record?: UserDTO;
}
