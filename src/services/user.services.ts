import type { Prisma } from "@prisma/client";
import type { CreateUserDTO, UpdateUserDTO, UserDTO } from "../dtos/user.dto.js";
import { UserRepository } from "../repositories/user.repo.js";

export class UserService {
    constructor(private readonly userRepository = new UserRepository()) {}

    private normalizeUserId(userId: string | string[] | undefined): string {
        if (typeof userId !== "string") {
            throw new Error("Invalid userId");
        }

        const normalizedUserId = userId.trim();

        if (!normalizedUserId) {
            throw new Error("Invalid userId");
        }

        return normalizedUserId;
    }

    private normalizeRequiredText(value: string | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();

        if (!normalizedValue) {
            throw new Error(`${fieldName} is required`);
        }

        return normalizedValue;
    }

    private normalizeUpdateData(data: UpdateUserDTO): UpdateUserDTO {
        const normalizedData: UpdateUserDTO = {};

        if (data.username !== undefined) {
            const username = data.username.trim();

            if (!username) {
                throw new Error("username cannot be empty");
            }

            normalizedData.username = username;
        }

        if (data.name !== undefined) {
            const name = data.name.trim();

            if (!name) {
                throw new Error("name cannot be empty");
            }

            normalizedData.name = name;
        }

        if (data.email !== undefined) {
            const email = data.email.trim();

            if (!email) {
                throw new Error("email cannot be empty");
            }

            normalizedData.email = email;
        }

        if (Object.keys(normalizedData).length === 0) {
            throw new Error("At least one field is required");
        }

        return normalizedData;
    }

    async createUser(data: CreateUserDTO): Promise<UserDTO> {
        if (!data.username?.trim() || !data.name?.trim() || !data.email?.trim()) {
            throw new Error("username, name, and email are required");
        }

        const username = this.normalizeRequiredText(data.username, "username");
        const name = this.normalizeRequiredText(data.name, "name");
        const email = this.normalizeRequiredText(data.email, "email");

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new Error("Email already exists");
        }

        return this.userRepository.create({
            username,
            name,
            email,
        });
    }

    getAllUsers(): Promise<UserDTO[]> {
        return this.userRepository.findAll();
    }

    async getUserById(userId: string | string[] | undefined): Promise<UserDTO> {
        const normalizedUserId = this.normalizeUserId(userId);
        const user = await this.userRepository.findById(normalizedUserId);

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    async updateUser(userId: string | string[] | undefined, data: UpdateUserDTO): Promise<UserDTO> {
        const normalizedUserId = this.normalizeUserId(userId);
        const normalizedData = this.normalizeUpdateData(data);

        const existingUser = await this.userRepository.findById(normalizedUserId);

        if (!existingUser) {
            throw new Error("User not found");
        }

        return this.userRepository.update(normalizedUserId, normalizedData as Prisma.UserUpdateInput);
    }

    async softDelete(userId: string | string[] | undefined): Promise<UserDTO> {
        const normalizedUserId = this.normalizeUserId(userId);
        const existingUser = await this.userRepository.findById(normalizedUserId);

        if (!existingUser) {
            throw new Error("User not found");
        }

        return this.userRepository.update(normalizedUserId, {
            isDeleted: true,
        });
    }
}