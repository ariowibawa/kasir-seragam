import prisma from "@/lib/prisma";
import { CreateUniformInput, UpdateUniformInput } from "@/schemas/uniform.schema";

/**
 * Get all uniform items with stock entries and alert levels
 */
export async function getUniformItems() {
  const items = await prisma.uniformItem.findMany({
    include: {
      stockEntries: {
        orderBy: { size: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    type: item.type,
    icon: item.icon,
    imageUrl: item.imageUrl,
    minStockThreshold: item.minStockThreshold,
    sizes: item.stockEntries.map((se) => ({
      size: se.size,
      quantity: se.quantity,
      unitCost: Number(se.unitCost),
      unitPrice: Number(se.unitPrice),
      alert:
        se.quantity <= 0
          ? "out_of_stock"
          : se.quantity <= Math.floor(item.minStockThreshold / 2)
          ? "critical"
          : se.quantity <= item.minStockThreshold
          ? "low"
          : null,
    })),
  }));
}

/**
 * Get a single uniform item by ID
 */
export async function getUniformById(id: number) {
  return prisma.uniformItem.findUnique({
    where: { id },
    include: {
      stockEntries: { orderBy: { size: "asc" } },
    },
  });
}

/**
 * Create a new uniform item
 */
export async function createUniform(input: CreateUniformInput) {
  return prisma.uniformItem.create({ data: input });
}

/**
 * Update a uniform item
 */
export async function updateUniform(id: number, input: UpdateUniformInput) {
  return prisma.uniformItem.update({
    where: { id },
    data: input,
  });
}

/**
 * Get all stock entries with uniform item details (for stock listing page)
 */
export async function getStockEntries() {
  const entries = await prisma.stockEntry.findMany({
    include: { uniformItem: true },
    orderBy: [{ uniformItem: { name: "asc" } }, { size: "asc" }],
  });

  return entries.map((entry) => ({
    id: entry.id,
    uniformItemId: entry.uniformItemId,
    itemName: entry.uniformItem.name,
    category: entry.uniformItem.category,
    type: entry.uniformItem.type,
    icon: entry.uniformItem.icon,
    size: entry.size,
    quantity: entry.quantity,
    unitCost: Number(entry.unitCost),
    unitPrice: Number(entry.unitPrice),
    threshold: entry.uniformItem.minStockThreshold,
    alert:
      entry.quantity <= 0
        ? "out_of_stock"
        : entry.quantity <= Math.floor(entry.uniformItem.minStockThreshold / 2)
        ? "critical"
        : entry.quantity <= entry.uniformItem.minStockThreshold
        ? "low"
        : null,
  }));
}
