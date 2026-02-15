import { bot, ensureAdmins } from "./bot";

async function main() {
  await ensureAdmins();
  await bot.launch();
  console.log("✅ Bot started");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
