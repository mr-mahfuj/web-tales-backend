import type { CreateUserDTO, UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import { ConflictError, NotFoundError } from '../errors/index.js';
import type { IUserRepository } from '../interfaces/IUserRepository.js';
import { UserRepository } from '../repositories/user.repository.js';

export class UserService {
    constructor(private readonly userRepository: IUserRepository = new UserRepository()) {}

    async createUser(data: CreateUserDTO): Promise<UserDTO> {
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
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found', { userId });
        }

        return user;
    }

    async updateUser(userId: string, data: UpdateUserDTO): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', { userId });
        }

        return this.userRepository.update(userId, data);
    }

    async softDelete(userId: string): Promise<UserDTO> {
        const existingUser = await this.userRepository.findById(userId);

        if (!existingUser) {
            throw new NotFoundError('User not found', { userId });
        }

        return this.userRepository.softDelete(userId);
    }
}
