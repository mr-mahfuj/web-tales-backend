import type { NextFunction, Request, Response } from 'express';
import type { LogLevel } from '../common/errors.js';
import { AppError } from '../common/errors.js';
import { ERROR_MESSAGES, StatusCode } from '../constants/index.js';
import { formatZodIssues } from '../utils/errorFormatters.js';
import { logError } from '../utils/errorLogger.js';
import { ZodError } from 'zod';
import type { ErrorResponse } from '../types/apiResponse.js';

type NormalizedError = {
    name: string;
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    stack?: string | undefined;
    logLevel: LogLevel;
    exposeMessage: boolean;
    exposeDetails: boolean;
};

function isErrorLike(value: unknown): value is Error {
    return value instanceof Error;
}

function normalizeError(error: unknown): NormalizedError {
    if (error instanceof AppError) {
        return {
            name: error.name,
            statusCode: error.statusCode,
            code: error.code,
            message: error.message,
            details: error.details,
            stack: error.stack,
            logLevel: error.logLevel,
            exposeMessage: error.statusCode < StatusCode.InternalServerError,
            exposeDetails: error.statusCode < StatusCode.InternalServerError,
        };
    }

    if (error instanceof ZodError) {
        return {
            name: error.name,
            statusCode: StatusCode.BadRequest,
            code: 'VALIDATION_ERROR',
            message: ERROR_MESSAGES.VALIDATION_FAILED,
            details: formatZodIssues(error.issues),
            stack: error.stack,
            logLevel: 'warn',
            exposeMessage: true,
            exposeDetails: true,
        };
    }

    if (isErrorLike(error)) {
        return {
            name: error.name,
            statusCode: StatusCode.InternalServerError,
            code: error.name ? error.name.toUpperCase() : 'INTERNAL_SERVER_ERROR',
            message: error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG,
            details: undefined,
            stack: error.stack,
            logLevel: 'error',
            exposeMessage: process.env.NODE_ENV === 'development',
            exposeDetails: false,
        };
    }

    return {
        name: 'UnknownError',
        statusCode: StatusCode.InternalServerError,
        code: 'INTERNAL_SERVER_ERROR',
        message: ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        details: undefined,
        stack: undefined,
        logLevel: 'error',
        exposeMessage: false,
        exposeDetails: false,
    };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    const normalizedError = normalizeError(err);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message =
        normalizedError.exposeMessage || isDevelopment
            ? normalizedError.message
            : ERROR_MESSAGES.SOMETHING_WENT_WRONG;
    const details =
        normalizedError.exposeDetails || isDevelopment ? normalizedError.details : undefined;
    const stack = isDevelopment ? normalizedError.stack : undefined;

    logError({
        timestamp: new Date().toISOString(),
        request: {
            method: req.method,
            path: req.originalUrl,
            params: req.params,
            query: req.query,
        },
        error: {
            name: normalizedError.name,
            code: normalizedError.code,
            message: normalizedError.message,
            statusCode: normalizedError.statusCode,
            details: normalizedError.details,
            stack: normalizedError.stack,
            raw: err,
            logLevel: normalizedError.logLevel,
        },
    });

    const responseError: ErrorResponse['error'] = {
        message,
        code: normalizedError.code,
    };

    if (details !== undefined) {
        responseError.details = details;
    }

    if (stack !== undefined) {
        responseError.stack = stack;
    }

    return res.status(normalizedError.statusCode).json({
        success: false,
        error: responseError,
    } satisfies ErrorResponse);
}
