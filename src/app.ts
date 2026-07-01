import express from 'express';
import healthRouter from './routes/health.route.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
