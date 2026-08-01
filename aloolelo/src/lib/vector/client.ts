import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Use a singleton pattern for the Prisma Client to avoid exhausting database connections
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Initializes the pgvector extension in the database if it doesn't exist.
 */
export async function initializePgVector() {
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('pgvector extension ensured.');
  } catch (error) {
    console.error('Failed to initialize pgvector extension:', error);
  }
}
