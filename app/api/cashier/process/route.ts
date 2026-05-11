import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processTransaction } from "@/services/cashier.service";
import { processTransactionSchema } from "@/schemas/cashier.schema";

// POST /api/cashier/process — Process full payment transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = processTransactionSchema.parse(body);
    const transaction = await processTransaction(parsed);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transaction failed" },
      { status: 400 }
    );
  }
}
