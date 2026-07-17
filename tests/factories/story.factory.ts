import type { Story } from '@prisma/client';
import { StoryDTO, type CreateStoryDTO, type UpdateStoryDTO } from '../../src/dtos/storyDTO.js';
import type { ListStoriesQuery } from '../../src/schemas/storySchema.js';

let counter = 0;
const nextStoryId = () => `story-${++counter}`;
const nextTitle = () => `story-titl-${counter}`;
const nextBody = () => `story-body-${counter}`;
const nextUserId = () => `story-user-${counter}`;
const nextSummary = () => `story-summary-${counter}`;

export function buildStory(overrides: Partial<Story> = {}): Story {
    return {
        storyId: nextStoryId(),
        title: nextTitle(),
        body: nextBody(),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        userId: nextUserId(),
        summary: nextSummary(),
    };
}

export function buildStoryList(count = 3): Story[] {
    return Array.from({ length: count }, (_, index) =>
        buildStory({ title: `story-${index}`, body: `story-body-${index}` }),
    );
}

export function buildStoryDTO(overrides: Partial<Story> = {}): StoryDTO {
    return new StoryDTO(buildStory(overrides));
}

export function buildCreateStoryDTO(overrides: Partial<CreateStoryDTO> = {}): CreateStoryDTO {
    return {
        userId: nextUserId(),
        title: nextTitle(),
        body: nextBody(),
        categoryIds: [],
        ...overrides,
    };
}

export function buildUpdateStoryDTO(overrides: Partial<UpdateStoryDTO> = {}): UpdateStoryDTO {
    return {
        userId: nextUserId(),
        title: nextTitle(),
        body: nextBody(),
        categoryIds: [],
        ...overrides,
    };
}

export function buildListStoriesQuery(overrides: Partial<ListStoriesQuery> = {}): ListStoriesQuery {
    return {
        offset: 0,
        limit: 10,
        orderBy: 'createdAt',
        count: false,
        ...overrides,
    };
}
