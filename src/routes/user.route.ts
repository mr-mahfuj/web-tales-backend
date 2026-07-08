import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole, requireSelfOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getAllUsersSchema, getUserSchema, updateUserSchema } from '../schemas/user.schema.js';

const router = Router();

router.get(
    '/',
    authenticateToken,
    requireRole('ADMIN'),
    validate(getAllUsersSchema),
    userController.getAllUsers,
);
router.get(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(getUserSchema),
    userController.getUserById,
);
router.patch(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(updateUserSchema),
    userController.updateUser,
);
router.delete(
    '/:userId',
    authenticateToken,
    requireSelfOrAdmin(),
    validate(getUserSchema),
    userController.deleteUser,
);

export default router;
