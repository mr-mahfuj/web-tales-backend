import {
    type CreateStoryDTO,
    type UpdateStoryDTO,
    StoryDTO,
    StoryListItemDTO,
} from '../dtos/storyDTO.js';
import { NotFoundError, ValidationError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import { StoryRepository } from '../repositories/story.repository.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import { toListResponse, type ListResponse } from '../utils/paginationMapper.js';
import { CategoryService } from './category.service.js';
import { AIService } from './ai.service.js';
import { UserService } from './user.services.js';

const categoryService = new CategoryService();
const userService = new UserService();

const SIMILAR_STORIES_LIMIT = 4;

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
    ): Promise<string | undefined> {
        if (!generateSummary || !body) return undefined;

        try {
            const result = await this.aiService.generateSummary(body);
            return result.summary || undefined;
        } catch (error) {
            console.error('Failed to generate summary, continuing without one:', error);
            return undefined;
        }
    }

    private async attachRelatedStories(story: StoryDTO): Promise<StoryDTO> {
        const categoryIds = story.categories.map((category) => category.id);

        story.similar = (
            await this.storyRepository.findSimilarByCategories(
                categoryIds,
                story.storyId,
                SIMILAR_STORIES_LIMIT,
            )
        ).map((item) => new StoryListItemDTO(item));

        return story;
    }

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        if (data.categoryIds?.length) {
            await ensureCategoriesExist(data.categoryIds);
        }

        const { generateSummary, ...storyFields } = data;
        const summary = await this.resolveSummary(generateSummary, storyFields.body);
        if (summary) storyFields.summary = summary;

        return new StoryDTO(await this.storyRepository.create(storyFields));
    }

    async getAllStories(query: ListStoriesQuery): Promise<ListResponse<StoryListItemDTO>> {
        let authorUserId: string | undefined;

        if (query.authorUsername) {
            const author = await userService.findUserByUsername(query.authorUsername);

            if (!author) {
                return toListResponse([], query, 0);
            }

            authorUserId = author.id;
        }

        const result = await this.storyRepository.findAll(
            authorUserId ? { ...query, authorUserId } : query,
        );

        return toListResponse(
            result.data.map((story) => new StoryListItemDTO(story)),
            query,
            result.total,
        );
    }

    async getStoryById(storyId: string): Promise<StoryDTO> {
        const story = await this.storyRepository.findById(storyId);

        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.STORY_NOT_FOUND, { storyId: storyId });
        }

        return this.attachRelatedStories(new StoryDTO(story));
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
        const summary = await this.resolveSummary(generateSummary, storyFields.body);
        if (summary) storyFields.summary = summary;

        return new StoryDTO(await this.storyRepository.update(storyId, storyFields));
    }

    async generateStorySummary(storyId: string, regenerate?: boolean): Promise<StoryDTO> {
        const regenerateSummary = regenerate === true;
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

    async suggestCategoriesForStory(
        title: string | undefined,
        body: string,
    ): Promise<{ id: string; name: string }[]> {
        const allCategories = await categoryService.getAllCategories();
        if (allCategories.length === 0) return [];

        const content = title ? `${title}\n\n${body}` : body;
        const suggestedNames = await this.aiService.suggestCategories(
            content,
            allCategories.map((category) => category.name),
        );

        return allCategories
            .filter((category) => suggestedNames.includes(category.name))
            .map((category) => ({ id: category.id, name: category.name }));
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
