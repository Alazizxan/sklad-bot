import crypto from "node:crypto";

export function verifyTelegramInitData(initData: string, botToken: string) {
  // initData: "query_id=...&user=...&hash=..."
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  return computed === hash;
}

export function parseTgUser(initData: string) {
  const p = new URLSearchParams(initData);
  const user = p.get("user");
  if (!user) return null;
  return JSON.parse(user);
}
