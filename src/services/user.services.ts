import { type CreateUserDTO, type UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import { ConflictError, NotFoundError, ValidationError } from '../common/errors.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { ListUsersQuery } from '../validation/user.validation.js';

export class UserService {
    constructor(private readonly userRepository = new UserRepository()) {}

    async createUser(data: CreateUserDTO): Promise<UserDTO> {
        if (!data.username || !data.name || !data.email) {
            throw new ValidationError('username, name, and email are required');
        }

        const existingUser = await this.userRepository.findByEmail(data.email);

        if (existingUser) {
            throw new ConflictError('Email already exists', { field: 'email' });
        }

        return new UserDTO(await this.userRepository.create(data));
    }

    async getAllUsers(query: ListUsersQuery): Promise<{ data: UserDTO[]; total?: number }> {
        const result = await this.userRepository.findAll(query);

        return {
            data: result.data.map((user) => new UserDTO(user)),
            ...(result.total !== undefined ? { total: result.total } : {}),
        };
    }

    async getUserById(userId: string): Promise<UserDTO> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found', { userId: userId });
        }

        return new UserDTO(user);
    }

    async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', userId);
        }

        return new UserDTO(await this.userRepository.update(userId, data));
    }

    async softDelete(userId: string): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', userId);
        }

        return this.userRepository.softDelete(userId);
    }
}
