export type ErrorResponse = {
    success: false;
    error: {
        message: string;
        code: string;
        details?: unknown;
        stack?: string;
    };
};
