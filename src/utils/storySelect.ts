import { storyAuthorSelect } from '../utils/userSelect.js';
import type { Prisma } from '@prisma/client';

export const storyCategoriesSelect = {
    id: true,
    name: true,
} satisfies Prisma.CategorySelect;

export const storyDetailInclude = {
    categories: { select: storyCategoriesSelect },
    user: { select: storyAuthorSelect },
} satisfies Prisma.StoryInclude;

export const storyListSelect = {
    storyId: true,
    userId: true,
    title: true,
    summary: true,
    createdAt: true,
    updatedAt: true,
    user: { select: storyAuthorSelect },
    categories: { select: storyCategoriesSelect },
} satisfies Prisma.StorySelect;
