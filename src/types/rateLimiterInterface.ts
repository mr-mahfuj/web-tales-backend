import type { Request } from 'express';

export interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyGenerator?: (req: Request) => string;
}

export interface Bucket {
    count: number;
    resetAt: number;
}
