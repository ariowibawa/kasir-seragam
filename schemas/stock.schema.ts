import { z } from "zod";

const sizeEnum = z.enum(["S", "M", "L", "XL", "XXL"]);

export const inboundStockSchema = z.object({
  uniformItemId: z.number().int().positive(),
  size: sizeEnum,
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitCost: z.number().positive("Harga beli must be greater than 0"),
  unitPrice: z.number().positive("Harga jual must be greater than 0"),
  note: z.string().optional(),
});

export type InboundStockInput = z.infer<typeof inboundStockSchema>;
