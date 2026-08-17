import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { notFoundHandler } from './middleware/notFoundMiddleware.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);
app.use(cookieParser());

app.use(express.json());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
