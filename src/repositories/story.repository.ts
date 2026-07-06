import { Prisma } from '@prisma/client';
import type { CreateStoryDTO, UpdateStoryDTO, StoryDTO } from '../dtos/story.dto.js';
import { QUERY_CONSTANTS } from '../constants/pagination.constants.js';
import prisma from '../config/prisma.js';
import { toStoryDTO } from '../utils/story.mapper.js';
import type { ListStoriesQuery } from '../validation/story.validation.js';

type StorySearchRow = {
    storyId: string;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
};

const getStoryOrderByClause = (orderBy: ListStoriesQuery['orderBy']) => {
    switch (orderBy) {
        case 'updatedAt':
            return Prisma.sql`u."updatedAt" DESC`;
        case 'title':
            return Prisma.sql`u."title" ASC`;
        case 'createdAt':
        default:
            return Prisma.sql`u."createdAt" DESC`;
    }
};

const buildStoryWhereClause = (search?: string) => {
    if (!search) {
        return Prisma.sql``;
    }

    return Prisma.sql`WHERE (
        similarity(u."title", ${search}) >= ${QUERY_CONSTANTS.FUZZY_SEARCH_THRESHOLD}
        OR similarity(u."body", ${search}) >= ${QUERY_CONSTANTS.FUZZY_SEARCH_THRESHOLD}
    )`;
};

const buildStoryOrderClause = (orderBy: ListStoriesQuery['orderBy'], search?: string) => {
    if (!search) {
        return Prisma.sql`ORDER BY ${getStoryOrderByClause(orderBy)}`;
    }

    return Prisma.sql`ORDER BY GREATEST(
            similarity(u."title", ${search}),
            similarity(u."body", ${search})
        ) DESC, ${getStoryOrderByClause(orderBy)}`;
};

export class StoryRepository {
    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        return await operation();
    }

    async create(data: CreateStoryDTO): Promise<StoryDTO> {
        return this.execute(async () => {
            const story = await prisma.story.create({
                data,
            });

            return toStoryDTO(story);
        });
    }

    async findAll(query: ListStoriesQuery): Promise<{ data: StoryDTO[]; total?: number }> {
        return this.execute(async () => {
            const searchTerm = query.search?.trim();
            const whereClause = buildStoryWhereClause(searchTerm);
            const orderClause = buildStoryOrderClause(query.orderBy, searchTerm);

            const stories = await prisma.$queryRaw<StorySearchRow[]>(Prisma.sql`
                SELECT
                    u."storyId",
                    u."title",
                    u."body",
                    u."createdAt",
                    u."updatedAt",
                    u."userId"
                FROM "Story" u
                ${whereClause}
                ${orderClause}
                OFFSET ${query.offset}
                LIMIT ${query.limit}
            `);

            const totalResult = query.count
                ? await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
                      SELECT COUNT(*)::int AS count
                      FROM "Story" u
                      ${whereClause}
                  `)
                : [];

            const total = totalResult[0]?.count;

            return {
                data: stories.map(toStoryDTO),
                ...(total !== undefined ? { total } : {}),
            };
        });
    }

    async findById(storyId: string): Promise<StoryDTO | null> {
        return this.execute(async () => {
            const story = await prisma.story.findUnique({
                where: { storyId },
            });

            return story ? toStoryDTO(story) : null;
        });
    }

    async update(storyId: string, data: UpdateStoryDTO): Promise<StoryDTO> {
        return this.execute(async () => {
            const story = await prisma.story.update({
                where: { storyId },
                data: data as Prisma.StoryUpdateInput,
            });

            return toStoryDTO(story);
        });
    }

    async delete(storyId: string): Promise<boolean> {
        return this.execute(async () => {
            await prisma.story.delete({
                where: { storyId },
            });

            return true;
        });
    }
}
