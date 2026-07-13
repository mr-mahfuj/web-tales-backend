import type { Prisma } from '@prisma/client';
import { type Story } from '@prisma/client';
import type { CreateStoryDTO, UpdateStoryDTO } from '../dtos/storyDTO.js';
import prisma from '../config/prisma.js';
import type { ListStoriesQuery } from '../schemas/storySchema.js';

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

const buildStoryWhere = (search?: string): Prisma.StoryWhereInput => {
    const trimmed = search?.trim();
    if (!trimmed) return {};

    return {
        OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { body: { contains: trimmed, mode: 'insensitive' } },
        ],
    };
};

export class StoryRepository {
    async create(data: CreateStoryDTO): Promise<Story> {
        return prisma.story.create({ data });
    }

    async findAll(query: ListStoriesQuery): Promise<{ data: Story[]; total?: number }> {
        const where = buildStoryWhere(query.search);
        const orderBy = getStoryOrderBy(query.orderBy);

        const [data, total] = await Promise.all([
            prisma.story.findMany({
                where,
                orderBy,
                skip: query.offset,
                take: query.limit,
            }),
            query.count ? prisma.story.count({ where }) : Promise.resolve(undefined),
        ]);

        return {
            data,
            ...(total !== undefined ? { total } : {}),
        };
    }

    async findById(storyId: string): Promise<Story | null> {
        return prisma.story.findUnique({ where: { storyId } });
    }

    async update(storyId: string, data: UpdateStoryDTO): Promise<Story> {
        return prisma.story.update({
            where: { storyId },
            data: data as Prisma.StoryUpdateInput,
        });
    }

    async delete(storyId: string): Promise<boolean> {
        await prisma.story.delete({ where: { storyId } });
        return true;
    }
}
