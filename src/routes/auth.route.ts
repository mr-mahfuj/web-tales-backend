import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../schemas/auth.schema.js';
import { emailVerificationTokenSchema } from '../schemas/emailVerificationToken.schema.js';
const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(registerSchema), authController.register);
router.get(
    '/confirm-email/:token',
    validate(emailVerificationTokenSchema),
    authController.verifyEmail,
);
router.patch(
    '/password',
    authenticateToken,
    validate(changePasswordSchema),
    AuthController.changePassword,
);

export default router;
