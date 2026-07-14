import type { z } from 'zod';
import type { createStoryBodySchema, updateStoryBodySchema } from '../schemas/storySchema.js';
import type { Category, Story } from '@prisma/client';

export type CreateStoryDTO = z.output<typeof createStoryBodySchema>;
export type UpdateStoryDTO = z.output<typeof updateStoryBodySchema>;

type StoryWithCategories = Story & { categories?: Category[] };

export class StoryDTO {
    readonly userId: string;
    readonly storyId: string;
    readonly title: string;
    readonly body: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly categories: { id: string; name: string }[];

    constructor(story: StoryWithCategories) {
        this.userId = story.userId;
        this.storyId = story.storyId;
        this.title = story.title;
        this.body = story.body;
        this.createdAt = story.createdAt;
        this.updatedAt = story.updatedAt;
        this.categories = (story.categories ?? []).map((category) => ({
            id: category.id,
            name: category.name,
        }));
    }
}
