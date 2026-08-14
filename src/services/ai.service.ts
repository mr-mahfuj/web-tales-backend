import { env } from '../config/env.js';
import type { SummaryResult } from '../types/summaryResult.js';
import type { GeminiResponse } from '../types/aiResponse.js';
import { AI_CONFIG, ERROR_MESSAGES, SUMMARY } from '../constants/index.js';
import { SUMMARY_PROMPT, buildCategorySuggestionPrompt } from '../constants/aiPrompts.js';
import { AIServiceError } from '../common/errors.js';

export class AIService {
    private readonly apiKey = env.geminiAPIKey;
    private readonly apiUrl = env.apiUrl;

    async generateSummary(content: string): Promise<SummaryResult> {
        const truncated = content.slice(0, SUMMARY.MAX_INPUT_CHARS);
        const text = await this.generateText(
            `${SUMMARY_PROMPT}\n\n${truncated}`,
            ERROR_MESSAGES.AI_SERVICE_FAILED,
        );

        if (!text) {
            throw new AIServiceError(undefined, { reason: 'empty_response' });
        }

        return { summary: capSummaryLength(text, content) };
    }

    async suggestCategories(content: string, availableCategories: string[]): Promise<string[]> {
        if (availableCategories.length === 0) return [];

        const truncated = content.slice(0, SUMMARY.MAX_INPUT_CHARS);
        const prompt = `${buildCategorySuggestionPrompt(availableCategories)}\n\n${truncated}`;
        const text = await this.generateText(prompt, ERROR_MESSAGES.AI_CATEGORY_SUGGESTION_FAILED);

        if (!text) return [];

        const parsed = parseJsonArray(text);
        if (!parsed) return [];

        const lookup = new Map(availableCategories.map((name) => [name.toLowerCase(), name]));
        return parsed
            .filter((item): item is string => typeof item === 'string')
            .map((item) => lookup.get(item.trim().toLowerCase()))
            .filter((name): name is string => Boolean(name));
    }

    private async generateText(prompt: string, errorMessage: string): Promise<string | undefined> {
        const response = await this.fetchFromAPI(prompt);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => undefined);
            throw new AIServiceError(errorMessage, { status: response.status, body: errorBody });
        }

        const data = (await response.json()) as GeminiResponse;

        return data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text)
            .join('')
            .trim();
    }

    private async fetchFromAPI(prompt: string): Promise<Response> {
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: AI_CONFIG.temperature,
                    maxOutputTokens: AI_CONFIG.maxOutputTokens,
                },
            }),
        });
    }
}

function parseJsonArray(text: string): unknown[] | null {
    const withoutFences = text.replace(/```json|```/gi, '').trim();
    const match = withoutFences.match(/\[[\s\S]*\]/);
    if (!match) return null;

    try {
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

const MIN_SUMMARY_WORDS = 20;
const MAX_SUMMARY_WORDS = 150;

function capSummaryLength(summary: string, sourceText: string): string {
    const sourceWordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;
    const maxWords = Math.min(
        MAX_SUMMARY_WORDS,
        Math.max(MIN_SUMMARY_WORDS, Math.round(sourceWordCount * 0.4)),
    );

    const words = summary.trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return summary.trim();

    const truncated = words.slice(0, maxWords).join(' ');
    const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? '),
    );

    if (lastSentenceEnd > truncated.length * 0.5) {
        return truncated.slice(0, lastSentenceEnd + 1).trim();
    }

    return `${truncated.trim()}.`;
}
