import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorize.middleware.js';
import { getAllUsersSchema, getUserSchema, updateUserSchema } from '../schemas/user.schema.js';

const router = Router();
const userController = new UserController();

router.get('/', validate(getAllUsersSchema), userController.getAllUsers.bind(userController));
router.get(
    '/:userId',
    authenticateToken,
    validate(getUserSchema),
    userController.getUserById.bind(userController),
);
router.patch(
    '/:userId',
    authenticateToken,
    requireOwnerOrAdmin((req) => req.params.userId),
    validate(updateUserSchema),
    userController.updateUser.bind(userController),
);
router.delete(
    '/:userId',
    authenticateToken,
    requireOwnerOrAdmin((req) => req.params.userId),
    validate(getUserSchema),
    userController.deleteUser.bind(userController),
);

export default router;
