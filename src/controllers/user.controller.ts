import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import { UserService } from '../services/user.services.js';
import { toListResponse } from '../utils/list-response.js';
import type { ListUsersQuery } from '../schemas/user.schema.js';

const userService = new UserService();

export const UserController = {
    getAllUsers: async (req: Request, res: Response) => {
        const query = req.query as unknown as ListUsersQuery;
        const result = await userService.getAllUsers(query);
        return res
            .status(StatusCode.Ok)
            .json(toListResponse<UserDTO>(result.data, query, result.meta.total));
    },

    getUserById: async (req: Request, res: Response) => {
        const { userId } = req.params as { userId: string };
        const user = await userService.getUserById(userId);
        return res.status(StatusCode.Ok).json(user);
    },

    updateUser: async (req: Request, res: Response) => {
        const { userId } = req.params as { userId: string };
        const updatedUser = await userService.updateUser(userId, req.body as UpdateUserDTO);
        return res.status(StatusCode.Ok).json(updatedUser);
    },

    deleteUser: async (req: Request, res: Response) => {
        const { userId } = req.params as { userId: string };
        await userService.softDelete(userId);
        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    },
};
