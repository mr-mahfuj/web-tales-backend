import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { StatusCode } from '../constants/status-code.enum.js';
import type { ChangePasswordDto, LoginDto, RegisterDto } from '../dtos/auth.dto.js';
import { getValidatedBody } from '../middleware/validate.middleware.js';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        const result = await authService.register(getValidatedBody<RegisterDto>(req));
        res.status(StatusCode.Created).json(result);
    }

    async login(req: Request, res: Response) {
        const result = await authService.login(getValidatedBody<LoginDto>(req));
        res.status(StatusCode.Ok).json(result);
    }

    async changePassword(req: Request, res: Response) {
        const userId = req.user!.id;
        const result = await authService.changePassword(
            userId,
            getValidatedBody<ChangePasswordDto>(req),
        );
        res.status(StatusCode.Ok).json(result);
    }
}
