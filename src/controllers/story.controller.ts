import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateStoryDTO, StoryDTO, UpdateStoryDTO } from '../dtos/story.dto.js';
import type { ListStoriesQuery } from '../schemas/story.schema.js';
import { StoryService } from '../services/story.service.js';
import { toListResponse } from '../utils/list-response.js';

const storyService = new StoryService();

type StoryIdParams = { storyId: string };

export class StoryController {
    async createStory(req: Request, res: Response) {
        const story = await storyService.createStory(req.body as CreateStoryDTO);

        return res.status(StatusCode.Created).json(story);
    }

    async getAllStories(req: Request, res: Response) {
        const query = req.query as unknown as ListStoriesQuery;
        const result = await storyService.getAllStories(query);

        return res
            .status(StatusCode.Ok)
            .json(toListResponse<StoryDTO>(result.data, query, result.meta.total));
    }

    async getStoryById(req: Request<StoryIdParams>, res: Response) {
        const story = await storyService.getStoryById(req.params.storyId);

        return res.status(StatusCode.Ok).json(story);
    }

    async updateStory(req: Request<StoryIdParams>, res: Response) {
        const updatedStory = await storyService.updateStory(
            req.params.storyId,
            req.body as UpdateStoryDTO,
        );

        return res.status(StatusCode.Ok).json(updatedStory);
    }

    async deleteStory(req: Request<StoryIdParams>, res: Response) {
        await storyService.delete(req.params.storyId);

        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    }
}
