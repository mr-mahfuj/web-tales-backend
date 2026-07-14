import { ConflictError, NotFoundError } from '../common/errors.js';
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
            throw new ConflictError('Category already Exists');
        }
        return new CategoryDTO(await categoryRepository.create(data));
    }

    async getAllCategories(): Promise<CategoryDTO[]> {
        const categories = await categoryRepository.findAll();
        return categories.map((category) => new CategoryDTO(category));
    }

    async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundError('Category not found.');
        }
        return categoryRepository.update(id, data);
    }

    async deleteCategory(id: string) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundError('Category not found.');
        }
    }
}
