import { z } from 'zod';
import { QUERY_CONSTANTS } from '../constants/pagination.constants.js';

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const listQueryBaseSchema = z
    .object({
        offset: z.coerce
            .number()
            .int()
            .min(QUERY_CONSTANTS.DEFAULT_OFFSET)
            .default(QUERY_CONSTANTS.DEFAULT_OFFSET),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(QUERY_CONSTANTS.MAX_LIMIT)
            .default(QUERY_CONSTANTS.DEFAULT_LIMIT),

        search: z.preprocess(
            emptyToUndefined,
            z
                .string()
                .trim()
                .min(QUERY_CONSTANTS.MIN_SEARCH_LENGTH)
                .max(QUERY_CONSTANTS.MAX_SEARCH_LENGTH)
                .optional(),
        ),

        count: z.stringbool().default(false),
    })
    .strict();

export const createListQuerySchema = <T extends z.ZodTypeAny>(orderBySchema: T) =>
    listQueryBaseSchema.extend({ orderBy: orderBySchema });
