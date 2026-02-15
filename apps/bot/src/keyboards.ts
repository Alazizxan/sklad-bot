import { Markup } from "telegraf";
import { config } from "./config";

export const phoneRequestKb = Markup.keyboard([
  Markup.button.contactRequest("📞 Telefon raqamni yuborish"),
]).resize().oneTime();

export const mainMenuKb = Markup.keyboard([
  ["🛒 Zakaz yaratish", "💰 Balans"],
  ["📄 Narxlar (PDF)", "📦 Oxirgi buyurtmalar"],
]).resize();

export const webAppButton = Markup.inlineKeyboard([
  Markup.button.webApp("🛒 Mini App’ni ochish", config.webAppUrl),
]);
