import { Router } from 'express';
import prisma from '../config/prisma.js';
import { StatusCode } from '../constants/status-code.enum.js';

const router = Router();

router.get('/', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return res.status(StatusCode.Ok).json({
            status: 'UP',
            db: 'UP',
            timeStamp: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(StatusCode.ServiceUnavailable).json({
            status: 'DOWN',
            db: 'DOWN',
            timeStamp: new Date().toISOString(),
        });
    }
});

export default router;
