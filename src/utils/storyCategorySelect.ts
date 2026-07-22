import type { Prisma } from '@prisma/client';

export const storyCategoriesSelect = {
    id: true,
    name: true,
} satisfies Prisma.CategorySelect;
