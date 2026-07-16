import type { Request, Response } from 'express';

type MockRes = Response & {
    status: jest.Mock;
    json: jest.Mock;
};

export function createMockRes(): MockRes {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { status, json } as unknown as MockRes;
}

export function createMockReq(overrides: Partial<Request> = {}): Request {
    return overrides as unknown as Request;
}
