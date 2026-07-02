import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateStoryDTO, UpdateStoryDTO } from '../dtos/story.dto.js';
import { StoryService } from '../services/story.service.js';

const storyService = new StoryService();

export class StoryController {
    async createStory(req: Request, res: Response) {
        const story = await storyService.createStory(req.body as CreateStoryDTO);

        return res.status(StatusCode.Created).json(story);
    }

    async getAllStories(_req: Request, res: Response) {
        const stories = await storyService.getAllStories();

        return res.status(StatusCode.Ok).json(stories);
    }

    async getStoryById(req: Request, res: Response) {
        const story = await storyService.getStoryById(req.params.storyId);

        return res.status(StatusCode.Ok).json(story);
    }

    async updateStory(req: Request, res: Response) {
        const updatedStory = await storyService.updateStory(
            req.params.storyId,
            req.body as UpdateStoryDTO,
        );

        return res.status(StatusCode.Ok).json(updatedStory);
    }

    async deleteStory(req: Request, res: Response) {
        await storyService.delete(req.params.storyId);

        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    }
}
