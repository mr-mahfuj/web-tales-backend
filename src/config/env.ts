import { z } from 'zod';
import 'dotenv/config';
import type { StringValue } from 'ms';

const envSchema = z.object({
    HOST: z.string().default('localhost'),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRES_IN: z.string(),
    SALT_ROUNDS: z.coerce.number(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().min(1, 'SMTP Mail is required'),
    SMTP_PASS: z.string().min(1, 'SMTP Password is required'),
    SMTP_HOST: z.string().min(1, 'SMTP Host is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = {
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    nodeEnv: parsed.data.NODE_ENV,
    databaseUrl: parsed.data.DATABASE_URL,
    jwtSecret: parsed.data.JWT_SECRET,
    jwtExpiresIn: parsed.data.JWT_EXPIRES_IN as StringValue,
    saltRounds: parsed.data.SALT_ROUNDS,
    smtpPort: parsed.data.SMTP_PORT,
    smtpUser: parsed.data.SMTP_USER,
    smtpPass: parsed.data.SMTP_PASS,
    smtpHost: parsed.data.SMTP_HOST,
};
