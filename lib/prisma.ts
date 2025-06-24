// Singleton Pattern for Prisma Client
// This ensures that the Prisma Client is reused across hot reloads in development
// and avoids exhausting database connections.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
