import { type CreateStoryDTO, type UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';
import { ForbiddenError, NotFoundError } from '../common/errors.js';
import { StoryRepository } from '../repositories/story.repository.js';
import type { ListStoriesQuery } from '../schemas/story.schema.js';

export class StoryService {
    constructor(private readonly storyRepository = new StoryRepository()) {}

    async createStory(userId: string, data: CreateStoryDTO): Promise<StoryDTO> {
        return new StoryDTO(await this.storyRepository.create({ ...data, userId }));
    }

    async getAllStories(query: ListStoriesQuery): Promise<{ data: StoryDTO[]; total?: number }> {
        const result = await this.storyRepository.findAll(query);

        return {
            data: result.data.map((story) => new StoryDTO(story)),
            ...(result.total !== undefined ? { total: result.total } : {}),
        };
    }

    async getStoryById(storyId: string): Promise<StoryDTO> {
        const normalizedStoryId = storyId.trim();
        const story = await this.storyRepository.findById(normalizedStoryId);

        if (!story) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return new StoryDTO(story);
    }

    async updateStory(
        storyId: string,
        actor: { id: string; role: 'ADMIN' | 'USER' },
        data: UpdateStoryDTO,
    ): Promise<StoryDTO> {
        const normalizedStoryId = storyId.trim();

        const existingStory = await this.storyRepository.findById(normalizedStoryId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        if (actor.role !== 'ADMIN' && existingStory.userId !== actor.id) {
            throw new ForbiddenError('You can only edit your own stories');
        }

        return new StoryDTO(await this.storyRepository.update(normalizedStoryId, data));
    }

    async delete(storyId: string, actor: { id: string; role: 'ADMIN' | 'USER' }): Promise<boolean> {
        const normalizedStoryId = storyId.trim();
        const existingStory = await this.storyRepository.findById(normalizedStoryId);
        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }
        if (actor.role !== 'ADMIN' && existingStory.userId !== actor.id) {
            throw new ForbiddenError('You can only delete your own stories');
        }
        await this.storyRepository.delete(normalizedStoryId);
        return true;
    }
}
