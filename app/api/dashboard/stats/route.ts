import { NextResponse } from "next/server";
import { getDashboardStats, getRecentActivity } from "@/services/dashboard.service";

// GET /api/dashboard/stats — Aggregated dashboard data
export async function GET() {
  try {
    const [stats, recentActivity] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(5),
    ]);

    return NextResponse.json({
      stats,
      recentActivity,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
