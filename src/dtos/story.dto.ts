import type { z } from 'zod';
import type {
    createStoryBodySchema,
    updateStoryBodySchema,
} from '../validation/story.validation.js';

export type CreateStoryDTO = z.infer<typeof createStoryBodySchema>;
export type UpdateStoryDTO = z.infer<typeof updateStoryBodySchema>;

export interface StoryDTO {
    userId: string;
    storyId: string;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}
