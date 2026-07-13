import { type CreateStoryDTO, type UpdateStoryDTO, StoryDTO } from '../dtos/storyDTO.js';
import { NotFoundError } from '../common/errors.js';
import { StoryRepository } from '../repositories/story.repository.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import { toListResponse, type ListResponse } from '../utils/paginationMapper.js';

export class StoryService {
    constructor(private readonly storyRepository = new StoryRepository()) {}

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        return new StoryDTO(await this.storyRepository.create({ ...data }));
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
        const normalizedStoryId = storyId.trim();
        const story = await this.storyRepository.findById(normalizedStoryId);

        if (!story) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return new StoryDTO(story);
    }

    async updateStory(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        const normalizedStoryId = storyId.trim();

        const existingStory = await this.storyRepository.findById(normalizedStoryId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }
        return new StoryDTO(await this.storyRepository.update(normalizedStoryId, data));
    }

    async delete(storyId: string): Promise<boolean> {
        const normalizedStoryId = storyId.trim();

        const existingStory = await this.storyRepository.findById(normalizedStoryId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }
        await this.storyRepository.delete(normalizedStoryId);

        return true;
    }

    async getStoryOwnerId(storyId: string): Promise<string | undefined> {
        const normalizedStoryId = storyId.trim();
        const story = await this.storyRepository.findById(normalizedStoryId);
        return story?.userId;
    }
}
