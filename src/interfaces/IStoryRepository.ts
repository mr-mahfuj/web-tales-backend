import type { CreateStoryDTO, UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';

export interface IStoryRepository {
    create(data: CreateStoryDTO): Promise<StoryDTO>;
    findAll(): Promise<StoryDTO[]>;
    findById(StoryId: string): Promise<StoryDTO | null>;
    update(StoryId: string, data: UpdateStoryDTO): Promise<StoryDTO>;
    delete(storyId: string): Promise<boolean>;
}
