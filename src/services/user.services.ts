import type { User } from '@prisma/client';
import {
    type CreateUserDTO,
    type UpdateUserDTO,
    type UpdateUserProfileDTO,
    UserDTO,
} from '../dtos/userDTO.js';
import { ConflictError, NotFoundError } from '../common/errors.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { ListUsersQuery } from '../schemas/userSchema.js';
import { toListResponse, type ListResponse } from '../utils/paginationMapper.js';

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

    async getAllUsers(query: ListUsersQuery): Promise<ListResponse<UserDTO>> {
        const result = await this.userRepository.findAll(query);

        return toListResponse(
            result.data.map((user) => new UserDTO(user)),
            query,
            result.total,
        );
    }

    async getUserById(userId: string): Promise<UserDTO> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found', { userId });
        }

        return new UserDTO(user);
    }

    async getUserByEmail(email: string): Promise<UserDTO> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new NotFoundError('User not found', { email });
        }

        return new UserDTO(user);
    }

    getUserProfile(userId: string): Promise<UserDTO> {
        return this.getUserById(userId);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async markEmailVerified(userId: string): Promise<UserDTO> {
        const user = await this.userRepository.markEmailVerified(userId);
        return new UserDTO(user);
    }

    async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', { userId });
        }

        return new UserDTO(await this.userRepository.update(userId, data));
    }

    updateUserProfile(userId: string, data: UpdateUserProfileDTO): Promise<UserDTO> {
        return this.updateUser(userId, data);
    }

    async softDelete(userId: string): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', { userId });
        }

        return new UserDTO(await this.userRepository.softDelete(userId));
    }

    existsByUsername(username: string): Promise<boolean> {
        return this.userRepository.existsByUsername(username);
    }

    existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.existsByEmail(email);
    }
}
