import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { rateLimit } from '../middleware/rateLimitMiddleware.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/storySchema.js';
import { STORY_RATE_LIMITS } from '../constants/index.js';

const router = Router();

const storyRateLimit = rateLimit({
    windowMs: STORY_RATE_LIMITS.windowMs,
    max: STORY_RATE_LIMITS.max,
});

router
    .route('/')
    .post(authenticateToken, validate(createStorySchema), StoryController.createStory)
    .get(validate(getAllStoriesSchema), StoryController.getAllStories);

router
    .route('/:storyId')
    .get(validate(getStorySchema), StoryController.getStoryById)
    .patch(
        authenticateToken,
        validate(updateStorySchema),
        requireOwnerOrAdmin('story', 'storyId', 'userId'),
        StoryController.updateStory,
    )
    .delete(
        authenticateToken,
        validate(deleteStorySchema),
        requireOwnerOrAdmin('story', 'storyId', 'userId'),
        StoryController.deleteStory,
    );

router.post(
    '/:storyId/summary',
    authenticateToken,
    storyRateLimit,
    validate(getStorySchema),
    requireOwnerOrAdmin('story', 'storyId', 'userId'),
    StoryController.generateSummary,
);

export default router;
