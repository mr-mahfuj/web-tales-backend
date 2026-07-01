import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

const { PrismaClient } = pkg;

if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize PrismaClient');
}

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;
