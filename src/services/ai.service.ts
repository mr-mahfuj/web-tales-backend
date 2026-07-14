import { env } from '../config/env.js';

interface SummaryResult {
    summary: string | null;
    error?: string;
}

export class AIService {
    private readonly apiKey = env.geminiAPIKey;
    // private readonly apiUrl = config.ai.apiUrl;
    private readonly model = env.aiModel;
    // private readonly maxTokens = config.ai.maxTokens;
    // private readonly summaryPrompt = config.ai.summaryPrompt;

    async generateSummary(content: string): Promise<SummaryResult> {
        return {
            summary: 'hi',
        };
    }

    private async fetchSummaryFromAPI(truncatedContent: string): Promise<Response> {
        return {} as Response;
    }

    private async handleAPIResponse(response: Response): Promise<SummaryResult> {
        return {
            summary: 'hi',
        };
    }

    private truncateContent(content: string): string {
        return 'hi';
    }
}
