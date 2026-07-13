import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.js';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../common/errors.js';
import type { Validated } from '../types/validation.js';
import type { registerSchema, loginSchema, changePasswordSchema } from '../schemas/authSchema.js';

const authService = new AuthService();

type ValidatedRequest<S> = Request & { validated?: Validated<S> };

export const AuthController = {
    register: async (req: ValidatedRequest<typeof registerSchema>, res: Response) => {
        const result = await authService.register(req.validated.body);
        return res.status(StatusCode.Created).json(result);
    },

    login: async (req: ValidatedRequest<typeof loginSchema>, res: Response) => {
        const result = await authService.login(req.validated.body);
        return res.status(StatusCode.Ok).json(result);
    },

    changePassword: async (req: ValidatedRequest<typeof changePasswordSchema>, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        const result = await authService.changePassword(userId, req.validated.body);
        return res.status(StatusCode.Ok).json(result);
    },
};
