export const emailGenerator = (template: string, values: Record<string, string>): string => {
    let filledTemplate = template;
    for (const [key, value] of Object.entries(values)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(placeholder, value);
    }

    return filledTemplate;
};
