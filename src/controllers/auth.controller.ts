import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import { AuthService } from '../services/auth.service.js';
import type { ChangePasswordDto, LoginDto, RegisterDto } from '../dtos/auth.dto.js';

const authService = new AuthService();
type VerifyEmailParams = {
    token: string;
};

export const AuthController = {
    register: async (req: Request, res: Response) => {
        const result = await authService.register(req.body as RegisterDto);
        return res.status(StatusCode.Created).json(result);
    },

    login: async (req: Request, res: Response) => {
        const result = await authService.login(req.body as LoginDto);
        return res.status(StatusCode.Ok).json(result);
    },

    async verifyEmail(req: Request<VerifyEmailParams>, res: Response) {
        await authService.verifyEmail(req.params.token);
        return res.status(StatusCode.Ok).json({
            message: 'Email verified Successfully',
        });
    },

    async changePassword(req: Request, res: Response) {
        const result = await authService.changePassword(
            req.user!.id,
            req.body as ChangePasswordDto,
        );
        return res.status(StatusCode.Ok).json(result);
    },
};
