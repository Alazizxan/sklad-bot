"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: string; title: string };
type Product = { id: string; title: string; sku?: string | null; priceUzs: number; unit: string; stock: number };

export default function HomePage() {
  const [initData, setInitData] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({}); // productId -> qty

  useEffect(() => {
    // @ts-ignore
    const tg = window?.Telegram?.WebApp;
    tg?.ready?.();
    const data = tg?.initData || "";
    setInitData(data);
  }, []);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      setCategories(d.categories || []);
      if (d.categories?.[0]?.id) setCategoryId(d.categories[0].id);
    });
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    const url = `/api/products?categoryId=${encodeURIComponent(categoryId)}&q=${encodeURIComponent(q)}`;
    fetch(url).then(r => r.json()).then(d => setProducts(d.products || []));
  }, [categoryId, q]);

  const total = useMemo(() => {
    // faqat UI hisob, real hisob serverda qayta hisoblanadi
    const map = new Map(products.map(p => [p.id, p]));
    let sum = 0;
    for (const [pid, qty] of Object.entries(cart)) {
      const p = map.get(pid);
      if (!p) continue;
      sum += (p.priceUzs * qty);
    }
    return sum;
  }, [cart, products]);

  const cartCount = useMemo(() => Object.values(cart).reduce((a,b)=>a+b,0), [cart]);

  function inc(pid: string) {
    setCart(prev => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
  }
  function dec(pid: string) {
    setCart(prev => {
      const next = { ...prev };
      const v = (next[pid] || 0) - 1;
      if (v <= 0) delete next[pid];
      else next[pid] = v;
      return next;
    });
  }

  return (
    <div style={{ padding: 12, fontFamily: "system-ui" }}>
      <div style={{ position: "sticky", top: 0, background: "white", paddingBottom: 10, zIndex: 10 }}>
        <input
          placeholder="Введите название товара или артикул"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
        />

        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 10 }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid #ddd",
                background: c.id === categoryId ? "#111" : "#fff",
                color: c.id === categoryId ? "#fff" : "#111",
                whiteSpace: "nowrap"
              }}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {products.map(p => {
          const qty = cart[p.id] || 0;
          return (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>
                {p.priceUzs.toLocaleString("ru-RU")} UZS / {p.unit} · {p.stock} {p.unit}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                {qty > 0 && (
                  <>
                    <button onClick={() => dec(p.id)} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #ddd" }}>-</button>
                    <div style={{ minWidth: 34, textAlign: "center", paddingTop: 8 }}>{qty}</div>
                  </>
                )}
                <button onClick={() => inc(p.id)} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff" }}>
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cartCount > 0 && (
        <a href="/cart" style={{
          position: "fixed", left: 12, right: 12, bottom: 12,
          textDecoration: "none",
          background: "#111", color: "white",
          padding: 14, borderRadius: 16,
          display: "flex", justifyContent: "space-between"
        }}>
          <div>Корзина ({cartCount})</div>
          <div>{total.toLocaleString("ru-RU")} UZS</div>
        </a>
      )}

      {/* initData ni localStorage ga saqlab ketamiz */}
      <script dangerouslySetInnerHTML={{
        __html: `
          try {
            if (${JSON.stringify(initData)} && ${JSON.stringify(initData)}.length > 0) {
              localStorage.setItem("tg_initData", ${JSON.stringify(initData)});
            }
          } catch (e) {}
        `
      }} />
    </div>
  );
}
