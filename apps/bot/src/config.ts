export const config = {
  botToken: process.env.BOT_TOKEN!,
  webAppUrl: process.env.WEB_APP_URL!,
  adminIds: (process.env.ADMIN_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(v => BigInt(v)),
  pricePdfPath: process.env.PRICE_PDF_PATH || "/data/price.pdf",
};

if (!config.botToken) throw new Error("BOT_TOKEN is missing");
if (!config.webAppUrl) throw new Error("WEB_APP_URL is missing");
