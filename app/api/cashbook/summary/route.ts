import { NextResponse } from "next/server";
import { getCashBookSummary } from "@/services/cashbook.service";

// GET /api/cashbook/summary
export async function GET() {
  try {
    const summary = await getCashBookSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
