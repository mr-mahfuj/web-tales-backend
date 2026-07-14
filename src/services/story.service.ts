import { type CreateStoryDTO, type UpdateStoryDTO, StoryDTO } from '../dtos/storyDTO.js';
import { NotFoundError, ValidationError } from '../common/errors.js';
import { StoryRepository } from '../repositories/story.repository.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import { toListResponse, type ListResponse } from '../utils/paginationMapper.js';
import { CategoryService } from './category.service.js';
import { AIService } from './ai.service.js';

const categoryService = new CategoryService();

const ensureCategoriesExist = async (categoryIds: string[]): Promise<void> => {
    const uniqueIds = Array.from(new Set(categoryIds));
    const checks = await Promise.all(uniqueIds.map((id) => categoryService.existsById(id)));
    const missing = uniqueIds.filter((_, index) => !checks[index]);
    if (missing.length > 0) {
        throw new ValidationError('One or more categories do not exist', { categoryIds: missing });
    }
};

export class StoryService {
    constructor(
        private readonly storyRepository = new StoryRepository(),
        private readonly aiService = new AIService(),
    ) {}

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        if (data.categoryIds?.length) {
            await ensureCategoriesExist(data.categoryIds);
        }

        const { generateSummary, ...storyFields } = data;

        if (generateSummary) {
            const result = await this.aiService.generateSummary(storyFields.body);
            if (result.summary) {
                storyFields.summary = result.summary;
            }
        }

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
            throw new NotFoundError('Story not found', { storyId: storyId });
        }

        return new StoryDTO(story);
    }

    async updateStory(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        const existingStory = await this.storyRepository.existsById(storyId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: storyId });
        }

        if (data.categoryIds?.length) {
            await ensureCategoriesExist(data.categoryIds);
        }

        const { generateSummary, ...storyFields } = data;

        if (generateSummary) {
            const content = storyFields.body ?? '';
            if (content) {
                const result = await this.aiService.generateSummary(content);
                if (result.summary) {
                    storyFields.summary = result.summary;
                }
            }
        }

        return new StoryDTO(await this.storyRepository.update(storyId, storyFields));
    }

    async generateStorySummary(storyId: string, regenerate = false): Promise<StoryDTO> {
        const story = await this.storyRepository.findById(storyId);

        if (!story) {
            throw new NotFoundError('Story not found', { storyId: storyId });
        }

        if (story.summary && !regenerate) {
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
            throw new NotFoundError('Story not found', { storyId: storyId });
        }
        await this.storyRepository.delete(storyId);

        return true;
    }

    async getStoryOwnerId(storyId: string): Promise<string | undefined> {
        const story = await this.storyRepository.findById(storyId);
        return story?.userId;
    }
}
