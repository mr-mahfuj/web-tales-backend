import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.enum.js';
import type { CreateStoryDTO, StoryDTO, UpdateStoryDTO } from '../dtos/story.dto.js';
import { StoryService } from '../services/story.service.js';
import { toListResponse } from '../utils/list-response.js';
import type { ListStoriesQuery } from '../schemas/story.schema.js';

const storyService = new StoryService();

export const StoryController = {
    createStory: async (req: Request, res: Response) => {
        const story = await storyService.createStory(req.body as CreateStoryDTO);
        return res.status(StatusCode.Created).json(story);
    },

    getAllStories: async (req: Request, res: Response) => {
        const query = req.query as unknown as ListStoriesQuery;
        const result = await storyService.getAllStories(query);
        return res
            .status(StatusCode.Ok)
            .json(toListResponse<StoryDTO>(result.data, query, result.meta.total));
    },

    getStoryById: async (req: Request, res: Response) => {
        const { storyId } = req.params as { storyId: string };
        const story = await storyService.getStoryById(storyId);
        return res.status(StatusCode.Ok).json(story);
    },

    updateStory: async (req: Request, res: Response) => {
        const { storyId } = req.params as { storyId: string };
        const updatedStory = await storyService.updateStory(storyId, req.body as UpdateStoryDTO);
        return res.status(StatusCode.Ok).json(updatedStory);
    },

    deleteStory: async (req: Request, res: Response) => {
        const { storyId } = req.params as { storyId: string };
        await storyService.delete(storyId);
        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    },
};
