import { NextResponse } from "next/server";
import { verifyTelegramInitData, parseTgUser } from "@/lib/tg";

export async function POST(req: Request) {
  const { initData } = await req.json();
  const ok = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN!);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  const user = parseTgUser(initData);
  return NextResponse.json({ ok: true, user });
}
