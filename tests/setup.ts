process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'postgresql://user:password@localhost:5432/test_db';
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.MAILJET_API_KEY ??= 'test-mailjet-api-key';
process.env.MAILJET_SECRET_KEY ??= 'test-mailjet-secret-key';
process.env.EMAIL_FROM ??= 'test@example.com';
process.env.GOOGLE_GEMINI_API_KEY ??= 'test-gemini-api-key';
process.env.GOOGLE_GEMINI_API_URL ??= 'https://test-gemini-api-url.example.com';

import { resetAllUtilityMocks } from './mocks/utilities.mock.js';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

beforeEach(() => {
    resetAllUtilityMocks();
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});
