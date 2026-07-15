import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.js';
import { AuthService } from '../services/auth.service.js';
import type { Validated } from '../types/validation.js';
import type {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    resendConfirmationEmailSchema,
} from '../schemas/authSchema.js';
import type { emailVerificationTokenSchema } from '../schemas/emailVerificationTokenSchema.js';
import type { AuthenticatedUser } from '../types/auth.js';

const authService = new AuthService();

type ValidatedRequest<S> = Request & { validated?: Validated<S>; user?: AuthenticatedUser };

export const AuthController = {
    register: async (req: ValidatedRequest<typeof registerSchema>, res: Response) => {
        const result = await authService.register(req.validated!.body);
        return res.status(StatusCode.Created).json(result);
    },

    login: async (req: ValidatedRequest<typeof loginSchema>, res: Response) => {
        const result = await authService.login(req.validated!.body);
        return res.status(StatusCode.Ok).json(result);
    },

    confirmEmail: async (
        req: ValidatedRequest<typeof emailVerificationTokenSchema>,
        res: Response,
    ) => {
        const { token } = req.validated!.params;
        const result = await authService.confirmEmail(token);
        return res.status(StatusCode.Ok).json(result);
    },

    async resendConfirmationEmail(
        req: ValidatedRequest<typeof resendConfirmationEmailSchema>,
        res: Response,
    ) {
        const result = await authService.resendConfirmationEmail(req.validated!.body);
        return res.status(StatusCode.Ok).json(result);
    },
};
