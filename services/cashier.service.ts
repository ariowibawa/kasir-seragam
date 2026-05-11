import prisma from "@/lib/prisma";
import { ProcessTransactionInput } from "@/schemas/cashier.schema";
import { generateInvoiceNumber } from "@/lib/utils";

/**
 * Process a full-payment transaction
 * - Create transaction + items (with unitCost snapshot)
 * - Reduce stock
 * - Create outbound movements
 * - Auto-create income entry in Cash Book
 * - Update student uniform status
 */
export async function processTransaction(input: ProcessTransactionInput) {
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Build transaction items with price snapshots
    const itemsData: Array<{
      uniformItemId: number;
      size: "S" | "M" | "L" | "XL" | "XXL";
      quantity: number;
      unitCost: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    for (const item of input.items) {
      // Get current stock entry (with prices)
      const stock = await tx.stockEntry.findFirst({
        where: {
          uniformItemId: item.uniformItemId,
          size: item.size,
        },
      });

      if (!stock) {
        throw new Error(
          `Stock not found for item ${item.uniformItemId} size ${item.size}`
        );
      }

      if (stock.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for item ${item.uniformItemId} size ${item.size}. Available: ${stock.quantity}, Requested: ${item.quantity}`
        );
      }

      const unitCost = Number(stock.unitCost);
      const unitPrice = Number(stock.unitPrice);
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      itemsData.push({
        uniformItemId: item.uniformItemId,
        size: item.size,
        quantity: item.quantity,
        unitCost,
        unitPrice,
        subtotal,
      });
    }

    // Validate full payment
    if (Math.abs(input.amountPaid - totalAmount) > 0.01) {
      throw new Error(
        `Payment mismatch. Total: ${totalAmount}, Paid: ${input.amountPaid}`
      );
    }

    // Generate invoice number
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await tx.transaction.count({
      where: { createdAt: { gte: todayStart } },
    });
    const invoiceNumber = generateInvoiceNumber(todayCount + 1);

    // Create transaction header + items
    const transaction = await tx.transaction.create({
      data: {
        studentId: input.studentId,
        invoiceNumber,
        totalAmount,
        amountPaid: input.amountPaid,
        items: {
          create: itemsData.map((item) => ({
            uniformItemId: item.uniformItemId,
            size: item.size,
            quantity: item.quantity,
            unitCost: item.unitCost,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // Reduce stock + create outbound movements
    for (const item of itemsData) {
      await tx.stockEntry.update({
        where: {
          uniformItemId_size: {
            uniformItemId: item.uniformItemId,
            size: item.size,
          },
        },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          uniformItemId: item.uniformItemId,
          size: item.size,
          movementType: "outbound",
          quantity: item.quantity,
          unitCost: item.unitCost,
          unitPrice: item.unitPrice,
          totalCost: item.unitCost * item.quantity,
        },
      });
    }

    // Auto-create income entry in Cash Book
    const lastEntry = await tx.cashBookEntry.findFirst({
      where: { deletedAt: null },
      orderBy: [{ entryDate: "desc" }, { id: "desc" }],
    });
    const lastBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
    const newBalance = lastBalance + totalAmount;

    const student = await tx.student.findFirstOrThrow({
      where: { id: input.studentId, deletedAt: null },
    });

    await tx.cashBookEntry.create({
      data: {
        transactionId: transaction.id,
        type: "income",
        category: "Penjualan Seragam",
        title: `Pembayaran - ${student.name}`,
        reference: invoiceNumber,
        refType: "automated",
        amount: totalAmount,
        runningBalance: newBalance,
        entryDate: new Date(),
      },
    });

    // Update student uniform status
    await updateUniformStatus(tx, input.studentId);

    return transaction;
  });
}

/**
 * Update student's uniform status based on their transactions
 */
async function updateUniformStatus(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  studentId: number
) {
  const transactions = await tx.transaction.findMany({
    where: { studentId, deletedAt: null },
    include: { items: true },
  });

  let status: "none" | "partial" | "complete" = "none";
  if (transactions.length > 0) {
    // Simple logic: if has transactions, at least partial
    status = "partial";

    // Count unique uniform items purchased
    const uniqueItems = new Set<number>();
    for (const t of transactions) {
      for (const item of t.items) {
        uniqueItems.add(item.uniformItemId);
      }
    }

    // If purchased 4+ different items, consider complete
    const totalUniformTypes = await tx.uniformItem.count();
    if (uniqueItems.size >= totalUniformTypes) {
      status = "complete";
    }
  }

  await tx.student.update({
    where: { id: studentId },
    data: { uniformStatus: status },
  });
}
