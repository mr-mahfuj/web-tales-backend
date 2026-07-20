import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
    createCategorySchema,
    getCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
} from '../schemas/categorySchema.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router
    .route('/')
    .post(
        authenticateToken,
        requireAdmin(),
        validate(createCategorySchema),
        CategoryController.createCategory,
    )
    .get(authenticateToken, validate(getCategorySchema), CategoryController.getAllCategories);

router.patch(
    '/:categoryId',
    authenticateToken,
    requireAdmin(),
    validate(updateCategorySchema),
    CategoryController.updateCategory,
);

router.delete(
    '/:categoryId',
    authenticateToken,
    requireAdmin(),
    validate(deleteCategorySchema),
    CategoryController.deleteCategory,
);

export default router;
