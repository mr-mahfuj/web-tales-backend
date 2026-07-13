import type { z } from 'zod';

export type ValidationIssue = {
    field: string;
    message: string;
    code: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function formatZodIssues(issues: readonly z.core.$ZodIssue[]): ValidationIssue[] {
    return issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'request',
        message: issue.message,
        code: issue.code,
    }));
}
