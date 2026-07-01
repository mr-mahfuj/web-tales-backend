import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto.js';
import { UserService } from '../services/user.services.js';

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        const user = await userService.createUser(req.body as CreateUserDTO);

        return res.status(StatusCode.Created).json(user);
    }

    async getAllUsers(_req: Request, res: Response) {
        const users = await userService.getAllUsers();

        return res.status(StatusCode.Ok).json(users);
    }

    async getUserById(req: Request, res: Response) {
        const user = await userService.getUserById(req.params.userId);

        return res.status(StatusCode.Ok).json(user);
    }

    async updateUser(req: Request, res: Response) {
        const updatedUser = await userService.updateUser(
            req.params.userId,
            req.body as UpdateUserDTO,
        );

        return res.status(StatusCode.Ok).json(updatedUser);
    }

    async deleteUser(req: Request, res: Response) {
        await userService.softDelete(req.params.userId);

        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    }
}
