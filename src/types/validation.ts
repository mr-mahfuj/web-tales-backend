import type { Request } from 'express';
import type { z } from 'zod';
import type { AuthenticatedUser } from './auth.js';

type Infer<S> = S extends z.ZodTypeAny ? z.infer<S> : undefined;

export type ValidationSchema<Params = z.ZodTypeAny, Body = z.ZodTypeAny, Query = z.ZodTypeAny> = {
    params?: Params;
    body?: Body;
    query?: Query;
};

export type Validated<S> = {
    params: Infer<S extends { params: infer P } ? P : undefined>;
    body: Infer<S extends { body: infer B } ? B : undefined>;
    query: Infer<S extends { query: infer Q } ? Q : undefined>;
};

export type ValidatedRequest<S> = Request & { validated?: Validated<S>; user?: AuthenticatedUser };
export type AuthedValidatedRequest<S> = ValidatedRequest<S> & {
    user?: { id: string };
};
