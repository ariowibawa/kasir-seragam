import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Seed Admin User ───
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@sekolah.id" },
    update: {},
    create: {
      name: "Admin Utama",
      email: "admin@sekolah.id",
      password: hashedPassword,
    },
  });
  console.log("✅ User seeded");

  // ─── Seed Uniform Items ───
  const uniforms = [
    { name: "Kemeja Putih Pendek", category: "Seragam Nasional", type: "Atasan", icon: "apparel" },
    { name: "Celana Panjang Biru", category: "Seragam Nasional", type: "Bawahan", icon: "checkroom" },
    { name: "Batik Yayasan Resmi", category: "Seragam Khusus", type: "Atasan", icon: "styler" },
    { name: "Baju Olahraga", category: "Seragam Khusus", type: "Atasan", icon: "sports_martial_arts" },
    { name: "Celana Olahraga", category: "Seragam Khusus", type: "Bawahan", icon: "sports" },
    { name: "Jas Almamater", category: "Seragam Khusus", type: "Outerwear", icon: "styler" },
  ];

  for (const uniform of uniforms) {
    await prisma.uniformItem.upsert({
      where: { id: uniforms.indexOf(uniform) + 1 },
      update: {},
      create: uniform,
    });
  }
  console.log("✅ Uniform items seeded");

  // ─── Seed Students ───
  const students = [
    { nis: "10293847", name: "Ahmad Reza", className: "10-A", grade: 10 },
    { nis: "10293855", name: "Budi Santoso", className: "11-B", grade: 11 },
    { nis: "10293901", name: "Citra Wijaya", className: "10-C", grade: 10 },
    { nis: "10293944", name: "Dewi Putri", className: "12-A", grade: 12 },
    { nis: "10294001", name: "Eka Saputra", className: "10-A", grade: 10 },
    { nis: "10294015", name: "Fitriani Handayani", className: "11-A", grade: 11 },
    { nis: "10294022", name: "Galih Prakoso", className: "12-B", grade: 12 },
    { nis: "10294038", name: "Hana Pertiwi", className: "10-B", grade: 10 },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { nis: student.nis },
      update: {},
      create: student,
    });
  }
  console.log("✅ Students seeded");

  // ─── Seed Stock Entries ───
  const sizes = ["S", "M", "L", "XL", "XXL"] as const;
  const allItems = await prisma.uniformItem.findMany();

  for (const item of allItems) {
    for (const size of sizes) {
      const qty = Math.floor(Math.random() * 80) + 10;
      const unitCost = 50000 + Math.floor(Math.random() * 50000);
      const unitPrice = unitCost + 50000 + Math.floor(Math.random() * 30000);

      await prisma.stockEntry.upsert({
        where: {
          uniformItemId_size: { uniformItemId: item.id, size },
        },
        update: {},
        create: {
          uniformItemId: item.id,
          size,
          quantity: qty,
          unitCost,
          unitPrice,
        },
      });
    }
  }
  console.log("✅ Stock entries seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
