import type { CreateStoryDTO, UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';
import { NotFoundError } from '../common/errors/index.js';
import { StoryRepository } from '../repositories/story.repository.js';

export class StoryService {
    constructor(private readonly storyRepository = new StoryRepository()) {}

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        return this.storyRepository.create(data);
    }

    getAllStories(): Promise<StoryDTO[]> {
        return this.storyRepository.findAll();
    }

    async getStoryById(storyId: string): Promise<StoryDTO> {
        const normalizedStoryId = storyId.trim();
        const story = await this.storyRepository.findById(normalizedStoryId);

        if (!story) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return story;
    }

    async updateStory(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        const normalizedStoryId = storyId.trim();

        const existingStory = await this.storyRepository.findById(normalizedStoryId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return this.storyRepository.update(normalizedStoryId, data);
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
}
