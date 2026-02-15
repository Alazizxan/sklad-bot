import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cats = [
    "Товары без категории",
    "Саморезлар",
    "ДСП, ДВП, ОСБ, ФАНЕРА",
    "Профил (подвес, направ...)",
    "Қуруқ қоришмалар",
    "Изоляция",
    "Гипсокартон",
  ];

  const created = [];
  for (let i = 0; i < cats.length; i++) {
    created.push(await prisma.category.create({ data: { title: cats[i], sort: i } }));
  }

  const sam = created.find(c => c.title === "Саморезлар")!;
  await prisma.product.createMany({
    data: [
      { categoryId: sam.id, title: "Винт саморез 100мм", priceUzs: 23000, unit: "кг", stock: 72 },
      { categoryId: sam.id, title: "Винт саморез 70мм", priceUzs: 23000, unit: "кг", stock: 100 },
      { categoryId: sam.id, title: "Винт саморез 50мм", priceUzs: 23000, unit: "кг", stock: 0 },
      { categoryId: sam.id, title: "Демир саморез 70мм", priceUzs: 25000, unit: "кг", stock: 0 },
      { categoryId: sam.id, title: "Демир дюбель 6-60мм", priceUzs: 27000, unit: "кг", stock: 27 },
    ],
  });
}

main().finally(() => prisma.$disconnect());
