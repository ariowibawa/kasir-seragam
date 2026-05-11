import prisma from "@/lib/prisma";

/**
 * Get aggregated dashboard statistics
 */
export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Total active students
  const totalStudents = await prisma.student.count({
    where: { deletedAt: null },
  });

  // Uniforms distributed (total transaction items quantity)
  const totalDistributed = await prisma.transactionItem.aggregate({
    _sum: { quantity: true },
    where: { transaction: { deletedAt: null } },
  });

  // Today's distributions
  const todayDistributed = await prisma.transactionItem.aggregate({
    _sum: { quantity: true },
    where: {
      transaction: {
        deletedAt: null,
        createdAt: { gte: todayStart },
      },
    },
  });

  // Income today
  const todayIncome = await prisma.transaction.aggregate({
    _sum: { totalAmount: true },
    _count: true,
    where: {
      deletedAt: null,
      createdAt: { gte: todayStart },
    },
  });

  // Unpaid balance tracking: students with uniform status != 'complete'
  const studentsWithNone = await prisma.student.count({
    where: { deletedAt: null, uniformStatus: "none" },
  });
  const studentsWithPartial = await prisma.student.count({
    where: { deletedAt: null, uniformStatus: "partial" },
  });
  const unpaidStudents = studentsWithNone + studentsWithPartial;
  const unpaidPercentage =
    totalStudents > 0 ? Math.round((unpaidStudents / totalStudents) * 100) : 0;

  return {
    totalStudents,
    uniformsDistributed: {
      total: totalDistributed._sum.quantity ?? 0,
      today: todayDistributed._sum.quantity ?? 0,
    },
    incomeToday: {
      amount: Number(todayIncome._sum.totalAmount ?? 0),
      transactionCount: todayIncome._count,
    },
    unpaidBalance: {
      percentage: unpaidPercentage,
      studentsRemaining: unpaidStudents,
    },
  };
}

/**
 * Get recent activity for the dashboard table
 */
export async function getRecentActivity(limit = 5) {
  const transactions = await prisma.transaction.findMany({
    where: { deletedAt: null },
    include: {
      student: { select: { name: true, className: true } },
      items: {
        include: {
          uniformItem: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return transactions.map((tx) => ({
    id: tx.id,
    date: tx.createdAt,
    studentName: tx.student.name,
    className: tx.student.className,
    uniforms: tx.items
      .map((item) => `${item.uniformItem.name} ${item.size}`)
      .join(", "),
    totalAmount: Number(tx.totalAmount),
    invoiceNumber: tx.invoiceNumber,
    status:
      Number(tx.amountPaid) >= Number(tx.totalAmount) ? "Completed" : "Partial",
  }));
}
