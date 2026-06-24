import type { Prisma } from "@prisma/client";
import { UserRepository } from "../repositories/user.repo.js";

type CreateUserInput = {
    username: string;
    name: string;
    email: string;
};

type UpdateUserInput = Partial<CreateUserInput>;

export class UserService {
    constructor(private readonly userRepository = new UserRepository()){}

    createUser(data : CreateUserInput) {
        return this.userRepository.create(data);
    }

    getAllUsers() {
        return this.userRepository.findAll();
    }

    getUserById(userId: string) {
        return this.userRepository.findById(userId);
    }

    async updateUser(userId: string, data: UpdateUserInput) {
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