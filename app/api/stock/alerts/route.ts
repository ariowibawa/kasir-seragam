import { NextResponse } from "next/server";
import { getStockAlerts } from "@/services/stock.service";

// GET /api/stock/alerts
export async function GET() {
  try {
    const alerts = await getStockAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
