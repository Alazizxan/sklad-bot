import { Middleware } from "telegraf";
import { getUserByTg } from "../services/telegram";
import { phoneRequestKb } from "../keyboards";

export const requireAuth: Middleware<any> = async (ctx, next) => {
  const tgId = ctx.from?.id;
  if (!tgId) return;

  const user = await getUserByTg(BigInt(tgId));

  // /start va contact yuborishni bloklamaymiz
  const isStart = ctx.message && "text" in ctx.message && ctx.message.text?.startsWith("/start");
  const isContact = ctx.message && "contact" in ctx.message;

  if (!user && !isStart && !isContact) {
    await ctx.reply(
      "❗ Davom etish uchun avval telefon raqamingizni yuboring.",
      phoneRequestKb
    );
    return;
  }

  return next();
};
