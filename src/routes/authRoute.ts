import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
    resendConfirmationEmailSchema,
} from '../schemas/authSchema.js';
import { emailVerificationTokenSchema } from '../schemas/emailVerificationTokenSchema.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/signup', validate(registerSchema), AuthController.register);
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
router.patch(
    '/password',
    authenticateToken,
    validate(changePasswordSchema),
    AuthController.changePassword,
);

export default router;
