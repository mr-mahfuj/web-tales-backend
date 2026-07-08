import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { UpdateUserDTO, UserDTO } from '../dtos/user.dto.js';
import type { ListUsersQuery } from '../schemas/user.schema.js';
import { UserService } from '../services/user.services.js';
import { toListResponse } from '../utils/list-response.js';

const userService = new UserService();

type UserIdParams = { userId: string };

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        const query = req.query as unknown as ListUsersQuery;
        const result = await userService.getAllUsers(query);

        return res
            .status(StatusCode.Ok)
            .json(toListResponse<UserDTO>(result.data, query, result.meta.total));
    }

    async getUserById(req: Request<UserIdParams>, res: Response) {
        const user = await userService.getUserById(req.params.userId);

        return res.status(StatusCode.Ok).json(user);
    }

    async updateUser(req: Request<UserIdParams>, res: Response) {
        const updatedUser = await userService.updateUser(
            req.params.userId,
            req.body as UpdateUserDTO,
        );

        return res.status(StatusCode.Ok).json(updatedUser);
    }

    async deleteUser(req: Request<UserIdParams>, res: Response) {
        await userService.softDelete(req.params.userId);

        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    }
}
