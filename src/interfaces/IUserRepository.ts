import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';

export interface IUserRepository {
    create(data: CreateUserDTO): Promise<UserDTO>;
    findAll(): Promise<UserDTO[]>;
    findById(id: string): Promise<UserDTO | null>;
    findByEmail(email: string): Promise<UserDTO | null>;
    update(id: string, data: UpdateUserDTO): Promise<UserDTO>;
    softDelete(id: string): Promise<UserDTO>;
}
