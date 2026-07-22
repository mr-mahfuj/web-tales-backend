import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAccess } from '../middleware/authorizeMiddleware.js';
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
import { PASSWORD_RATE_LIMITS } from '../constants/index.js';
import { Role } from '@prisma/client';

const router = Router();

router.get(
    '/',
    authenticateToken,
    requireAccess(false, Role.ADMIN, Role.USER),
    validate(getAllUsersSchema),
    UserController.getAllUsers,
);
router
    .route('/:userId')
    .get(
        authenticateToken,
        validate(getUserSchema),
        requireAccess(true, Role.ADMIN, Role.USER),
        UserController.getUserById,
    )
    .patch(
        authenticateToken,
        validate(updateUserSchema),
        requireAccess(true, Role.ADMIN, Role.USER),
        UserController.updateUser,
    )
    .delete(
        authenticateToken,
        validate(deleteUserSchema),
        requireAccess(true, Role.ADMIN, Role.USER),
        UserController.deleteUser,
    );

router
    .route('/profile')
    .get(authenticateToken, UserController.getProfile)
    .patch(authenticateToken, validate(updateUserProfileSchema), UserController.updateProfile);

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
