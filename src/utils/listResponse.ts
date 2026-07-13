export type ListQuery = {
    offset: number;
    limit: number;
};

export type ListResponse<T> = {
    data: T[];
    meta: {
        offset: number;
        limit: number;
        total?: number;
    };
};

export function toListResponse<T>(data: T[], query: ListQuery, total?: number): ListResponse<T> {
    return {
        data,
        meta: {
            offset: query.offset,
            limit: query.limit,
            ...(total !== undefined ? { total } : {}),
        },
    };
}
