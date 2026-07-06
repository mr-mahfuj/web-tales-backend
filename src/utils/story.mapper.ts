import type { StoryDTO } from '../dtos/story.dto.js';

type PrismaStory = {
    storyId: string;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
};

export const toStoryDTO = (story: PrismaStory): StoryDTO => {
    return {
        userId: story.userId,
        storyId: story.storyId,
        title: story.title,
        body: story.body,
        createdAt: story.createdAt.toISOString(),
        updatedAt: story.updatedAt.toISOString(),
    };
};
