import type { Prisma } from '@prisma/client';

export type StoryCategoriesCreateInput = Pick<Prisma.StoryUncheckedCreateInput, 'categories'>;

export type StoryCategoriesUpdateInput = Pick<Prisma.StoryUpdateInput, 'categories'>;

const toIdRefs = (categoryIds?: string[]): { id: string }[] | undefined =>
    categoryIds?.length ? categoryIds.map((id) => ({ id })) : undefined;

export const mapStoryCategoriesConnect = (categoryIds?: string[]): StoryCategoriesCreateInput => {
    const ids = toIdRefs(categoryIds);
    return ids ? { categories: { connect: ids } } : {};
};

export const mapStoryCategoriesSet = (categoryIds?: string[]): StoryCategoriesUpdateInput => {
    const ids = toIdRefs(categoryIds);
    return ids
        ? {
              categories: {
                  set: ids,
              },
          }
        : {};
};
