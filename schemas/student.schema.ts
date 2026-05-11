import { z } from "zod";

export const createStudentSchema = z.object({
  nis: z.string().min(1, "NIS is required"),
  name: z.string().min(1, "Name is required"),
  className: z.string().min(1, "Class is required"),
  grade: z.number().int().min(10).max(12),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
