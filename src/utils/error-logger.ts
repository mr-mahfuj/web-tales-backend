export type ErrorLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type ErrorLogEntry = {
    timestamp: string;
    request: {
        method: string;
        path: string;
        params: Record<string, unknown>;
        query: Record<string, unknown>;
    };
    error: {
        name: string;
        code: string;
        message: string;
        statusCode: number;
        details?: unknown;
        stack?: string | undefined;
        raw: unknown;
        logLevel: ErrorLogLevel;
    };
};

export function logError(entry: ErrorLogEntry): void {
    console.error('[application-error]', entry);
}
