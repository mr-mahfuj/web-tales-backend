import type { Request, Response } from "express";
import { UserService } from "../services/user.services.js";

type CreateUserInput = {
    username: string;
    name: string;
    email: string;
};

type UpdateUserInput = Partial<CreateUserInput>;

const userService = new UserService();

function parseUserId(value: unknown) {
    if (typeof value !== "string") {
        return null;
    }

    const userId = value.trim();

    if (!userId) {
        return null;
    }

    return userId;
}

function formatToDhaka(date: Date | string) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(date));
}

function formatUser(user: any) {
    if (!user) return user;

    const out = {
        ...user,
        joinDate: user.joinDate ? formatToDhaka(user.joinDate) : user.joinDate,
    } as any;

    if (user.auth && user.auth.passwordLastModificationTime) {
        out.auth = {
            ...user.auth,
            passwordLastModificationTime: formatToDhaka(user.auth.passwordLastModificationTime),
        };
    }

    return out;
}

export class UserController {
    async createUser(req: Request, res: Response) {
        const { username, name, email } = req.body as Partial<CreateUserInput>;

        if (!username || !name || !email) {
            return res.status(400).json({
                message: "username, name, and email are required",
            });
        }

        const user = await userService.createUser({
            username,
            name,
            email,
        });

        return res.status(201).json(formatUser(user));
    }

    async getAllUsers(_req: Request, res: Response) {
        const users = await userService.getAllUsers();
        return res.status(200).json(users.map(formatUser));
    }

    async getUserById(req: Request, res: Response) {
        const userId = parseUserId(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                message: "Invalid userId",
            });
        }

        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(formatUser(user));
    }

    async updateUser(req: Request, res: Response) {
        const userId = parseUserId(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                message: "Invalid userId",
            });
        }

        const { username, name, email } = req.body as Partial<CreateUserInput>;
        const updateData: UpdateUserInput = {};

        if (username !== undefined) updateData.username = username;
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "At least one field is required",
            });
        }

        const updatedUser = await userService.updateUser(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json(formatUser(updatedUser));
    }

    async deleteUser(req: Request, res: Response) {
        const userId = parseUserId(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                message: "Invalid userId",
            });
        }

        const deletedUser = await userService.softDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
        });
    }
}