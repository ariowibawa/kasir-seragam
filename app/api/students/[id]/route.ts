import { NextRequest, NextResponse } from "next/server";
import { getStudentById, updateStudent, softDeleteStudent } from "@/services/student.service";
import { updateStudentSchema } from "@/schemas/student.schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/students/:id
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const student = await getStudentById(parseInt(id));

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

// PUT /api/students/:id
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateStudentSchema.parse(body);
    const student = await updateStudent(parseInt(id), parsed);
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

// DELETE /api/students/:id — Soft delete
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await softDeleteStudent(parseInt(id));
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
