export const AI_CONFIG = {
    temperature: 0.3,
    maxOutputTokens: 300,
};

export const SUMMARY_PROMPT =
    'Summarize the following story in a concise paragraph of approximately 120–180 words. ' +
    'Capture the main events, key context, and important outcomes while avoiding unnecessary details. ' +
    'Return only the summary text with no preamble, labels, or markdown.';

export const DEFAULT_AI_MODEL = 'gemini-flash-latest';
