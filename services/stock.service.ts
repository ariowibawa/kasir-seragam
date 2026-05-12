import prisma from "@/lib/prisma";
import { InboundStockInput } from "@/schemas/stock.schema";

/**
 * Record inbound stock
 * - Update/create stock entry
 * - Create stock movement
 * - Auto-create expense in cash book (totalCost = unitCost × quantity)
 */
export async function recordInbound(input: InboundStockInput) {
  const totalCost = input.unitCost * input.quantity;

  return prisma.$transaction(async (tx) => {
    // 1. Upsert stock entry
    const stockEntry = await tx.stockEntry.upsert({
      where: {
        uniformItemId_size: {
          uniformItemId: input.uniformItemId,
          size: input.size,
        },
      },
      update: {
        quantity: { increment: input.quantity },
        unitCost: input.unitCost,
        unitPrice: input.unitPrice,
      },
      create: {
        uniformItemId: input.uniformItemId,
        size: input.size,
        quantity: input.quantity,
        unitCost: input.unitCost,
        unitPrice: input.unitPrice,
      },
    });

    // 2. Create stock movement log
    const movement = await tx.stockMovement.create({
      data: {
        uniformItemId: input.uniformItemId,
        size: input.size,
        movementType: "inbound",
        quantity: input.quantity,
        unitCost: input.unitCost,
        unitPrice: input.unitPrice,
        totalCost: totalCost,
        note: input.note,
      },
    });

    // 3. Auto-create expense entry in Cash Book
    const lastEntry = await tx.cashBookEntry.findFirst({
      where: { deletedAt: null },
      orderBy: [{ entryDate: "desc" }, { id: "desc" }],
    });
    const lastBalance = lastEntry
      ? Number(lastEntry.runningBalance)
      : 0;
    const newBalance = lastBalance - totalCost;

    const item = await tx.uniformItem.findUniqueOrThrow({
      where: { id: input.uniformItemId },
    });

    // Generate PO reference
    const movementCount = await tx.stockMovement.count({
      where: { movementType: "inbound" },
    });
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const poRef = `PO-${yymm}-${String(movementCount).padStart(2, "0")}`;

    const cashEntry = await tx.cashBookEntry.create({
      data: {
        stockMovementId: movement.id,
        type: "expense",
        category: "Pembelian Stok",
        title: `Pembelian ${item.name} ${input.size} ×${input.quantity}`,
        reference: poRef,
        refType: "automated",
        amount: totalCost,
        runningBalance: newBalance,
        entryDate: now,
      },
    });

    return { stockEntry, movement, cashEntry };
  });
}

/**
 * Get stock alerts (low stock / critical / out of stock)
 */
export async function getStockAlerts() {
  const entries = await prisma.stockEntry.findMany({
    include: { uniformItem: true },
    orderBy: { quantity: "asc" },
  });

  return entries
    .filter((entry) => entry.quantity <= entry.uniformItem.minStockThreshold)
    .map((entry) => {
      let level: "Stok habis" | "Stok hampir habis" | "Stok sedikit";
      if (entry.quantity <= 0) {
        level = "Stok habis";
      } else if (
        entry.quantity <=
        Math.floor(entry.uniformItem.minStockThreshold / 2)
      ) {
        level = "Stok hampir habis";
      } else {
        level = "Stok sedikit";
      }
      return {
        level,
        itemName: entry.uniformItem.name,
        size: entry.size,
        remaining: entry.quantity,
        threshold: entry.uniformItem.minStockThreshold,
      };
    });
}
