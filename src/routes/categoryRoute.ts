import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireRole } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
    createCategorySchema,
    getCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
} from '../schemas/categorySchema.js';
import { Role } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
    '/',
    authenticateToken,
    requireRole(Role.ADMIN),
    validate(createCategorySchema),
    CategoryController.createCategory,
);
router.get(
    '/',
    authenticateToken,
    validate(getCategorySchema),
    CategoryController.getAllCategories,
);
router.patch(
    '/:categoryId',
    authenticateToken,
    requireRole(Role.ADMIN),
    validate(updateCategorySchema),
    CategoryController.updateCategory,
);
router.delete(
    '/:categoryId',
    authenticateToken,
    requireRole(Role.ADMIN),
    validate(deleteCategorySchema),
    CategoryController.updateCategory,
);

export default router;
