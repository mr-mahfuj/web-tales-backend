import fs from 'fs';
import path from 'path';
import { InternalServerError, NotFoundError } from '../common/errors.js';

export const emailGenerator = (templateName: string, values: Record<string, string>): string => {
    const templatePath = path.resolve(process.cwd(), 'src/templates/', templateName);

    let template: string;
    try {
        template = fs.readFileSync(templatePath, 'utf-8');
    } catch (err) {
        throw new NotFoundError('Email Template file not found');
    }

    let filledTemplate = template;
    try {
        for (const [key, value] of Object.entries(values)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            filledTemplate = filledTemplate.replace(placeholder, value);
        }
    } catch (err) {
        throw new InternalServerError('Failed to fill template');
    }

    return filledTemplate;
};
