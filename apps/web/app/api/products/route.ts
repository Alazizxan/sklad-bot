import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const q = (searchParams.get("q") || "").trim();

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } }
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { title: "asc" },
    take: 200
  });

  return NextResponse.json({ products });
}
