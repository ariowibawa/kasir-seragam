import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/search?q=<query>
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ students: [], uniforms: [] });
  }

  try {
    const [students, uniforms] = await Promise.all([
      prisma.student.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { nis: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, nis: true, name: true, className: true, grade: true },
        take: 5,
        orderBy: { name: "asc" },
      }),
      prisma.uniformItem.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        select: { id: true, name: true, category: true, type: true, icon: true },
        take: 5,
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ students, uniforms });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
