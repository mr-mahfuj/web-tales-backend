import type { Response } from 'express';
import { StatusCode } from '../constants/index.js';
import { StoryService } from '../services/story.service.js';
import type {
    createStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
    deleteStorySchema,
} from '../schemas/storySchema.js';
import type { ValidatedRequest } from '../types/validation.js';

const storyService = new StoryService();

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

    generateSummary: async (req: ValidatedRequest<typeof getStorySchema>, res: Response) => {
        const { storyId } = req.validated.params;
        const { regenerate } = req.validated.regenerate;
        const story = await storyService.generateStorySummary(storyId, regenerate);
        return res.status(StatusCode.Ok).json(story);
    },
};
