import { StoryService } from '../../../src/services/story.service.js';
import { AIServiceError, NotFoundError, ValidationError } from '../../../src/common/errors.js';
import {
    buildCreateStoryDTO,
    buildUpdateStoryDTO,
    buildStory,
    buildStoryList,
    buildListStoriesQuery,
} from '../../factories/story.factory.js';
import {
    createStoryRepositoryMock,
    type StoryRepositoryMock,
} from '../../mocks/repositories.mock.js';
import type { ListStoriesQuery } from '../../../src/schemas/storySchema.js';

jest.mock('../../../src/services/category.service.js', () => {
    const mockService = {
        existsByIdCheck: jest.fn(),
        existsByNameCheck: jest.fn(),
    };
    return {
        CategoryService: jest.fn().mockImplementation(() => mockService),
        __mockService: mockService,
    };
});

const { __mockService: categoryServiceMock } = jest.requireMock(
    '../../../src/services/category.service.js',
) as { __mockService: { existsByIdCheck: jest.Mock; existsByNameCheck: jest.Mock } };

describe('StoryService', () => {
    let service: StoryService;
    let repo: StoryRepositoryMock;
    let aiService: { generateSummary: jest.Mock };

    beforeEach(() => {
        repo = createStoryRepositoryMock();
        aiService = { generateSummary: jest.fn() };
        service = new StoryService(repo, aiService as never);
        categoryServiceMock.existsByIdCheck.mockReset();
    });

    describe('createStory', () => {
        it('creates and returns a StoryDTO when there are no categories', async () => {
            const input = buildCreateStoryDTO({ categoryIds: [] });
            const stored = buildStory({ ...input });
            repo.create.mockResolvedValue(stored);

            const result = await service.createStory(input);

            expect(categoryServiceMock.existsByIdCheck).not.toHaveBeenCalled();
            expect(repo.create).toHaveBeenCalled();
            expect(result).toMatchObject({ storyId: stored.storyId, title: stored.title });
        });

        it('validates category ids and creates the story when all categories exist', async () => {
            const input = buildCreateStoryDTO({ categoryIds: ['c-1', 'c-2'] });
            categoryServiceMock.existsByIdCheck.mockResolvedValue(true);
            repo.create.mockResolvedValue(buildStory({ ...input }));

            await service.createStory(input);

            expect(categoryServiceMock.existsByIdCheck).toHaveBeenCalledWith('c-1');
            expect(categoryServiceMock.existsByIdCheck).toHaveBeenCalledWith('c-2');
            expect(repo.create).toHaveBeenCalled();
        });

        it('throws ValidationError when a category id does not exist', async () => {
            const input = buildCreateStoryDTO({ categoryIds: ['c-1', 'c-2'] });
            categoryServiceMock.existsByIdCheck.mockImplementation((id: string) =>
                Promise.resolve(id === 'c-1'),
            );

            await expect(service.createStory(input)).rejects.toThrow(ValidationError);
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('generates a summary via AIService when generateSummary is true', async () => {
            const input = buildCreateStoryDTO({
                generateSummary: true,
                body: 'Some body',
                categoryIds: [],
            });
            aiService.generateSummary.mockResolvedValue({ summary: 'Generated summary' });
            repo.create.mockResolvedValue(buildStory({ summary: 'Generated summary' }));

            await service.createStory(input);

            expect(aiService.generateSummary).toHaveBeenCalledWith(input.body);
            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({ summary: 'Generated summary' }),
            );
        });

        it('throws AIServiceError when summary generation fails', async () => {
            const input = buildCreateStoryDTO({
                generateSummary: true,
                body: 'Some body',
                categoryIds: [],
            });
            aiService.generateSummary.mockResolvedValue({ summary: undefined });

            await expect(service.createStory(input)).rejects.toThrow(AIServiceError);
            expect(repo.create).not.toHaveBeenCalled();
        });
    });

    describe('getAllStories', () => {
        it('returns paginated list mapped to DTOs', async () => {
            const query = buildListStoriesQuery() as ListStoriesQuery;
            const stories = buildStoryList(2);
            repo.findAll.mockResolvedValue({ data: stories, total: 2 });

            const result = await service.getAllStories(query);

            expect(repo.findAll).toHaveBeenCalledWith(query);
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toMatchObject({ storyId: stories[0]!.storyId });
        });
    });

    describe('getStoryById', () => {
        it('returns a StoryDTO when the story is found', async () => {
            repo.findById.mockResolvedValue(buildStory({ storyId: 's-1' }));

            const result = await service.getStoryById('s-1');

            expect(repo.findById).toHaveBeenCalledWith('s-1');
            expect(result.storyId).toBe('s-1');
        });

        it('throws NotFoundError when the story does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.getStoryById('missing')).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateStory', () => {
        it('updates the story and returns a StoryDTO', async () => {
            const data = buildUpdateStoryDTO({ title: 'New Title' });
            repo.existsById.mockResolvedValue(true);
            repo.update.mockResolvedValue(buildStory({ storyId: 's-1', title: 'New Title' }));

            const result = await service.updateStory('s-1', data);

            expect(repo.update).toHaveBeenCalledWith('s-1', data);
            expect(result.title).toBe('New Title');
        });

        it('throws NotFoundError when the story does not exist', async () => {
            repo.existsById.mockResolvedValue(false);

            await expect(service.updateStory('missing', buildUpdateStoryDTO())).rejects.toThrow(
                NotFoundError,
            );
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('throws ValidationError when a category id does not exist', async () => {
            repo.existsById.mockResolvedValue(true);
            categoryServiceMock.existsByIdCheck.mockResolvedValue(false);

            await expect(
                service.updateStory('s-1', buildUpdateStoryDTO({ categoryIds: ['c-1'] })),
            ).rejects.toThrow(ValidationError);
            expect(repo.update).not.toHaveBeenCalled();
        });
    });

    describe('generateStorySummary', () => {
        it('returns the existing story without calling AIService when a summary already exists', async () => {
            repo.findById.mockResolvedValue(
                buildStory({ storyId: 's-1', summary: 'Existing summary' }),
            );

            const result = await service.generateStorySummary('s-1');

            expect(aiService.generateSummary).not.toHaveBeenCalled();
            expect(result.sumary).toBe('Existing summary');
        });

        it('regenerates the summary when regenerate is "true"', async () => {
            const story = buildStory({ storyId: 's-1', summary: 'Old summary', body: 'body text' });
            repo.findById.mockResolvedValue(story);
            aiService.generateSummary.mockResolvedValue({ summary: 'New summary' });
            repo.update.mockResolvedValue({ ...story, summary: 'New summary' });

            const result = await service.generateStorySummary('s-1', 'true');

            expect(aiService.generateSummary).toHaveBeenCalledWith(story.body);
            expect(repo.update).toHaveBeenCalledWith('s-1', { summary: 'New summary' });
            expect(result.sumary).toBe('New summary');
        });

        it('returns the original story when AIService does not return a summary', async () => {
            repo.findById.mockResolvedValue(
                buildStory({ storyId: 's-1', summary: null, body: 'x' }),
            );
            aiService.generateSummary.mockResolvedValue({ summary: undefined });

            const result = await service.generateStorySummary('s-1');

            expect(repo.update).not.toHaveBeenCalled();
            expect(result.storyId).toBe('s-1');
        });

        it('throws NotFoundError when the story does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.generateStorySummary('missing')).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('deletes the story and returns true', async () => {
            repo.existsById.mockResolvedValue(true);

            const result = await service.delete('s-1');

            expect(repo.delete).toHaveBeenCalledWith('s-1');
            expect(result).toBe(true);
        });

        it('throws NotFoundError when the story does not exist', async () => {
            repo.existsById.mockResolvedValue(false);

            await expect(service.delete('missing')).rejects.toThrow(NotFoundError);
            expect(repo.delete).not.toHaveBeenCalled();
        });
    });

    describe('getStoryOwnerId', () => {
        it('returns the userId of the story', async () => {
            repo.findById.mockResolvedValue(buildStory({ storyId: 's-1', userId: 'u-9' }));

            await expect(service.getStoryOwnerId('s-1')).resolves.toBe('u-9');
        });

        it('returns undefined when the story does not exist', async () => {
            repo.findById.mockResolvedValue(null);

            await expect(service.getStoryOwnerId('missing')).resolves.toBeUndefined();
        });
    });
});
