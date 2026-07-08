import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../schemas/story.schema.js';

const router = Router();
const storyController = new StoryController();

router.post(
    '/',
    authenticateToken,
    validate(createStorySchema),
    storyController.createStory.bind(storyController),
);
router.get('/', validate(getAllStoriesSchema), storyController.getAllStories.bind(storyController));
router.get(
    '/:storyId',
    validate(getStorySchema),
    storyController.getStoryById.bind(storyController),
);
router.patch(
    '/:storyId',
    authenticateToken,
    validate(updateStorySchema),
    storyController.updateStory.bind(storyController),
);
router.delete(
    '/:storyId',
    authenticateToken,
    validate(deleteStorySchema),
    storyController.deleteStory.bind(storyController),
);

export default router;
