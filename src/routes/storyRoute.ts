import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { StoryService } from '../services/story.service.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/storySchema.js';

const router = Router();
const storyService = new StoryService();

router.post('/', authenticateToken, validate(createStorySchema), StoryController.createStory);
router.get('/', validate(getAllStoriesSchema), StoryController.getAllStories);
router.get('/:storyId', validate(getStorySchema), StoryController.getStoryById);
router.patch(
    '/:storyId',
    authenticateToken,
    validate(updateStorySchema),
    requireOwnerOrAdmin<{ storyId: string }>((req) =>
        storyService.getStoryOwnerId(req.params.storyId),
    ),
    StoryController.updateStory,
);
router.delete(
    '/:storyId',
    authenticateToken,
    validate(deleteStorySchema),
    requireOwnerOrAdmin<{ storyId: string }>((req) =>
        storyService.getStoryOwnerId(req.params.storyId),
    ),
    StoryController.deleteStory,
);

export default router;
