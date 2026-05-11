import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordInbound } from "@/services/stock.service";
import { inboundStockSchema } from "@/schemas/stock.schema";

// POST /api/stock/inbound — Record stock inbound + auto expense
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inboundStockSchema.parse(body);
    const result = await recordInbound(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record inbound" },
      { status: 400 }
    );
  }
}
