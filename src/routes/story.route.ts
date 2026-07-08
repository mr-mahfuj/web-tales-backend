import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireOwnerOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { StoryRepository } from '../repositories/story.repository.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/story.schema.js';

const router = Router();
const storyController = new StoryController();
const storyRepository = new StoryRepository();

const loadStoryOwner = async (storyId: string) => {
    const story = await storyRepository.findById(storyId.trim());
    return story?.userId;
};

router.post('/', authenticateToken, validate(createStorySchema), storyController.createStory);
router.get('/', validate(getAllStoriesSchema), storyController.getAllStories);
router.get('/:storyId', validate(getStorySchema), storyController.getStoryById);
router.patch(
    '/:storyId',
    authenticateToken,
    validate(updateStorySchema),
    requireOwnerOrAdmin((req) => loadStoryOwner(req.params.storyId as string)),
    storyController.updateStory,
);
router.delete(
    '/:storyId',
    authenticateToken,
    validate(deleteStorySchema),
    requireOwnerOrAdmin((req) => loadStoryOwner(req.params.storyId as string)),
    storyController.deleteStory,
);

export default router;
