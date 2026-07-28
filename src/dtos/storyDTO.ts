import type { z } from 'zod';
import type { createStoryBodySchema, updateStoryBodySchema } from '../schemas/storySchema.js';
import type { Prisma } from '@prisma/client';
import type { storyDetailInclude, storyListSelect } from '../utils/storySelect.js';

export type CreateStoryBodyDTO = z.output<typeof createStoryBodySchema>;

export type CreateStoryDTO = CreateStoryBodyDTO & {
    userId: string;
};

export type UpdateStoryDTO = z.output<typeof updateStoryBodySchema>;
export type StoryDetailRow = Prisma.StoryGetPayload<{ include: typeof storyDetailInclude }>;
export type StoryListRow = Prisma.StoryGetPayload<{ select: typeof storyListSelect }>;

type AuthorDTO = { username: string; name: string };
type CategoryRefDTO = { id: string; name: string };

const toAuthorDTO = (user: { username: string; name: string }): AuthorDTO => ({
    username: user.username,
    name: user.name,
});

const toCategoryRefs = (categories: { id: string; name: string }[]): CategoryRefDTO[] =>
    categories.map((category) => ({ id: category.id, name: category.name }));

export class StoryDTO {
    readonly userId: string;
    readonly storyId: string;
    readonly title: string;
    readonly body: string;
    readonly sumary: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly author: AuthorDTO;
    readonly categories: CategoryRefDTO[];

    constructor(story: StoryDetailRow) {
        this.userId = story.userId;
        this.storyId = story.storyId;
        this.title = story.title;
        this.body = story.body;
        this.sumary = story.summary;
        this.createdAt = story.createdAt;
        this.updatedAt = story.updatedAt;
        this.author = toAuthorDTO(story.user);
        this.categories = toCategoryRefs(story.categories);
    }
}

export class StoryListItemDTO {
    readonly userId: string;
    readonly storyId: string;
    readonly title: string;
    readonly sumary: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly author: AuthorDTO;
    readonly categories: CategoryRefDTO[];

    constructor(story: StoryListRow) {
        this.userId = story.userId;
        this.storyId = story.storyId;
        this.title = story.title;
        this.sumary = story.summary;
        this.createdAt = story.createdAt;
        this.updatedAt = story.updatedAt;
        this.author = toAuthorDTO(story.user);
        this.categories = toCategoryRefs(story.categories);
    }
}
