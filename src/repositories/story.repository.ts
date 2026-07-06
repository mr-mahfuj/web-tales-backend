import type { Prisma } from '@prisma/client';
import type { CreateStoryDTO, UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';
import prisma from '../config/prisma.js';
import { toStoryDTO } from '../utils/story.mapper.js';

export class StoryRepository {
    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        return await operation();
    }

    async create(data: CreateStoryDTO): Promise<StoryDTO> {
        return this.execute(async () => {
            const story = await prisma.story.create({
                data,
            });

            return toStoryDTO(story);
        });
    }

    async findAll(): Promise<StoryDTO[]> {
        return this.execute(async () => {
            const stories = await prisma.story.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return stories.map(toStoryDTO);
        });
    }

    async findById(storyId: string): Promise<StoryDTO | null> {
        return this.execute(async () => {
            const story = await prisma.story.findUnique({
                where: { storyId },
            });

            return story ? toStoryDTO(story) : null;
        });
    }

    async update(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        return this.execute(async () => {
            const story = await prisma.story.update({
                where: { storyId },
                data: data as Prisma.StoryUpdateInput,
            });

            return toStoryDTO(story);
        });
    }

    async delete(storyId: string): Promise<boolean> {
        return this.execute(async () => {
            await prisma.story.delete({
                where: { storyId },
            });

            return true;
        });
    }
}
