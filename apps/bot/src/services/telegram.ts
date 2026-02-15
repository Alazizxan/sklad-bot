import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export async function getUserByTg(telegramId: bigint) {
  return prisma.user.findUnique({ where: { telegramId } });
}

export async function upsertUser(telegramId: bigint, phone: string, fullName: string) {
  return prisma.user.upsert({
    where: { telegramId },
    update: { phone, fullName },
    create: { telegramId, phone, fullName },
  });
}
