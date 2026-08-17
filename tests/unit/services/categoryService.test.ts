import { CategoryService } from '../../../src/services/category.service.js';
import { ConflictError, NotFoundError } from '../../../src/common/errors.js';
import {
    buildCreateCategoryDTO,
    buildUpdateCategoryDTO,
    buildCategory,
    buildCategoryList,
} from '../../factories/category.factory.js';

jest.mock('../../../src/repositories/category.repository.js', () => {
    const mockRepo = {
        existsByName: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
        existsById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    return {
        CategoryRepository: jest.fn().mockImplementation(() => mockRepo),
        __mockRepo: mockRepo,
    };
});

const { __mockRepo: categoryRepositoryMock } = jest.requireMock(
    '../../../src/repositories/category.repository.js',
) as {
    __mockRepo: {
        existsByName: jest.Mock;
        create: jest.Mock;
        findAll: jest.Mock;
        existsById: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
    };
};

describe('CategoryService', () => {
    let service: CategoryService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CategoryService();
    });

    describe('createCategory', () => {
        it('creates and returns a CategoryDTO when the name is free', async () => {
            const input = buildCreateCategoryDTO();
            const stored = buildCategory({ ...input });
            categoryRepositoryMock.existsByName.mockResolvedValue(false);
            categoryRepositoryMock.create.mockResolvedValue(stored);

            const result = await service.createCategory(input);

            expect(categoryRepositoryMock.existsByName).toHaveBeenCalledWith(input.name);
            expect(categoryRepositoryMock.create).toHaveBeenCalledWith(input);
            expect(result).toMatchObject({ id: stored.id, name: stored.name });
        });

        it('throws ConflictError when the name already exists', async () => {
            categoryRepositoryMock.existsByName.mockResolvedValue(true);

            await expect(service.createCategory(buildCreateCategoryDTO())).rejects.toThrow(
                ConflictError,
            );
            expect(categoryRepositoryMock.create).not.toHaveBeenCalled();
        });
    });

    describe('getAllCategories', () => {
        it('returns all categories mapped to DTOs', async () => {
            const categories = buildCategoryList(2);
            categoryRepositoryMock.findAll.mockResolvedValue(categories);

            const result = await service.getAllCategories();

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({ id: categories[0]!.id });
        });
    });

    describe('updateCategory', () => {
        it('updates and returns the category when it exists', async () => {
            const data = buildUpdateCategoryDTO({ name: 'New Name' });
            const updated = buildCategory({ id: 'c-1', name: 'New Name' });
            categoryRepositoryMock.existsById.mockResolvedValue(true);
            categoryRepositoryMock.update.mockResolvedValue(updated);

            const result = await service.updateCategory('c-1', data);

            expect(categoryRepositoryMock.update).toHaveBeenCalledWith('c-1', data);
            expect(result).toEqual(updated);
        });

        it('throws NotFoundError when the category does not exist', async () => {
            categoryRepositoryMock.existsById.mockResolvedValue(false);

            await expect(
                service.updateCategory('missing', buildUpdateCategoryDTO()),
            ).rejects.toThrow(NotFoundError);
            expect(categoryRepositoryMock.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteCategory', () => {
        it('resolves without error when the category exists', async () => {
            categoryRepositoryMock.existsById.mockResolvedValue(true);

            await expect(service.deleteCategory('c-1')).resolves.toBeUndefined();
        });

        it('throws NotFoundError when the category does not exist', async () => {
            categoryRepositoryMock.existsById.mockResolvedValue(false);

            await expect(service.deleteCategory('missing')).rejects.toThrow(NotFoundError);
        });
    });

    describe('existsByIdCheck / existsByNameCheck', () => {
        it('returns the repository result for the given id', async () => {
            categoryRepositoryMock.existsById.mockResolvedValue(true);

            await expect(service.existsByIdCheck('c-1')).resolves.toBe(true);

            expect(categoryRepositoryMock.existsById).toHaveBeenCalledWith('c-1');
        });

        it('returns the repository result for the given name', async () => {
            categoryRepositoryMock.existsByName.mockResolvedValue(false);

            await expect(service.existsByNameCheck('Adventure')).resolves.toBe(false);

            expect(categoryRepositoryMock.existsByName).toHaveBeenCalledWith('Adventure');
        });
    });
});
