import type { z } from 'zod';
import type { createStoryBodySchema, updateStoryBodySchema } from '../schemas/story.schema.js';
import type { Story } from '@prisma/client';

export type CreateStoryDTO = z.infer<typeof createStoryBodySchema>;
export type UpdateStoryDTO = z.infer<typeof updateStoryBodySchema>;

export class StoryDTO {
    readonly userId: string;
    readonly storyId: string;
    readonly title: string;
    readonly body: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(story: Story) {
        this.userId = story.userId;
        this.storyId = story.storyId;
        this.title = story.title;
        this.body = story.body;
        this.createdAt = story.createdAt;
        this.updatedAt = story.updatedAt;
    }
}
