import { NextRequest, NextResponse } from "next/server";
import { getUniformItems, createUniform } from "@/services/uniform.service";
import { createUniformSchema } from "@/schemas/uniform.schema";

// GET /api/uniforms — List all with stock per size + prices
export async function GET() {
  try {
    const data = await getUniformItems();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

// POST /api/uniforms — Create new uniform item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createUniformSchema.parse(body);
    const item = await createUniform(parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
