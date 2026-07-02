import type { CreateStoryDTO, UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors/index.js';
import type { IStoryRepository } from '../interfaces/IStoryRepository.js';
import { StoryRepository } from '../repositories/story.repository.js';

export class StoryService {
    constructor(private readonly storyRepository: IStoryRepository = new StoryRepository()) {}

    private normalizeStoryId(storyId: string | string[] | undefined): string {
        if (typeof storyId !== 'string') {
            throw new ValidationError('Invalid story ID', { field: 'storyId' });
        }

        const normalizedStoryId = storyId.trim();

        if (!normalizedStoryId) {
            throw new ValidationError('Invalid story ID', { field: 'storyId' });
        }

        return normalizedStoryId;
    }

    private normalizeRequiredText(value: string | undefined, fieldName: string): string {
        const normalizedValue = value?.trim();

        if (!normalizedValue) {
            throw new ValidationError(`${fieldName} is required`, { field: fieldName });
        }

        return normalizedValue;
    }

    private normalizeUpdateData(data: UpdateStoryDTO): UpdateStoryDTO {
        const normalizedData: UpdateStoryDTO = {};

        if (data.title !== undefined) {
            const title = data.title.trim();

            if (!title) {
                throw new ValidationError('title cannot be empty', { field: 'title' });
            }

            normalizedData.title = title;
        }

        if (data.body !== undefined) {
            const body = data.body.trim();

            if (!body) {
                throw new ValidationError('body cannot be empty', { field: 'body' });
            }

            normalizedData.body = body;
        }

        if (Object.keys(normalizedData).length === 0) {
            throw new ValidationError('At least one field is required');
        }

        return normalizedData;
    }

    async createStory(data: CreateStoryDTO): Promise<StoryDTO> {
        if (!data.title?.trim() || !data.body?.trim()) {
            throw new ValidationError('title or body is required');
        }

        const userId = this.normalizeRequiredText(data.userId, 'userId');
        const title = this.normalizeRequiredText(data.title, 'title');
        const body = this.normalizeRequiredText(data.body, 'body');

        return this.storyRepository.create({
            userId,
            title,
            body,
        });
    }

    getAllStories(): Promise<StoryDTO[]> {
        return this.storyRepository.findAll();
    }

    async getStoryById(storyId: string | string[] | undefined): Promise<StoryDTO> {
        const normalizedStoryId = this.normalizeStoryId(storyId);
        const story = await this.storyRepository.findById(normalizedStoryId);

        if (!story) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return story;
    }

    async updateStory(
        storyId: string | string[] | undefined,
        data: UpdateStoryDTO,
    ): Promise<StoryDTO> {
        const normalizedStoryId = this.normalizeStoryId(storyId);
        const normalizedData = this.normalizeUpdateData(data);

        const existingStory = await this.storyRepository.findById(normalizedStoryId);

        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }

        return this.storyRepository.update(normalizedStoryId, normalizedData);
    }

    async delete(storyId: string | string[] | undefined): Promise<boolean> {
        const normalizedStoryId = this.normalizeStoryId(storyId);
        const existingStory = await this.storyRepository.findById(normalizedStoryId);
        if (!existingStory) {
            throw new NotFoundError('Story not found', { storyId: normalizedStoryId });
        }
        await this.storyRepository.delete(normalizedStoryId);
        return true;
    }
}
