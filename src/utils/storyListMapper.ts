import type { Story } from '@prisma/client';
import type { ListStoriesQuery } from '../schemas/storySchema.js';

export const mapStoryListResponse = (
    result: { data: Story[]; total?: number },
    query: ListStoriesQuery,
) => {
    return {
        data: result.data,
        meta: {
            offset: query.offset,
            limit: query.limit,
            ...(result.total !== undefined ? { total: result.total } : {}),
        },
    };
};
