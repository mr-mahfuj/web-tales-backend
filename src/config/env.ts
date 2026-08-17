import { z } from 'zod';
import type { StringValue } from 'ms';

const envSchema = z.object({
    HOST: z.string().default('localhost'),
    PORT: z.coerce.number().default(3000),
    FRONTEND_URL: z
        .string()
        .url()
        .min(1, 'Frontend url is not provided.')
        .default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRES_IN: z.string().default('30d'),
    SALT_ROUNDS: z.coerce.number().default(10),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
    EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
    EMAIL_CONFIRMATION_TOKEN_EXPIRES_IN: z
        .string()
        .min(1, 'Email confirmation token expiration time is required.')
        .default('2m'),
    GOOGLE_GEMINI_API_KEY: z.string().min(1, 'Google Gemini Api Key is required.'),
    MODEL: z.string().default('gemini-flash-latest'),
    PASSWORD_CHANGE_TOKEN_EXPIRES_IN: z
        .string()
        .min(1, 'Password Change Token expiration time is required.')
        .default('15m'),
    GOOGLE_GEMINI_API_URL: z.string().min(1, 'Gemini api url is required.'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = {
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    frontendUrl: parsed.data.FRONTEND_URL,
    nodeEnv: parsed.data.NODE_ENV,
    databaseUrl: parsed.data.DATABASE_URL,
    jwtSecret: parsed.data.JWT_SECRET,
    jwtExpiresIn: parsed.data.JWT_EXPIRES_IN as StringValue,
    saltRounds: parsed.data.SALT_ROUNDS,
    resendApiKey: parsed.data.RESEND_API_KEY,
    emailFrom: parsed.data.EMAIL_FROM,
    emailConfirmationTokenExpiresIn: parsed.data.EMAIL_CONFIRMATION_TOKEN_EXPIRES_IN as StringValue,
    geminiAPIKey: parsed.data.GOOGLE_GEMINI_API_KEY,
    aiModel: parsed.data.MODEL,
    passwordChangeTokenExpiresIn: parsed.data.PASSWORD_CHANGE_TOKEN_EXPIRES_IN as StringValue,
    apiUrl: parsed.data.GOOGLE_GEMINI_API_URL,
};
