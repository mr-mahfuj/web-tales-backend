import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../schemas/auth.schema.js';
const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(registerSchema), authController.register);
router.patch(
    '/password',
    authenticateToken,
    validate(changePasswordSchema),
    authController.changePassword,
);

export default router;
