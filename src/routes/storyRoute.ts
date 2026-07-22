import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAccess } from '../middleware/authorizeMiddleware.js';
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
import { Role } from '@prisma/client';

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
        requireAccess(true, Role.ADMIN, Role.USER),
        StoryController.updateStory,
    )
    .delete(
        authenticateToken,
        validate(deleteStorySchema),
        requireAccess(true, Role.ADMIN, Role.USER),
        StoryController.deleteStory,
    );

router.post(
    '/:storyId/summary',
    authenticateToken,
    storyRateLimit,
    validate(getStorySchema),
    requireAccess(true, Role.ADMIN, Role.USER),
    StoryController.generateSummary,
);

export default router;
