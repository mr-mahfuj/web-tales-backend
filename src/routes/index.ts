import { Router } from 'express';
import healthRouter from './health.route.js';
import userRouter from './user.route.js';
import storyRouter from './story.route.js';
import docsRouter from './docs.route.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/stories', storyRouter);
router.use('/api-docs', docsRouter);

export default router;
