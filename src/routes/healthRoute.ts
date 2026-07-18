import { Router } from 'express';
import prisma from '../config/prisma.js';
import { StatusCode } from '../constants/status-code.js';

const router = Router();

router.get('/', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(StatusCode.Ok).json({
        status: 'UP',
        db: 'UP',
        timeStamp: new Date().toISOString(),
    });
});

export default router;
