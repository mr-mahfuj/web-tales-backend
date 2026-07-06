import { Router } from 'express';
import { StoryController } from '../controllers/story.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    createStorySchema,
    deleteStorySchema,
    getAllStoriesSchema,
    getStorySchema,
    updateStorySchema,
} from '../validation/story.validation.js';

const router = Router();
const storyController = new StoryController();

router.post('/', validate(createStorySchema), storyController.createStory.bind(storyController));
router.get('/', validate(getAllStoriesSchema), storyController.getAllStories.bind(storyController));
router.get(
    '/:storyId',
    validate(getStorySchema),
    storyController.getStoryById.bind(storyController),
);
router.patch(
    '/:storyId',
    validate(updateStorySchema),
    storyController.updateStory.bind(storyController),
);
router.delete(
    '/:storyId',
    validate(deleteStorySchema),
    storyController.deleteStory.bind(storyController),
);

export default router;
