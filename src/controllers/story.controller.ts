import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateStoryDTO, UpdateStoryDTO } from '../dtos/story.dto.js';
import type { ListStoriesQuery } from '../schemas/story.schema.js';
import { StoryService } from '../services/story.service.js';
import { mapStoryListResponse } from '../utils/story-list.mapper.js';
import {
    getValidatedBody,
    getValidatedParams,
    getValidatedQuery,
} from '../middleware/validate.middleware.js';

const storyService = new StoryService();

export class StoryController {
    async createStory(req: Request, res: Response) {
        const story = await storyService.createStory(
            req.user!.id,
            getValidatedBody<CreateStoryDTO>(req),
        );

        return res.status(StatusCode.Created).json(story);
    }

    async getAllStories(req: Request, res: Response) {
        const query = getValidatedQuery<ListStoriesQuery>(req);
        const result = await storyService.getAllStories(query);

        return res.status(StatusCode.Ok).json(mapStoryListResponse(result, query));
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
            { id: req.user!.id, role: req.user!.role },
            getValidatedBody<UpdateStoryDTO>(req),
        );

        return res.status(StatusCode.Ok).json(updatedStory);
    }

    async deleteStory(req: Request, res: Response) {
        const { storyId } = getValidatedParams<{ storyId: string }>(req);
        await storyService.delete(storyId, {
            id: req.user!.id,
            role: req.user!.role,
        });

        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    }
}
