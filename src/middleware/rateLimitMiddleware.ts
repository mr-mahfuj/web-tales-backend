import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { TooManyRequestsError } from '../common/errors.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import type { Bucket, RateLimitOptions } from '../types/rateLimiterInterface.js';

const buckets = new Map<string, Bucket>();

function getKey(req: Request, keyGenerator?: (req: Request) => string): string {
    if (keyGenerator) return keyGenerator(req);
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

function prune(now: number) {
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
    const { windowMs, max, keyGenerator } = options;

    return (req: Request, _res: Response, next: NextFunction) => {
        const now = Date.now();
        prune(now);

        const key = getKey(req, keyGenerator);
        const existing = buckets.get(key);
        const bucket: Bucket =
            existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

        bucket.count += 1;
        buckets.set(key, bucket);

        if (bucket.count > max) {
            const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
            _res.setHeader('Retry-After', retryAfter.toString());
            return next(
                new TooManyRequestsError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, {
                    retryAfter,
                }),
            );
        }

        next();
    };
}
