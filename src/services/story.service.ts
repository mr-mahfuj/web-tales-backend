import { type CreateStoryDTO, type UpdateStoryDTO, StoryDTO } from '../dtos/storyDTO.js';
import { AIServiceError, NotFoundError, ValidationError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import { StoryRepository } from '../repositories/story.repository.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import { toListResponse, type ListResponse } from '../utils/paginationMapper.js';
import { CategoryService } from './category.service.js';
import { AIService } from './ai.service.js';

const categoryService = new CategoryService();

const ensureCategoriesExist = async (categoryIds: string[]): Promise<void> => {
    const uniqueIds = Array.from(new Set(categoryIds));
    const checks = await Promise.all(uniqueIds.map((id) => categoryService.existsByIdCheck(id)));
    const missing = uniqueIds.filter((_, index) => !checks[index]);
    if (missing.length > 0) {
        throw new ValidationError(ERROR_MESSAGES.CATEGORIES_NOT_FOUND, { categoryIds: missing });
    }
};

export class StoryService {
    constructor(
        private readonly storyRepository = new StoryRepository(),
        private readonly aiService = new AIService(),
    ) {}

    private async resolveSummary(
        generateSummary: boolean | undefined,
        body: string | undefined,
        context: 'create' | 'update',
    ): Promise<string | undefined> {
        if (!generateSummary || !body) return undefined;

        const result = await this.aiService.generateSummary(body);
        if (result.summary) return result.summary;
        else throw new AIServiceError(ERROR_MESSAGES.AI_SERVICE_FAILED + context);
    }

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        if (data.categoryIds?.length) {
            await ensureCategoriesExist(data.categoryIds);
        }

        const { generateSummary, ...storyFields } = data;
        const summary = await this.resolveSummary(generateSummary, storyFields.body, 'create');
        if (summary) storyFields.summary = summary;

        return new StoryDTO(await this.storyRepository.create(storyFields));
    }

    async getAllStories(query: ListStoriesQuery): Promise<ListResponse<StoryDTO>> {
        const result = await this.storyRepository.findAll(query);

        return toListResponse(
            result.data.map((story) => new StoryDTO(story)),
            query,
            result.total,
        );
    }

    async getStoryById(storyId: string): Promise<StoryDTO> {
        const story = await this.storyRepository.findById(storyId);

        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND, { storyId: storyId });
        }

        return new StoryDTO(story);
    }

    async updateStory(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        const existingStory = await this.storyRepository.existsById(storyId);

        if (!existingStory) {
            throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND, { storyId: storyId });
        }

        if (data.categoryIds?.length) {
            await ensureCategoriesExist(data.categoryIds);
        }

        const { generateSummary, ...storyFields } = data;
        const summary = await this.resolveSummary(generateSummary, storyFields.body, 'update');
        if (summary) storyFields.summary = summary;

        return new StoryDTO(await this.storyRepository.update(storyId, storyFields));
    }

    async generateStorySummary(storyId: string, regenerate = 'false'): Promise<StoryDTO> {
        const regenerateSummary = regenerate === 'true';
        const story = await this.storyRepository.findById(storyId);

        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND, { storyId: storyId });
        }

        if (story.summary && !regenerateSummary) {
            return new StoryDTO(story);
        }

        const result = await this.aiService.generateSummary(story.body);

        if (!result.summary) {
            return new StoryDTO(story);
        }

        return new StoryDTO(
            await this.storyRepository.update(storyId, { summary: result.summary }),
        );
    }

    async delete(storyId: string): Promise<boolean> {
        const existingStory = await this.storyRepository.existsById(storyId);

        if (!existingStory) {
            throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND, { storyId: storyId });
        }
        await this.storyRepository.delete(storyId);

        return true;
    }

    async getStoryOwnerId(storyId: string): Promise<string | undefined> {
        const story = await this.storyRepository.findById(storyId);
        return story?.userId;
    }
}
