import { ConflictError, NotFoundError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import {
    CategoryDTO,
    type CreateCategoryDTO,
    type UpdateCategoryDTO,
} from '../dtos/categoryDTO.js';
import { CategoryRepository } from '../repositories/category.repository.js';

const categoryRepository = new CategoryRepository();

export class CategoryService {
    async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
        if (await categoryRepository.existsByName(data.name)) {
            throw new ConflictError(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
        }
        return new CategoryDTO(await categoryRepository.create(data));
    }

    async getAllCategories(): Promise<CategoryDTO[]> {
        const categories = await categoryRepository.findAll();
        return categories.map((category) => new CategoryDTO(category));
    }

    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
        if (!(await categoryRepository.existsById(id))) {
            throw new NotFoundError(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }
        return categoryRepository.update(id, data);
    }

    async deleteCategory(id: string) {
        if (!(await categoryRepository.existsById(id))) {
            throw new NotFoundError(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }
    }

    async existsByIdCheck(id: string): Promise<boolean> {
        return categoryRepository.existsById(id);
    }

    async existsByNameCheck(name: string): Promise<boolean> {
        return categoryRepository.existsByName(name);
    }
}
