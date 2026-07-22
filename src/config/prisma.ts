import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ERROR_MESSAGES } from '../constants/index.js';
import { env } from './env.js';

const { PrismaClient } = pkg;

if (!env.databaseUrl) {
    throw new Error(ERROR_MESSAGES.DATABASE_URL_REQUIRED);
}

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;
