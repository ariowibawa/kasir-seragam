import { z } from "zod";

const sizeEnum = z.enum(["S", "M", "L", "XL", "XXL"]);

export const processTransactionSchema = z.object({
  studentId: z.number().int().positive(),
  amountPaid: z.number().positive(),
  items: z
    .array(
      z.object({
        uniformItemId: z.number().int().positive(),
        size: sizeEnum,
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
});

export type ProcessTransactionInput = z.infer<typeof processTransactionSchema>;
