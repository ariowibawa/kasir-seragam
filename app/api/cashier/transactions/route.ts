import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaginationParams, paginationMeta } from "@/lib/utils";

// GET /api/cashier/transactions — Transaction history with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, perPage, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { deletedAt: null };

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { student: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          student: { select: { name: true, nis: true, className: true } },
          items: {
            include: {
              uniformItem: { select: { name: true } },
            },
          },
        },
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: data.map((tx) => ({
        id: tx.id,
        invoiceNumber: tx.invoiceNumber,
        student: tx.student,
        items: tx.items.map((item) => ({
          name: item.uniformItem.name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        })),
        totalAmount: Number(tx.totalAmount),
        amountPaid: Number(tx.amountPaid),
        createdAt: tx.createdAt,
      })),
      meta: paginationMeta(page, perPage, total),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
