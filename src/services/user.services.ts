import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import { ConflictError, NotFoundError, ValidationError } from '../common/errors/index.js';
import { UserRepository } from '../repositories/user.repository.js';

export class UserService {
    constructor(private readonly userRepository = new UserRepository()) {}

    async createUser(data: CreateUserDTO): Promise<UserDTO> {
        if (!data.username?.trim() || !data.name?.trim() || !data.email?.trim()) {
            throw new ValidationError('username, name, and email are required');
        }

        const existingUser = await this.userRepository.findByEmail(data.email);

        if (existingUser) {
            throw new ConflictError('Email already exists', { field: 'email' });
        }

        return this.userRepository.create(data);
    }

    getAllUsers(): Promise<UserDTO[]> {
        return this.userRepository.findAll();
    }

    async getUserById(userId: string): Promise<UserDTO> {
        const normalizedUserId = userId.trim();
        const user = await this.userRepository.findById(normalizedUserId);

        if (!user) {
            throw new NotFoundError('User not found', { userId: normalizedUserId });
        }

        return user;
    }

    async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', userId);
        }

        return this.userRepository.update(userId, data);
    }

    async softDelete(userId: string): Promise<UserDTO> {
        const normalizedUserId = userId.trim();
        const existingUser = await this.userRepository.findById(normalizedUserId);

        if (!existingUser) {
            throw new NotFoundError('User not found', { userId: normalizedUserId });
        }

        return this.userRepository.softDelete(normalizedUserId);
    }
}
