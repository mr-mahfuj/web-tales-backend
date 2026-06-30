import type { Prisma } from "@prisma/client";
import { UserRepository } from "../repositories/user.repo.js";

type CreateUserInput = {
    username?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
};

type UpdateUserInput = Partial<CreateUserInput>;

export class UserService {
    constructor(private readonly userRepository = new UserRepository()){}

    async createUser(data : CreateUserInput) {
        const { username, name, email } = data;

        if (!username || !name || !email) {
            throw new Error("username, name, and email are required");
        }

        const existingUser = await this.userRepository.findByEmail(
            email
        );

        if (existingUser) {
            throw new Error("Email already exists");
        }
        return this.userRepository.create({
            username,
            name,
            email,
        });
    }

    getAllUsers() {
        return this.userRepository.findAll();
    }

    getUserById(userId: string) {
        return this.userRepository.findById(userId);
    }

    async updateUser(userId: string, data: UpdateUserInput) {
        const hasAtLeastOneField = Object.values(data).some((value) => value !== undefined);

        if (!hasAtLeastOneField) {
            throw new Error("At least one field is required");
        }

        const existingUser = await this.userRepository.findById(userId);
        if(!existingUser) {
            return null;
        }
        return this.userRepository.update(userId, data as Prisma.UserUpdateInput);
    }

    async softDelete(userId: string) {
        const existingUser = await this.userRepository.findById(userId);
        if(!existingUser) {
            return null;
        }

        return this.userRepository.update(userId, {
            isDeleted: true,
        });
    }
}