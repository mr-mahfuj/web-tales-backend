import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';

const app = express();

app.use(express.json());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
