import { z } from "zod";

export const createUniformSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.string().min(1),
  icon: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  minStockThreshold: z.number().int().min(0).default(10),
});

export const updateUniformSchema = createUniformSchema.partial();

export type CreateUniformInput = z.infer<typeof createUniformSchema>;
export type UpdateUniformInput = z.infer<typeof updateUniformSchema>;
