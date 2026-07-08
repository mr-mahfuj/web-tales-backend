import type { z } from 'zod';

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
