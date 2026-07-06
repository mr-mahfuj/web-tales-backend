import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    createUserSchema,
    getAllUsersSchema,
    getUserSchema,
    updateUserSchema,
} from '../validation/user.validation.js';

const router = Router();
const userController = new UserController();

router.post('/', validate(createUserSchema), userController.createUser.bind(userController));
router.get('/', validate(getAllUsersSchema), userController.getAllUsers.bind(userController));
router.get('/:userId', validate(getUserSchema), userController.getUserById.bind(userController));
router.patch(
    '/:userId',
    validate(updateUserSchema),
    userController.updateUser.bind(userController),
);
router.delete('/:userId', validate(getUserSchema), userController.deleteUser.bind(userController));

export default router;
