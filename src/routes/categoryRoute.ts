import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
    createCategorySchema,
    getCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
} from '../schemas/categorySchema.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAccess } from '../middleware/authorizeMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router
    .route('/')
    .post(
        authenticateToken,
        requireAccess(false, Role.ADMIN),
        validate(createCategorySchema),
        CategoryController.createCategory,
    )
    .get(authenticateToken, validate(getCategorySchema), CategoryController.getAllCategories);

router
    .route('/:categoryId')
    .patch(
        authenticateToken,
        requireAccess(false, Role.ADMIN),
        validate(updateCategorySchema),
        CategoryController.updateCategory,
    )
    .delete(
        authenticateToken,
        requireAccess(false, Role.ADMIN),
        validate(deleteCategorySchema),
        CategoryController.deleteCategory,
    );

router;

export default router;
