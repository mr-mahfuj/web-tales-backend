import { type CreateUserDTO, type UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import { ConflictError, NotFoundError, ValidationError } from '../common/errors.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { ListUsersQuery } from '../schemas/user.schema.js';

export class UserService {
    userRepository = new UserRepository();
    async createUser(data: CreateUserDTO): Promise<UserDTO> {
        if (await this.userRepository.existsByEmail(data.email)) {
            throw new ConflictError('Email already exists', { field: 'email' });
        }

        if (await this.userRepository.existsByUsername(data.username)) {
            throw new ConflictError('Username already exists', { field: 'username' });
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

    async getUserByEmail(email: string): Promise<UserDTO> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new NotFoundError('User not found', { email: email });
        }

        return new UserDTO(user);
    }

    async getUserByUsername(username: string): Promise<UserDTO> {
        const user = await this.userRepository.findByUsername(username);

        if (!user) {
            throw new NotFoundError('User not found', { username: username });
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
