import type { Request, Response } from 'express';
import { StatusCode } from '../constants/index.js';
import { CategoryService } from '../services/category.service.js';
import type { ValidatedRequest } from '../types/validation.js';
import type {
    createCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
} from '../schemas/categorySchema.js';

const categoryService = new CategoryService();

export const CategoryController = {
    createCategory: async (req: ValidatedRequest<typeof createCategorySchema>, res: Response) => {
        const category = await categoryService.createCategory(req.validated.body);
        return res.status(StatusCode.Created).json(category);
    },

    getAllCategories: async (_req: Request, res: Response) => {
        const categories = await categoryService.getAllCategories();
        return res.status(StatusCode.Ok).json(categories);
    },

    updateCategory: async (req: ValidatedRequest<typeof updateCategorySchema>, res: Response) => {
        const { categoryId } = req.validated.params;
        const updatedCategory = await categoryService.updateCategory(
            categoryId,
            req.validated.body,
        );
        return res.status(StatusCode.Ok).json(updatedCategory);
    },

    deleteCategory: async (req: ValidatedRequest<typeof deleteCategorySchema>, res: Response) => {
        const { categoryId } = req.validated.params;
        await categoryService.deleteCategory(categoryId);
        return res.status(StatusCode.Ok).json({
            message: 'Category deleted successfully',
        });
    },
};
