import { env } from './env.js';

export const mailjet = {
    apiUrl: 'https://api.mailjet.com/v3.1/send',
    apiKey: env.mailjetApiKey,
    secretKey: env.mailjetSecretKey,
};
