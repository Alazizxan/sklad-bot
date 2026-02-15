import { prisma } from "./services/telegram";

export async function getLastOrders(telegramId: bigint, limit = 5) {
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) return [];
  return prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { items: true },
  });
}
