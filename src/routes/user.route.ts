import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router();
const userController = new UserController();

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route("/:userId")
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

export default router;
