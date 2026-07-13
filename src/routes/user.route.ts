import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole, requireSelfOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    deleteUserSchema,
    getAllUsersSchema,
    getUserSchema,
    updateUserSchema,
} from '../schemas/user.schema.js';

const router = Router();

router.get(
    '/',
    authenticateToken,
    requireRole('ADMIN'),
    validate(getAllUsersSchema),
    UserController.getAllUsers,
);
router.get(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(getUserSchema),
    UserController.getUserById,
);
router.patch(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(updateUserSchema),
    UserController.updateUser,
);
router.delete(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(deleteUserSchema),
    UserController.deleteUser,
);

export default router;
