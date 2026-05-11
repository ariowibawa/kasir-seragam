import { z } from "zod";

export const createCashBookEntrySchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  entryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const updateCashBookEntrySchema = createCashBookEntrySchema.partial();

export type CreateCashBookEntryInput = z.infer<typeof createCashBookEntrySchema>;
export type UpdateCashBookEntryInput = z.infer<typeof updateCashBookEntrySchema>;
