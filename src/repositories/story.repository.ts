import type { Prisma } from '@prisma/client';
import type {
    CreateStoryDTO,
    StoryDetailRow,
    StoryListRow,
    UpdateStoryDTO,
} from '../dtos/storyDTO.js';
import prisma from '../config/prisma.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import {
    mapStoryCategoriesConnect,
    mapStoryCategoriesSet,
} from '../utils/storyCategoriesMapper.js';
import { storyDetailInclude, storyListSelect } from '../utils/storySelect.js';

const getStoryOrderBy = (
    orderBy: ListStoriesQuery['orderBy'],
): Prisma.StoryOrderByWithRelationInput => {
    switch (orderBy) {
        case 'updatedAt':
            return { updatedAt: 'desc' };
        case 'title':
            return { title: 'asc' };
        case 'createdAt':
        default:
            return { createdAt: 'desc' };
    }
};

const buildStoryWhere = (search?: string, category?: string): Prisma.StoryWhereInput => {
    const conditions: Prisma.StoryWhereInput[] = [];

    if (search) {
        conditions.push({
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { body: { contains: search, mode: 'insensitive' } },
            ],
        });
    }

    if (category) {
        conditions.push({
            categories: {
                some: { name: { equals: category, mode: 'insensitive' } },
            },
        });
    }

    if (conditions.length === 0) return {};
    return { AND: conditions };
};

export class StoryRepository {
    async create(data: CreateStoryDTO): Promise<StoryDetailRow> {
        const { categoryIds, summary, ...storyFields } = data;
        return prisma.story.create({
            data: {
                ...storyFields,
                ...(summary !== undefined ? { summary } : {}),
                ...mapStoryCategoriesConnect(categoryIds),
            },
            include: storyDetailInclude,
        });
    }

    async findAll(
        query: ListStoriesQuery & { authorUserId?: string },
    ): Promise<{ data: StoryListRow[]; total?: number }> {
        const where = buildStoryWhere(query.search, query.category);
        const orderBy = getStoryOrderBy(query.orderBy);
        const storyWhere = query.authorUserId
            ? { AND: [where, { userId: query.authorUserId }] }
            : where;

        const [data, total] = await Promise.all([
            prisma.story.findMany({
                where: storyWhere,
                orderBy,
                skip: query.offset,
                take: query.limit,
                select: storyListSelect,
            }),
            query.count ? prisma.story.count({ where: storyWhere }) : Promise.resolve(undefined),
        ]);

        return {
            data,
            ...(total !== undefined ? { total } : {}),
        };
    }

    async findById(storyId: string): Promise<StoryDetailRow | null> {
        return prisma.story.findUnique({
            where: { storyId },
            include: storyDetailInclude,
        });
    }

    async update(storyId: string, data: UpdateStoryDTO): Promise<StoryDetailRow> {
        const { categoryIds, summary, ...storyFields } = data;
        return prisma.story.update({
            where: { storyId },
            data: {
                ...storyFields,
                ...(summary !== undefined ? { summary } : {}),
                ...mapStoryCategoriesSet(categoryIds),
            } as Prisma.StoryUpdateInput,
            include: storyDetailInclude,
        });
    }

    async delete(storyId: string): Promise<boolean> {
        await prisma.story.delete({ where: { storyId } });
        return true;
    }

    async existsById(storyId: string): Promise<boolean> {
        const story = await prisma.story.findUnique({
            where: { storyId },
            select: { storyId: true },
        });
        return story !== null;
    }

    async findSimilarByCategories(
        categoryIds: string[],
        excludeStoryId: string,
        limit: number,
    ): Promise<StoryListRow[]> {
        if (categoryIds.length === 0) return [];

        return prisma.story.findMany({
            where: {
                storyId: { not: excludeStoryId },
                categories: { some: { id: { in: categoryIds } } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: storyListSelect,
        });
    }
}
