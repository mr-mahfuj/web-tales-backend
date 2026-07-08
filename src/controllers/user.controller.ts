import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { ListUsersQuery } from '../schemas/user.schema.js';
import { UserService } from '../services/user.services.js';
import {
    getValidatedBody,
    getValidatedParams,
    getValidatedQuery,
} from '../middleware/validate.middleware.js';
import type { UpdateUserDTO } from '../dtos/user.dto.js';
import { ForbiddenError, NotFoundError } from '../common/errors.js';

const userService = new UserService();

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        const query = getValidatedQuery<ListUsersQuery>(req);
        const result = await userService.getAllUsers(query);

        return res.status(StatusCode.Ok).json({
            data: result.data,
            meta: {
                offset: query.offset,
                limit: query.limit,
                ...(result.total !== undefined ? { total: result.total } : {}),
            },
        });
    }

    async getUserById(req: Request, res: Response) {
        const { userId } = getValidatedParams<{ userId: string }>(req);
        const actor = req.user!;

        if (actor.role !== 'ADMIN' && actor.id !== userId) {
            throw new ForbiddenError('You can only view your own profile');
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            throw new NotFoundError('User not found', { userId });
        }

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
