import prisma from "@/lib/prisma";
import { CreateStudentInput, UpdateStudentInput } from "@/schemas/student.schema";
import { getPaginationParams, paginationMeta } from "@/lib/utils";

/**
 * List students with pagination, search, and filters (soft-delete aware)
 */
export async function getStudents(searchParams: URLSearchParams) {
  const { page, perPage, skip } = getPaginationParams(searchParams);

  const search = searchParams.get("search") ?? "";
  const grade = searchParams.get("grade");
  const uniformStatus = searchParams.get("uniform_status");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { deletedAt: null };

  if (search) {
    where.OR = [
      { nis: { contains: search } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (grade) where.grade = parseInt(grade);
  if (uniformStatus) where.uniformStatus = uniformStatus;

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    data,
    meta: paginationMeta(page, perPage, total),
  };
}

/**
 * Get single student by ID with transaction history (soft-delete aware)
 */
export async function getStudentById(id: number) {
  return prisma.student.findFirst({
    where: { id, deletedAt: null },
    include: {
      transactions: {
        where: { deletedAt: null },
        include: { items: { include: { uniformItem: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Create a new student
 */
export async function createStudent(input: CreateStudentInput) {
  return prisma.student.create({ data: input });
}

/**
 * Update a student (soft-delete aware)
 */
export async function updateStudent(id: number, input: UpdateStudentInput) {
  // Ensure the student exists and is not deleted
  const existing = await prisma.student.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("Student not found");

  return prisma.student.update({
    where: { id },
    data: input,
  });
}

/**
 * Soft delete a student
 */
export async function softDeleteStudent(id: number) {
  const existing = await prisma.student.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw new Error("Student not found");

  return prisma.student.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Search students by NIS or name (for cashier autocomplete)
 */
export async function searchStudents(query: string, limit = 10) {
  return prisma.student.findMany({
    where: {
      deletedAt: null,
      OR: [
        { nis: { contains: query } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

/**
 * Get total student count (for dashboard)
 */
export async function getStudentCount() {
  return prisma.student.count({ where: { deletedAt: null } });
}
