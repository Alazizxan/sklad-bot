"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const initData = localStorage.getItem("tg_initData") || "";
      // DEMO: cartni o'zingiz global/localStorage’da saqlang (prod’da normal store)
      const cart = JSON.parse(localStorage.getItem("cart_items") || "[]"); // [{productId, qty}]

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          initData,
          cart,
          delivery: { name, phone, address },
          comment
        })
      });

      const data = await res.json();
      if (!data.ok) {
        alert(data.message || "Xatolik!");
        return;
      }

      alert("✅ Buyurtma saqlandi! Adminlarga yuborildi.");
      // tg webapp close
      // @ts-ignore
      window?.Telegram?.WebApp?.close?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "6px 0 12px" }}>Адрес доставки</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <input placeholder="Имя" value={name} onChange={(e)=>setName(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
        <input placeholder="Номер телефона" value={phone} onChange={(e)=>setPhone(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
        <input placeholder="Адрес" value={address} onChange={(e)=>setAddress(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
        <textarea placeholder="Добавить комментарий" value={comment} onChange={(e)=>setComment(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd", minHeight: 90 }} />
      </div>

      <button
        disabled={loading || !name || !phone || !address}
        onClick={submit}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 14,
          borderRadius: 16,
          border: "1px solid #111",
          background: "#111",
          color: "#fff",
          opacity: (loading || !name || !phone || !address) ? 0.6 : 1
        }}
      >
        {loading ? "Yuborilmoqda..." : "Далее"}
      </button>
    </div>
  );
}
