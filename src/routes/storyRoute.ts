import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { rateLimit } from '../middleware/rateLimitMiddleware.js';
import { StoryService } from '../services/story.service.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/storySchema.js';
import { STORY_RATE_LIMITS } from '../constants/rateLimit.js';

const router = Router();
const storyService = new StoryService();

const storyRateLimit = rateLimit({
    windowMs: STORY_RATE_LIMITS.windowMs,
    max: STORY_RATE_LIMITS.max,
});

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
router.post(
    '/:storyId/summary',
    authenticateToken,
    storyRateLimit,
    validate(getStorySchema),
    requireOwnerOrAdmin<{ storyId: string }>((req) =>
        storyService.getStoryOwnerId(req.params.storyId),
    ),
    StoryController.generateSummary,
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
