import { Telegraf } from "telegraf";
import { prisma } from "./services/telegram";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const WEB_APP_URL = process.env.WEB_APP_URL!;
const PRICE_PDF_PATH = process.env.PRICE_PDF_PATH || "/data/price.pdf";

const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean)
  .map(v => BigInt(v));

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");
if (!WEB_APP_URL) throw new Error("WEB_APP_URL missing");

export const bot = new Telegraf(BOT_TOKEN);

export async function ensureAdmins() {
  for (const tgId of ADMIN_IDS) {
    await prisma.admin.upsert({
      where: { telegramId: tgId },
      update: { isActive: true },
      create: { telegramId: tgId, isActive: true }
    });
  }
}
