import type { Response } from 'express';
import { StatusCode } from '../constants/index.js';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import type {
    registerSchema,
    loginSchema,
    initiatePasswordChangeSchema,
    confirmPasswordChangeSchema,
    forgotPasswordSchema,
    resendConfirmationEmailSchema,
} from '../schemas/authSchema.js';
import type { emailVerificationTokenSchema } from '../schemas/emailVerificationTokenSchema.js';
import type { ValidatedRequest } from '../types/validation.js';

const authService = new AuthService();

export const AuthController = {
    register: async (req: ValidatedRequest<typeof registerSchema>, res: Response) => {
        const result = await authService.register(req.validated!.body);
        return res.status(StatusCode.Created).json(result);
    },

    createAdmin: async (req: ValidatedRequest<typeof registerSchema>, res: Response) => {
        const result = await authService.registerAdmin(req.validated!.body);
        return res.status(StatusCode.Created).json(result);
    },

    login: async (req: ValidatedRequest<typeof loginSchema>, res: Response) => {
        const result = await authService.login(req.validated!.body);
        const isProduction = env.nodeEnv === 'production';
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(StatusCode.Ok).json(result);
    },

    confirmEmail: async (
        req: ValidatedRequest<typeof emailVerificationTokenSchema>,
        res: Response,
    ) => {
        const { token } = req.validated!.params;
        await authService.confirmEmail(token);
        return res.sendStatus(StatusCode.NoContent);
    },

    resendConfirmationEmail: async (
        req: ValidatedRequest<typeof resendConfirmationEmailSchema>,
        res: Response,
    ) => {
        await authService.resendConfirmationEmail(req.validated!.body);
        return res.sendStatus(StatusCode.NoContent);
    },

    forgotPassword: async (req: ValidatedRequest<typeof forgotPasswordSchema>, res: Response) => {
        await authService.forgotPassword(req.validated!.body);
        return res.sendStatus(StatusCode.NoContent);
    },

    initiatePasswordChange: async (
        req: ValidatedRequest<typeof initiatePasswordChangeSchema>,
        res: Response,
    ) => {
        await authService.initiatePasswordChange(req.user!.id, req.validated!.body);
        return res.sendStatus(StatusCode.NoContent);
    },

    confirmPasswordChange: async (
        req: ValidatedRequest<typeof confirmPasswordChangeSchema>,
        res: Response,
    ) => {
        await authService.confirmPasswordChange(req.validated!.body);
        return res.sendStatus(StatusCode.NoContent);
    },

    validatePasswordChangeToken: async (
        req: ValidatedRequest<typeof emailVerificationTokenSchema>,
        res: Response,
    ) => {
        const { token } = req.validated!.params;
        const result = await authService.validatePasswordChangeToken(token);
        return res.status(StatusCode.Ok).json(result);
    },
};
