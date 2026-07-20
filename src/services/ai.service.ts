import { env } from '../config/env.js';
import type { SummaryResult } from '../types/summaryResult.js';
import type { GeminiResponse } from '../types/aiResponse.js';
import { AI_CONFIG, DEFAULT_AI_MODEL, SUMMARY_PROMPT } from '../constants/index.js';
import { AIServiceError } from '../common/errors.js';

export class AIService {
    private readonly apiKey = env.geminiAPIKey;
    private readonly model = env.aiModel?.trim() ? env.aiModel : DEFAULT_AI_MODEL;
    private readonly apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    async generateSummary(content: string): Promise<SummaryResult> {
        const response = await this.fetchSummaryFromAPI(content);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => undefined);
            throw new AIServiceError(undefined, { status: response.status, body: errorBody });
        }

        const data = (await response.json()) as GeminiResponse;

        const text = data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text)
            .join('')
            .trim();

        if (!text) {
            throw new AIServiceError(undefined, { reason: 'empty_response' });
        }

        return { summary: text };
    }

    private async fetchSummaryFromAPI(content: string): Promise<Response> {
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: `${SUMMARY_PROMPT}\n\n${content}` }],
                    },
                ],
                generationConfig: {
                    temperature: AI_CONFIG.temperature,
                    maxOutputTokens: AI_CONFIG.maxOutputTokens,
                },
            }),
        });
    }
}
