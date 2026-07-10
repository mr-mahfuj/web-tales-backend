import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
    resendConfirmationEmailSchema,
} from '../schemas/auth.schema.js';
import { emailVerificationTokenSchema } from '../schemas/emailVerificationToken.schema.js';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/signup', validate(registerSchema), AuthController.register);
router.post(
    '/resend-confirmation-email',
    rateLimit({
        windowMs: 2 * 60 * 1000,
        max: 3,
        keyGenerator: (req) => req.body?.email ?? req.ip ?? 'unknown',
    }),
    validate(resendConfirmationEmailSchema),
    AuthController.resendConfirmationEmail,
);
router.get(
    '/confirm-email/:token',
    validate(emailVerificationTokenSchema),
    AuthController.verifyEmail,
);
router.patch(
    '/password',
    authenticateToken,
    validate(changePasswordSchema),
    AuthController.changePassword,
);

export default router;
