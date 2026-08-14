export const SUMMARY_PROMPT =
    'Read the story text below and write a short, clear summary in plain English. ' +
    'The summary must always be noticeably shorter than the story itself - roughly a third of its length - ' +
    'and never more than 150 words, even if the story is very short. ' +
    'Summarize only the story content. Focus on the main events, key context, and outcomes. ' +
    'Do not include titles, headings, author names, dates, category names, bullets, lists, markdown, hyperlinks, or any metadata. ' +
    'Do not repeat the prompt, do not add labels such as "Summary:" or "##", and do not mention word counts or instructions. ' +
    'Return only the summary text as plain text, with no preamble, no labels, and no formatting.';

export const buildCategorySuggestionPrompt = (availableCategories: string[]): string =>
    'You are choosing the best-fitting categories for a story from a fixed list. ' +
    `Available categories: ${availableCategories.join(', ')}. ` +
    'Read the story title and body below and pick 1 to 3 categories from the list above that fit best. ' +
    'Only use category names exactly as they appear in the list. Do not invent new categories. ' +
    'Respond with only a JSON array of strings, e.g. ["Technology","Design"], and nothing else.';
