import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData, parseTgUser } from "@/lib/tg";

async function tgSendMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { initData, cart, delivery, comment } = body;

  const ok = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN!);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const tgUser = parseTgUser(initData);
  const telegramId = BigInt(tgUser.id);

  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    return NextResponse.json({ ok: false, message: "User not registered in bot" }, { status: 400 });
  }

  // cart: [{productId, qty}]
  const ids = cart.map((x: any) => x.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });

  const items = cart.map((x: any) => {
    const p = products.find(pp => pp.id === x.productId);
    if (!p) throw new Error("Product not found");
    const qty = Math.max(0, Math.floor(Number(x.qty || 0)));
    return {
      productId: p.id,
      qty,
      priceUzs: p.priceUzs,
      title: p.title,
      unit: p.unit
    };
  }).filter((i: any) => i.qty > 0);

  if (!items.length) {
    return NextResponse.json({ ok: false, message: "Cart is empty" }, { status: 400 });
  }

  const totalUzs = items.reduce((sum: bigint, i: any) => sum + (BigInt(i.qty) * BigInt(i.priceUzs)), 0n);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalUzs,
      comment: comment || null,
      deliveryName: delivery.name,
      deliveryPhone: delivery.phone,
      deliveryAddress: delivery.address,
      items: { create: items }
    },
    include: { items: true }
  });

  // Admin notify
  const admins = await prisma.admin.findMany({ where: { isActive: true } });
  const lines = order.items.map(i =>
    `- ${i.title}: ${i.qty} ${i.unit} = ${(Number(i.priceUzs) * i.qty).toLocaleString("ru-RU")} UZS`
  ).join("\n");

  const msg =
`🛒 Yangi buyurtma!
Order: ${order.id}
User: ${user.fullName} (${user.phone})
Delivery:
- Name: ${order.deliveryName}
- Phone: ${order.deliveryPhone}
- Address: ${order.deliveryAddress}
Comment: ${order.comment || "-"}

Items:
${lines}

Jami: ${Number(order.totalUzs).toLocaleString("ru-RU")} UZS`;

  await Promise.all(admins.map(a => tgSendMessage(a.telegramId.toString(), msg)));

  return NextResponse.json({ ok: true, orderId: order.id });
}
