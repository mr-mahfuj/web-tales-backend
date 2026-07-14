import type { Request, Response } from 'express';
import { StatusCode } from '../constants/status-code.js';
import { StoryService } from '../services/story.service.js';
import type {
    createStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
    deleteStorySchema,
} from '../schemas/storySchema.js';
import type { Validated } from '../types/validation.js';

const storyService = new StoryService();

type ValidatedRequest<S> = Request & { validated?: Validated<S> };

export const StoryController = {
    createStory: async (req: ValidatedRequest<typeof createStorySchema>, res: Response) => {
        const story = await storyService.createStory(req.validated.body);
        return res.status(StatusCode.Created).json(story);
    },

    getAllStories: async (req: ValidatedRequest<typeof getAllStoriesSchema>, res: Response) => {
        const query = req.validated.query;
        const stories = await storyService.getAllStories(query);
        return res.status(StatusCode.Ok).json(stories);
    },

    getStoryById: async (req: ValidatedRequest<typeof getStorySchema>, res: Response) => {
        const { storyId } = req.validated.params;
        const story = await storyService.getStoryById(storyId);
        return res.status(StatusCode.Ok).json(story);
    },

    updateStory: async (req: ValidatedRequest<typeof updateStorySchema>, res: Response) => {
        const { storyId } = req.validated.params;
        const updatedStory = await storyService.updateStory(storyId, req.validated.body);
        return res.status(StatusCode.Ok).json(updatedStory);
    },

    deleteStory: async (req: ValidatedRequest<typeof deleteStorySchema>, res: Response) => {
        const { storyId } = req.validated.params;
        await storyService.delete(storyId);
        return res.status(StatusCode.Ok).json({
            message: 'Story deleted successfully',
        });
    },
};
