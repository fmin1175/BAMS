import { PrismaClient } from '@prisma/client';

function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.VERCEL_POSTGRES_URL,
    process.env.NEXT_PUBLIC_DATABASE_URL,
  ].filter(Boolean) as string[];

  const valid = candidates.find((u) => /^postgres(ql)?:\/\//.test(u));
  if (valid && process.env.DATABASE_URL !== valid) {
    process.env.DATABASE_URL = valid;
  }
  return valid;
}

const resolvedDbUrl = resolveDatabaseUrl();
if (!resolvedDbUrl) {
  console.error('DATABASE_URL is missing or invalid (expected postgres:// or postgresql://).');
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;