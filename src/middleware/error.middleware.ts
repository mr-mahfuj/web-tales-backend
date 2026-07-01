import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { StatusCode } from '../constants/status-code.enum.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(StatusCode.Conflict).json({
                success: false,
                message: 'Duplicate value',
                errors: err.meta?.target ?? [],
            });
        }

        if (err.code === 'P2025') {
            return res.status(StatusCode.NotFound).json({
                success: false,
                message: 'Record not found',
            });
        }
    }

    return res.status(StatusCode.InternalServerError).json({
        success: false,
        message: 'Internal server error',
    });
};
