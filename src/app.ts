import express from 'express';
import healthRouter from './routes/health.route.js';
import userRouter from './routes/user.route.js';

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', userRouter);

export default app;
