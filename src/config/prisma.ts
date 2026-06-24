import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

if (!env.databaseUrl) {
	throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

const adapter = new PrismaPg({
	connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
	adapter,
});

export default prisma;