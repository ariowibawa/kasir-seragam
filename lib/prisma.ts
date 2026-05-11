import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

/**
 * Soft delete helper — wraps queries to filter deleted records
 * Use these helpers in services instead of prisma middleware (deprecated in Prisma v7)
 */
export function softDeleteFilter(additionalWhere?: Record<string, unknown>) {
  return {
    deletedAt: null,
    ...additionalWhere,
  };
}

/**
 * Soft delete a record by setting deletedAt
 */
export async function softDelete(
  model: "student" | "transaction" | "cashBookEntry",
  id: number
) {
  const data = { deletedAt: new Date() };

  switch (model) {
    case "student":
      return prisma.student.update({ where: { id }, data });
    case "transaction":
      return prisma.transaction.update({ where: { id }, data });
    case "cashBookEntry":
      return prisma.cashBookEntry.update({ where: { id }, data });
  }
}
