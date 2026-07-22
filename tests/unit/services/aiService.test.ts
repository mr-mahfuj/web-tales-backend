import { mockEnv } from '../../mocks/env.mock.js';

jest.mock('../../../src/config/env.js', () => ({
    env: mockEnv,
}));
import { AIService } from '../../../src/services/ai.service.js';
import { AIServiceError } from '../../../src/common/errors.js';

describe('AIService', () => {
    let service: AIService;
    let fetchMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AIService();

        fetchMock = jest.fn();
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    describe('generateSummary', () => {
        it('returns the generated summary when the API succeeds', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    candidates: [
                        {
                            content: {
                                parts: [{ text: 'This is ' }, { text: 'the summary.' }],
                            },
                        },
                    ],
                }),
            });

            const result = await service.generateSummary('Some article');

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                summary: 'This is the summary.',
            });
        });

        it('throws AIServiceError when the API returns a non-OK response', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 500,
                text: jest.fn().mockResolvedValue('Internal Server Error'),
            });

            await expect(service.generateSummary('Some article')).rejects.toThrow(AIServiceError);
        });

        it('throws AIServiceError when the response contains no summary text', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    candidates: [
                        {
                            content: {
                                parts: [],
                            },
                        },
                    ],
                }),
            });

            await expect(service.generateSummary('Some article')).rejects.toThrow(AIServiceError);
        });

        it('throws AIServiceError when candidates are missing', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            await expect(service.generateSummary('Some article')).rejects.toThrow(AIServiceError);
        });

        it('passes the correct request to fetch', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    candidates: [
                        {
                            content: {
                                parts: [{ text: 'Summary' }],
                            },
                        },
                    ],
                }),
            });

            await service.generateSummary('Test content');

            expect(fetchMock).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'X-goog-api-key': expect.any(String),
                    }),
                    body: expect.any(String),
                }),
            );

            const [, options] = fetchMock.mock.calls[0];

            const body = JSON.parse(options.body);

            expect(body.contents[0].parts[0].text).toContain('Test content');
            expect(body.generationConfig).toEqual(
                expect.objectContaining({
                    temperature: expect.any(Number),
                    maxOutputTokens: expect.any(Number),
                }),
            );
        });

        it('throws AIServiceError when response.text() fails on an error response', async () => {
            fetchMock.mockResolvedValue({
                ok: false,
                status: 400,
                text: jest.fn().mockRejectedValue(new Error('failed')),
            });

            await expect(service.generateSummary('Some article')).rejects.toThrow(AIServiceError);
        });
    });
});
