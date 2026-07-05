import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto.js';
import { UserService } from '../services/user.services.js';

const getValidatedBody = <T>(req: Request): T => req.validatedBody as T;
const getValidatedParams = <T extends Record<string, string>>(req: Request): T =>
    req.validatedParams as T;

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        const user = await userService.createUser(getValidatedBody<CreateUserDTO>(req));

        return res.status(StatusCode.Created).json(user);
    }

    async getAllUsers(_req: Request, res: Response) {
        const users = await userService.getAllUsers();

        return res.status(StatusCode.Ok).json(users);
    }

    async getUserById(req: Request, res: Response) {
        const { userId } = getValidatedParams<{ userId: string }>(req);
        const user = await userService.getUserById(userId);

        return res.status(StatusCode.Ok).json(user);
    }

    async updateUser(req: Request, res: Response) {
        const { userId } = getValidatedParams<{ userId: string }>(req);
        const updatedUser = await userService.updateUser(
            userId,
            getValidatedBody<UpdateUserDTO>(req),
        );

        return res.status(StatusCode.Ok).json(updatedUser);
    }

    async deleteUser(req: Request, res: Response) {
        const { userId } = getValidatedParams<{ userId: string }>(req);
        await userService.softDelete(userId);

        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    }
}
