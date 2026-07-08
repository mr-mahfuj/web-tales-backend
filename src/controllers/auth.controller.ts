import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { ChangePasswordDto, LoginDto, RegisterDto } from '../dtos/auth.dto.js';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        const result = await authService.register(req.body as RegisterDto);

        return res.status(StatusCode.Created).json(result);
    }

    async login(req: Request, res: Response) {
        const result = await authService.login(req.body as LoginDto);

        return res.status(StatusCode.Ok).json(result);
    }

    async changePassword(req: Request, res: Response) {
        const result = await authService.changePassword(
            req.user!.id,
            req.body as ChangePasswordDto,
        );

        return res.status(StatusCode.Ok).json(result);
    }
}
