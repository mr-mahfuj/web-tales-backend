import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.js';
import { UserService } from '../services/user.services.js';
import type {
    getAllUsersSchema,
    getUserSchema,
    updateUserSchema,
    deleteUserSchema,
} from '../schemas/userSchema.js';
import type { Validated } from '../types/validation.js';

const userService = new UserService();

type ValidatedRequest<S> = Request & { validated?: Validated<S> };

export const UserController = {
    getAllUsers: async (req: ValidatedRequest<typeof getAllUsersSchema>, res: Response) => {
        const query = req.validated.query;
        const users = await userService.getAllUsers(query);
        return res.status(StatusCode.Ok).json(users);
    },

    getUserById: async (req: ValidatedRequest<typeof getUserSchema>, res: Response) => {
        const { userId } = req.validated.params;
        const user = await userService.getUserById(userId);
        return res.status(StatusCode.Ok).json(user);
    },

    updateUser: async (req: ValidatedRequest<typeof updateUserSchema>, res: Response) => {
        const { userId } = req.validated.params;
        const updatedUser = await userService.updateUser(userId, req.validated.body);
        return res.status(StatusCode.Ok).json(updatedUser);
    },

    deleteUser: async (req: ValidatedRequest<typeof deleteUserSchema>, res: Response) => {
        const { userId } = req.validated.params;
        await userService.softDelete(userId);
        return res.status(StatusCode.Ok).json({
            message: 'User deleted successfully',
        });
    },
};
