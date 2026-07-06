import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateStoryDTO, UpdateStoryDTO } from '../dtos/story.dto.js';
import type { ListStoriesQuery } from '../validation/story.validation.js';
import { StoryService } from '../services/story.service.js';

const getValidatedBody = <T>(req: Request): T => req.validatedBody as T;
const getValidatedParams = <T extends Record<string, string>>(req: Request): T =>
    req.validatedParams as T;
const getValidatedQuery = <T>(req: Request): T => req.validatedQuery as T;

const storyService = new StoryService();

export class StoryController {
    async createStory(req: Request, res: Response) {
        const story = await storyService.createStory(getValidatedBody<CreateStoryDTO>(req));

        return res.status(StatusCode.Created).json(story);
    }

    async getAllStories(req: Request, res: Response) {
        const query = getValidatedQuery<ListStoriesQuery>(req);
        const result = await storyService.getAllStories(query);

        return res.status(StatusCode.Ok).json({
            data: result.data,
            meta: {
                offset: query.offset,
                limit: query.limit,
                ...(result.total !== undefined ? { total: result.total } : {}),
            },
        });
    }

    async getStoryById(req: Request, res: Response) {
        const { storyId } = getValidatedParams<{ storyId: string }>(req);
        const story = await storyService.getStoryById(storyId);

        return res.status(StatusCode.Ok).json(story);
    }

    async updateStory(req: Request, res: Response) {
        const { storyId } = getValidatedParams<{ storyId: string }>(req);
        const updatedStory = await storyService.updateStory(
            storyId,
            getValidatedBody<UpdateStoryDTO>(req),
        );

        return res.status(StatusCode.Ok).json(updatedStory);
    }

    async deleteStory(req: Request, res: Response) {
        const { storyId } = getValidatedParams<{ storyId: string }>(req);
        await storyService.delete(storyId);

        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    }
}
