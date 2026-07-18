import fs from 'fs';
import path from 'path';

export const emailGenerator = (templateName: string, values: Record<string, string>): string => {
    const templatePath = path.resolve(process.cwd(), 'src/templates/', templateName);

    const template = fs.readFileSync(templatePath, 'utf-8');

    let filledTemplate = template;
    for (const [key, value] of Object.entries(values)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(placeholder, value);
    }

    return filledTemplate;
};
