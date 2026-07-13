import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { StoryService } from '../services/story.service.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/story.schema.js';

const router = Router();
const storyService = new StoryService();

router.post('/', authenticateToken, validate(createStorySchema), StoryController.createStory);
router.get('/', validate(getAllStoriesSchema), StoryController.getAllStories);
router.get('/:storyId', validate(getStorySchema), StoryController.getStoryById);
router.patch(
    '/:storyId',
    authenticateToken,
    requireOwnerOrAdmin<{ storyId: string }>((req) =>
        storyService.getStoryOwnerId(req.params.storyId),
    ),
    validate(updateStorySchema),
    StoryController.updateStory,
);
router.delete(
    '/:storyId',
    authenticateToken,
    requireOwnerOrAdmin<{ storyId: string }>((req) =>
        storyService.getStoryOwnerId(req.params.storyId),
    ),
    validate(deleteStorySchema),
    StoryController.deleteStory,
);

export default router;
