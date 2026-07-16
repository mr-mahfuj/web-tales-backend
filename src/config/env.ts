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
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().min(1, 'SMTP Mail is required'),
    SMTP_PASS: z.string().min(1, 'SMTP Password is required'),
    SMTP_HOST: z.string().min(1, 'SMTP Host is required'),
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
    smtpPort: parsed.data.SMTP_PORT,
    smtpUser: parsed.data.SMTP_USER,
    smtpPass: parsed.data.SMTP_PASS,
    smtpHost: parsed.data.SMTP_HOST,
    emailConfirmationTokenExpiresIn: parsed.data.EMAIL_CONFIRMATION_TOKEN_EXPIRES_IN as StringValue,
    geminiAPIKey: parsed.data.GOOGLE_GEMINI_API_KEY,
    aiModel: parsed.data.MODEL,
    passwordChangeTokenExpiresIn: parsed.data.PASSWORD_CHANGE_TOKEN_EXPIRES_IN as StringValue,
};
