import type { Request } from 'express';
import { StatusCode } from '../../../src/constants/index.js';
import { StoryController } from '../../../src/controllers/story.controller.js';
import {
    buildCreateStoryDTO,
    buildUpdateStoryDTO,
    buildListStoriesQuery,
} from '../../factories/story.factory.js';
import { createMockRes } from '../../utils/express.mock.js';

jest.mock('../../../src/services/story.service.js', () => {
    const mockService = {
        createStory: jest.fn(),
        getAllStories: jest.fn(),
        getStoryById: jest.fn(),
        updateStory: jest.fn(),
        delete: jest.fn(),
        generateStorySummary: jest.fn(),
    };

    return {
        StoryService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockService: storyServiceMock } = jest.requireMock(
    '../../../src/services/story.service.js',
) as {
    __mockService: {
        createStory: jest.Mock;
        getAllStories: jest.Mock;
        getStoryById: jest.Mock;
        updateStory: jest.Mock;
        delete: jest.Mock;
        generateStorySummary: jest.Mock;
    };
};

beforeEach(() => {
    storyServiceMock.createStory.mockReset();
    storyServiceMock.getAllStories.mockReset();
    storyServiceMock.getStoryById.mockReset();
    storyServiceMock.updateStory.mockReset();
    storyServiceMock.delete.mockReset();
    storyServiceMock.generateStorySummary.mockReset();
});

describe('StoryController', () => {
    describe('createStory', () => {
        it('returns 201 with the created story', async () => {
            const body = buildCreateStoryDTO();
            const story = { id: 's-1', ...body };
            storyServiceMock.createStory.mockResolvedValue(story);
            const req = {
                validated: { body },
                user: { id: 'u-1' },
            } as unknown as Request;
            const res = createMockRes();

            await StoryController.createStory(req, res);

            expect(storyServiceMock.createStory).toHaveBeenCalledWith({ ...body, userId: 'u-1' });
            expect(res.status).toHaveBeenCalledWith(StatusCode.Created);
            expect(res.json).toHaveBeenCalledWith(story);
        });
    });

    describe('getAllStories', () => {
        it('returns 200 with the paginated stories', async () => {
            const query = buildListStoriesQuery();
            const payload = { data: [], meta: { offset: 0, limit: 10, total: 0 } };
            storyServiceMock.getAllStories.mockResolvedValue(payload);
            const req = { validated: { query } } as unknown as Request;
            const res = createMockRes();

            await StoryController.getAllStories(req, res);

            expect(storyServiceMock.getAllStories).toHaveBeenCalledWith(query);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(payload);
        });
    });

    describe('getStoryById', () => {
        it('returns 200 with the story', async () => {
            const story = { id: 's-1' };
            storyServiceMock.getStoryById.mockResolvedValue(story);
            const req = { validated: { params: { storyId: 's-1' } } } as unknown as Request;
            const res = createMockRes();

            await StoryController.getStoryById(req, res);

            expect(storyServiceMock.getStoryById).toHaveBeenCalledWith('s-1');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(story);
        });
    });

    describe('updateStory', () => {
        it('returns 200 with the updated story', async () => {
            const data = buildUpdateStoryDTO({ title: 'New' });
            const updated = { id: 's-1', title: 'New' };
            storyServiceMock.updateStory.mockResolvedValue(updated);
            const req = {
                validated: { params: { storyId: 's-1' }, body: data },
            } as unknown as Request;
            const res = createMockRes();

            await StoryController.updateStory(req, res);

            expect(storyServiceMock.updateStory).toHaveBeenCalledWith('s-1', data);
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(updated);
        });
    });

    describe('deleteStory', () => {
        it('returns 200 with a success message', async () => {
            storyServiceMock.delete.mockResolvedValue(true);
            const req = { validated: { params: { storyId: 's-1' } } } as unknown as Request;
            const res = createMockRes();

            await StoryController.deleteStory(req, res);

            expect(storyServiceMock.delete).toHaveBeenCalledWith('s-1');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith({ message: 'Story deleted successfully' });
        });
    });

    describe('generateSummary', () => {
        it('returns 200 with the story containing the generated summary', async () => {
            const story = { id: 's-1', summary: 'A summary' };
            storyServiceMock.generateStorySummary.mockResolvedValue(story);

            const req = {
                validated: { params: { storyId: 's-1' }, regenerate: { regenerate: 'true' } },
            } as unknown as Request;
            const res = createMockRes();

            await StoryController.generateSummary(req, res);

            expect(storyServiceMock.generateStorySummary).toHaveBeenCalledWith('s-1', 'true');
            expect(res.status).toHaveBeenCalledWith(StatusCode.Ok);
            expect(res.json).toHaveBeenCalledWith(story);
        });
    });

    describe('error propagation', () => {
        it('does not catch service errors; lets them bubble up to error middleware', async () => {
            storyServiceMock.getStoryById.mockRejectedValue(new Error('boom'));
            const req = { validated: { params: { storyId: 's-1' } } } as unknown as Request;
            const res = createMockRes();

            await expect(StoryController.getStoryById(req, res)).rejects.toThrow('boom');
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
