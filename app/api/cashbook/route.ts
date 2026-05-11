import { NextRequest, NextResponse } from "next/server";
import { createCashBookEntrySchema } from "@/schemas/cashbook.schema";
import { createManualEntry, getEntries } from "@/services/cashbook.service";

// GET /api/cashbook — List entries with pagination + filters (soft-delete aware)
export async function GET(req: NextRequest) {
  try {
    const result = await getEntries(req.nextUrl.searchParams);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

// POST /api/cashbook — Create manual entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCashBookEntrySchema.parse(body);
    const entry = await createManualEntry(parsed);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
