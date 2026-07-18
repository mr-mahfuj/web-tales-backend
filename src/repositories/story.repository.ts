import type { Prisma } from '@prisma/client';
import { type Story } from '@prisma/client';
import type { CreateStoryDTO, UpdateStoryDTO } from '../dtos/storyDTO.js';
import prisma from '../config/prisma.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';
import {
    mapStoryCategoriesConnect,
    mapStoryCategoriesSet,
} from '../utils/storyCategoriesMapper.js';
import { storyCategoriesSelect } from '../utils/storyCategorySelect.js';

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
    async create(data: CreateStoryDTO): Promise<Story> {
        const { categoryIds, summary, ...storyFields } = data;
        return prisma.story.create({
            data: {
                ...storyFields,
                ...(summary !== undefined ? { summary } : {}),
                ...mapStoryCategoriesConnect(categoryIds),
            },
            include: { categories: { select: storyCategoriesSelect } },
        });
    }

    async findAll(query: ListStoriesQuery): Promise<{ data: Story[]; total?: number }> {
        const where = buildStoryWhere(query.search, query.category);
        const orderBy = getStoryOrderBy(query.orderBy);

        const [data, total] = await Promise.all([
            prisma.story.findMany({
                where,
                orderBy,
                skip: query.offset,
                take: query.limit,
                include: { categories: { select: storyCategoriesSelect } },
            }),
            query.count ? prisma.story.count({ where }) : Promise.resolve(undefined),
        ]);

        return {
            data,
            ...(total !== undefined ? { total } : {}),
        };
    }

    async findById(storyId: string): Promise<Story | null> {
        return prisma.story.findUnique({
            where: { storyId },
            include: { categories: { select: storyCategoriesSelect } },
        });
    }

    async update(storyId: string, data: UpdateStoryDTO): Promise<Story> {
        const { categoryIds, summary, ...storyFields } = data;
        return prisma.story.update({
            where: { storyId },
            data: {
                ...storyFields,
                ...(summary !== undefined ? { summary } : {}),
                ...mapStoryCategoriesSet(categoryIds),
            } as Prisma.StoryUpdateInput,
            include: { categories: { select: storyCategoriesSelect } },
        });
    }

    async delete(storyId: string): Promise<boolean> {
        await prisma.story.delete({ where: { storyId } });
        return true;
    }

    async existsById(storyId: string): Promise<boolean> {
        const story = prisma.story.findUnique({
            where: {
                storyId,
            },
            select: {
                storyId: true,
            },
        });
        return story !== null;
    }
}
