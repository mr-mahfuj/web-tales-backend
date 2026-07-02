import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto.js';
import { UserService } from '../services/user.services.js';

const userService = new UserService();

type ValidatedCreateUserRequest = {
    body: CreateUserDTO;
};

type ValidatedUpdateUserRequest = {
    params: {
        userId: string;
    };
    body: UpdateUserDTO;
};

type ValidatedUserParamsRequest = {
    params: {
        userId: string;
    };
};

export class UserController {
    async createUser(req: Request, res: Response) {
        const { body } = res.locals.validated as ValidatedCreateUserRequest;
        const user = await userService.createUser(body);

        return res.status(StatusCode.Created).json(user);
    }

    async getAllUsers(_req: Request, res: Response) {
        const users = await userService.getAllUsers();

        return res.status(StatusCode.Ok).json(users);
    }

    async getUserById(_req: Request, res: Response) {
        const { params } = res.locals.validated as ValidatedUserParamsRequest;
        const user = await userService.getUserById(params.userId);

        return res.status(StatusCode.Ok).json(user);
    }

    async updateUser(_req: Request, res: Response) {
        const { params, body } = res.locals.validated as ValidatedUpdateUserRequest;
        const updatedUser = await userService.updateUser(params.userId, body);

        return res.status(StatusCode.Ok).json(updatedUser);
    }

    async deleteUser(_req: Request, res: Response) {
        const { params } = res.locals.validated as ValidatedUserParamsRequest;
        await userService.softDelete(params.userId);

        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    }
}
