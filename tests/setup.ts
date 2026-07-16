/* eslint-disable no-console */
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
