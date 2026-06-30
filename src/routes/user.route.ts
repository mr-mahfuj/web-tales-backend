import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router();
const userController = new UserController();

router.post("/", userController.createUser.bind(userController));
router.get("/", userController.getAllUsers.bind(userController));
router.get("/:userId", userController.getUserById.bind(userController));
router.patch("/:userId", userController.updateUser.bind(userController));
router.delete("/:userId", userController.deleteUser.bind(userController));

export default router;