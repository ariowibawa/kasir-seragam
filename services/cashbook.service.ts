import prisma from "@/lib/prisma";
import { CreateCashBookEntryInput } from "@/schemas/cashbook.schema";
import { getPaginationParams, paginationMeta } from "@/lib/utils";

/**
 * Get cash book entries with pagination + filters (soft-delete aware)
 */
export async function getEntries(searchParams: URLSearchParams) {
  const { page, perPage, skip } = getPaginationParams(searchParams);

  const category = searchParams.get("category");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { deletedAt: null };
  if (category) where.category = category;
  if (startDate || endDate) {
    where.entryDate = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const [data, total] = await Promise.all([
    prisma.cashBookEntry.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [{ entryDate: "desc" }, { id: "desc" }],
    }),
    prisma.cashBookEntry.count({ where }),
  ]);

  return {
    data: data.map((entry) => ({
      id: entry.id,
      entryDate: entry.entryDate.toISOString(),
      title: entry.title,
      reference: entry.reference,
      refType: entry.refType,
      type: entry.type,
      category: entry.category,
      amount: Number(entry.amount),
      runningBalance: Number(entry.runningBalance),
      description: entry.description,
    })),
    meta: paginationMeta(page, perPage, total),
  };
}

/**
 * Get cash book summary: current balance, monthly income/expense
 */
export async function getCashBookSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current balance = running_balance of last entry
  const lastEntry = await prisma.cashBookEntry.findFirst({
    where: { deletedAt: null },
    orderBy: [{ entryDate: "desc" }, { id: "desc" }],
  });
  const currentBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;

  // This month aggregation
  const thisMonth = await prisma.cashBookEntry.groupBy({
    by: ["type"],
    _sum: { amount: true },
    where: {
      deletedAt: null,
      entryDate: { gte: startOfMonth },
    },
  });

  // Last month aggregation (for comparison)
  const lastMonth = await prisma.cashBookEntry.groupBy({
    by: ["type"],
    _sum: { amount: true },
    where: {
      deletedAt: null,
      entryDate: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
  });

  const totalIncome =
    Number(thisMonth.find((g) => g.type === "income")?._sum.amount) || 0;
  const totalExpense =
    Number(thisMonth.find((g) => g.type === "expense")?._sum.amount) || 0;
  const lastMonthIncome =
    Number(lastMonth.find((g) => g.type === "income")?._sum.amount) || 0;

  // Income trend vs last month
  let incomeVsLastMonth = "N/A";
  if (lastMonthIncome > 0) {
    const pctChange = Math.round(
      ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100
    );
    incomeVsLastMonth = pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`;
  }

  return {
    currentBalance,
    thisMonth: {
      totalIncome,
      totalExpense,
      incomeVsLastMonth,
    },
  };
}

/**
 * Create manual cash book entry (e.g. operating expenses)
 */
export async function createManualEntry(input: CreateCashBookEntryInput) {
  const lastEntry = await prisma.cashBookEntry.findFirst({
    where: { deletedAt: null },
    orderBy: [{ entryDate: "desc" }, { id: "desc" }],
  });
  const lastBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;

  const newBalance =
    input.type === "income"
      ? lastBalance + input.amount
      : lastBalance - input.amount;

  // Generate EXP reference for manual entries
  const manualCount = await prisma.cashBookEntry.count({
    where: { refType: "manual" },
  });
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const reference = `EXP-${mmdd}-${String(manualCount + 1).padStart(2, "0")}`;

  return prisma.cashBookEntry.create({
    data: {
      type: input.type,
      category: input.category,
      title: input.title,
      reference,
      refType: "manual",
      amount: input.amount,
      runningBalance: newBalance,
      description: input.description,
      entryDate: new Date(input.entryDate),
    },
  });
}
