import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole, requireSelfOrAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
    deleteUserSchema,
    getAllUsersSchema,
    getUserSchema,
    updateUserSchema,
} from '../schemas/userSchema.js';
import { Role } from '@prisma/client';

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

export default router;
