import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStudents, createStudent } from "@/services/student.service";
import { createStudentSchema } from "@/schemas/student.schema";

// GET /api/students — List with pagination + filters (soft-delete aware)
export async function GET(req: NextRequest) {
  try {
    const result = await getStudents(req.nextUrl.searchParams);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST /api/students — Create new student
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createStudentSchema.parse(body);
    const student = await createStudent(parsed);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create student" },
      { status: 400 }
    );
  }
}
