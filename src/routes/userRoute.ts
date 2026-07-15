import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireSelfOrAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { rateLimit } from '../middleware/rateLimitMiddleware.js';
import {
    deleteUserSchema,
    getAllUsersSchema,
    getUserSchema,
    updateUserSchema,
    updateUserProfileSchema,
} from '../schemas/userSchema.js';
import {
    confirmPasswordChangeSchema,
    initiatePasswordChangeSchema,
} from '../schemas/authSchema.js';
import { emailVerificationTokenSchema } from '../schemas/emailVerificationTokenSchema.js';
import { Role } from '@prisma/client';
import { PASSWORD_RATE_LIMITS } from '../constants/rateLimit.js';

const router = Router();

router.get(
    '/',
    authenticateToken,
    requireRole(Role.ADMIN),
    validate(getAllUsersSchema),
    UserController.getAllUsers,
);
router.get(
    '/:userId',
    authenticateToken,
    validate(getUserSchema),
    requireSelfOrAdmin(),
    UserController.getUserById,
);
router.patch(
    '/:userId',
    authenticateToken,
    validate(updateUserSchema),
    requireSelfOrAdmin(),
    UserController.updateUser,
);
router.delete(
    '/:userId',
    authenticateToken,
    validate(deleteUserSchema),
    requireSelfOrAdmin(),
    UserController.deleteUser,
);

router.get('/profile', authenticateToken, UserController.getProfile);

router.patch(
    '/profile',
    authenticateToken,
    validate(updateUserProfileSchema),
    UserController.updateProfile,
);

router.post(
    '/change-password',
    authenticateToken,
    rateLimit(PASSWORD_RATE_LIMITS.CHANGE_PASSWORD),
    validate(initiatePasswordChangeSchema),
    AuthController.initiatePasswordChange,
);

router.get(
    '/validate-password-change/:token',
    rateLimit(PASSWORD_RATE_LIMITS.CONFIRM_PASSWORD_CHANGE),
    validate(emailVerificationTokenSchema),
    AuthController.validatePasswordChangeToken,
);

router.post(
    '/confirm-password-change',
    rateLimit(PASSWORD_RATE_LIMITS.CONFIRM_PASSWORD_CHANGE),
    validate(confirmPasswordChangeSchema),
    AuthController.confirmPasswordChange,
);

export default router;
