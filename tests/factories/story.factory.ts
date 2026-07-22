export function buildCreateStoryDTO(overrides = {}) {
    return {
        userId: 'u-1',
        title: 'A Great Story',
        body: 'Once upon a time...',
        categoryIds: [],
        generateSummary: false,
        ...overrides,
    };
}

export function buildUpdateStoryDTO(overrides = {}) {
    return {
        title: 'Updated Title',
        ...overrides,
    };
}

export function buildStory(overrides = {}) {
    return {
        storyId: 's-1',
        title: 'A Great Story',
        body: 'Once upon a time...',
        summary: null,
        userId: 'u-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides,
    };
}

export function buildStoryList(count = 2) {
    return Array.from({ length: count }, (_, i) =>
        buildStory({ storyId: `s-${i + 1}`, title: `Story ${i + 1}` }),
    );
}

/** @param {{ offset?: number; limit?: number; count?: boolean; orderBy?: 'title' | 'createdAt' | 'updatedAt'; search?: string; category?: string }} [overrides] */
export function buildListStoriesQuery(overrides = {}) {
    return {
        offset: 0,
        limit: 10,
        count: true,
        orderBy: 'createdAt',
        ...overrides,
    };
}
