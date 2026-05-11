import { NextResponse } from "next/server";
import { getStockEntries } from "@/services/uniform.service";

// GET /api/stock — List all stock entries with uniform item details
export async function GET() {
  try {
    const entries = await getStockEntries();
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stock" },
      { status: 500 }
    );
  }
}
