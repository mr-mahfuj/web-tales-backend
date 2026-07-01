import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
<<<<<<< HEAD
import { ConflictError, NotFoundError, ValidationError } from '../common/errors/index.js';
import { UserRepository } from '../repositories/user.repository.js';
=======
import { ConflictError, NotFoundError, ValidationError } from '../errors/index.js';
import type { IUserRepository } from '../interfaces/IUserRepository.js';
import { UserRepository } from '../repositories/user.repo.js';
>>>>>>> 4fe362f (feat: implement global error handling middleware)

export class UserService {
    constructor(private readonly userRepository: IUserRepository = new UserRepository()) {}

<<<<<<< HEAD
=======
    private normalizeUserId(userId: string | string[] | undefined): string {
        if (typeof userId !== 'string') {
            throw new ValidationError('Invalid user ID', { field: 'userId' });
        }

        const normalizedUserId = userId.trim();

        if (!normalizedUserId) {
            throw new ValidationError('Invalid user ID', { field: 'userId' });
        }

        return normalizedUserId;
    }

    private normalizeRequiredText(value: string | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();

        if (!normalizedValue) {
            throw new ValidationError(`${fieldName} is required`, { field: fieldName });
        }

        return normalizedValue;
    }

    private normalizeUpdateData(data: UpdateUserDTO): UpdateUserDTO {
        const normalizedData: UpdateUserDTO = {};

        if (data.username !== undefined) {
            const username = data.username.trim();

            if (!username) {
                throw new ValidationError('username cannot be empty', { field: 'username' });
            }

            normalizedData.username = username;
        }

        if (data.name !== undefined) {
            const name = data.name.trim();

            if (!name) {
                throw new ValidationError('name cannot be empty', { field: 'name' });
            }

            normalizedData.name = name;
        }

        if (data.email !== undefined) {
            const email = data.email.trim();

            if (!email) {
                throw new ValidationError('email cannot be empty', { field: 'email' });
            }

            normalizedData.email = email;
        }

        if (Object.keys(normalizedData).length === 0) {
            throw new ValidationError('At least one field is required');
        }

        return normalizedData;
    }

>>>>>>> 4fe362f (feat: implement global error handling middleware)
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
<<<<<<< HEAD
            throw new NotFoundError('User not found', userId);
        }

        return this.userRepository.update(userId, data);
=======
            throw new NotFoundError('User not found', { userId: normalizedUserId });
        }

        return this.userRepository.update(normalizedUserId, normalizedData);
>>>>>>> 4fe362f (feat: implement global error handling middleware)
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
