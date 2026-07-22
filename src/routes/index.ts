import { Router } from 'express';
import healthRouter from './healthRoute.js';
import userRouter from './userRoute.js';
import storyRouter from './storyRoute.js';
import docsRouter from './docsRoute.js';
import authRouter from './authRoute.js';
import categoryRouter from './categoryRoute.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', userRouter);
router.use('/stories', storyRouter);
router.use('/api-docs', docsRouter);
router.use('/auth', authRouter);
router.use('/categories', categoryRouter);

export default router;
