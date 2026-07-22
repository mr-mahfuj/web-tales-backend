import type { Request } from 'express';
import { StatusCode } from '../../../src/constants/index.js';
import { CategoryController } from '../../../src/controllers/category.controller.js';
import {
    buildCreateCategoryDTO,
    buildUpdateCategoryDTO,
} from '../../factories/category.factory.js';
import { createMockRes } from '../../utils/express.mock.js';

jest.mock('../../../src/services/category.service.js', () => {
    const mockService = {
        createCategory: jest.fn(),
        getAllCategories: jest.fn(),
        updateCategory: jest.fn(),
        deleteCategory: jest.fn(),
    };

    return {
        CategoryService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockService: categoryServiceMock } = jest.requireMock(
    '../../../src/services/category.service.js',
) as {
    __mockService: {
        createCategory: jest.Mock;
        getAllCategories: jest.Mock;
        updateCategory: jest.Mock;
        deleteCategory: jest.Mock;
    };
};

beforeEach(() => {
    categoryServiceMock.createCategory.mockReset();
    categoryServiceMock.getAllCategories.mockReset();
    categoryServiceMock.updateCategory.mockReset();
    categoryServiceMock.deleteCategory.mockReset();
});

describe('CategoryController', () => {
    describe('createCategory', () => {
        it('returns 201 with the created category', async () => {
            const body = buildCreateCategoryDTO();
            const category = { id: 'c-1', ...body };
            categoryServiceMock.createCategory.mockResolvedValue(category);
            const req = { validated: { body } } as unknown as Request;
            const res = createMockRes();

            await CategoryController.createCategory(req, res);

            expect(categoryServiceMock.createCategory).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Created);
            expect(res.json).toHaveBeenCalledWith(category);
        });
    });

    describe('getAllCategories', () => {
        it('returns 200 with all categories', async () => {
            const categories = [{ id: 'c-1' }, { id: 'c-2' }];
            categoryServiceMock.getAllCategories.mockResolvedValue(categories);
            const req = {} as unknown as Request;
            const res = createMockRes();

            await CategoryController.getAllCategories(req, res);

            expect(categoryServiceMock.getAllCategories).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(categories);
        });
    });

    describe('updateCategory', () => {
        it('returns 200 with the updated category', async () => {
            const data = buildUpdateCategoryDTO({ name: 'New Name' });
            const updated = { id: 'c-1', name: 'New Name' };
            categoryServiceMock.updateCategory.mockResolvedValue(updated);
            const req = {
                validated: { params: { categoryId: 'c-1' }, body: data },
            } as unknown as Request;
            const res = createMockRes();

            await CategoryController.updateCategory(req, res);

            expect(categoryServiceMock.updateCategory).toHaveBeenCalledWith('c-1', data);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(updated);
        });
    });

    describe('deleteCategory', () => {
        it('returns 200 with a success message', async () => {
            categoryServiceMock.deleteCategory.mockResolvedValue(undefined);
            const req = { validated: { params: { categoryId: 'c-1' } } } as unknown as Request;
            const res = createMockRes();

            await CategoryController.deleteCategory(req, res);

            expect(categoryServiceMock.deleteCategory).toHaveBeenCalledWith('c-1');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted successfully' });
        });
    });

    describe('error propagation', () => {
        it('does not catch service errors; lets them bubble up to error middleware', async () => {
            categoryServiceMock.updateCategory.mockRejectedValue(new Error('boom'));
            const req = {
                validated: { params: { categoryId: 'c-1' }, body: buildUpdateCategoryDTO() },
            } as unknown as Request;
            const res = createMockRes();

            await expect(CategoryController.updateCategory(req, res)).rejects.toThrow('boom');
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
