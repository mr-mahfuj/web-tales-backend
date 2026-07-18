import { env } from '../config/env.js';
import { SUMMARY } from '../constants/story.js';
import type { SummaryResult } from '../types/summaryResult.js';
import type { GeminiResponse } from '../types/aiResponse.js';
import { AI_CONFIG, SUMMARY_PROMPT } from '../constants/aiConfig.js';

const DEFAULT_AI_MODEL = 'gemini-flash-latest';

export class AIService {
    private readonly apiKey = env.geminiAPIKey;
    private readonly model = env.aiModel?.trim() ? env.aiModel : DEFAULT_AI_MODEL;
    private readonly apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    async generateSummary(content: string): Promise<SummaryResult> {
        const truncatedContent = this.truncateContent(content);

        const response = await this.fetchSummaryFromAPI(truncatedContent);

        return this.handleAPIResponse(response);
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

    private async handleAPIResponse(response: Response): Promise<SummaryResult> {
        if (!response.ok) {
            const errorBody = await response.text().catch(() => undefined);
            return {
                summary: null,
                error: `AI service returned status ${response.status}`,
                details: { status: response.status, body: errorBody },
            };
        }

        const data = (await response.json()) as GeminiResponse;

        const text = data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text)
            .join('')
            .trim();

        if (!text) {
            return { summary: null, error: 'AI returned no content' };
        }

        return { summary: text };
    }

    private truncateContent(content: string): string {
        if (content.length <= SUMMARY.MAX_INPUT_CHARS) {
            return content;
        }
        return content.slice(0, SUMMARY.MAX_INPUT_CHARS);
    }
}
