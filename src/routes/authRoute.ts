import { Router } from 'express';
import { validate } from '../middleware/validateMiddleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import {
    loginSchema,
    registerSchema,
    resendConfirmationEmailSchema,
    forgotPasswordSchema,
} from '../schemas/authSchema.js';
import { emailVerificationTokenSchema } from '../schemas/emailVerificationTokenSchema.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/signup', validate(registerSchema), AuthController.register);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.get(
    '/confirm-email/:token',
    validate(emailVerificationTokenSchema),
    AuthController.confirmEmail,
);
router.post(
    '/resend-confirmation',
    validate(resendConfirmationEmailSchema),
    AuthController.resendConfirmationEmail,
);

export default router;
