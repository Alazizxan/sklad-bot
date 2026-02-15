"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: string; title: string; priceUzs: number; unit: string };

export default function CartPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    // oddiy demo: hozirgi category bo'lmasa ham qidirib olamiz (prod’da cartni serverdan “ids in cart” bilan yuklaysiz)
    // bu skeleton tez ishlashi uchun:
    const saved = (window as any).__cart || null;
    if (saved) setCart(saved);
  }, []);

  // Minimal: productsni topish uchun q= bo'yicha ham qilish mumkin. Prod’da /api/cart endpoint qiling.
  useEffect(() => {
    // fallback: barcha kategoriyalardan tez topish uchun q bo'sh va categoryId bo'sh qilish
    fetch(`/api/products?q=`).then(r=>r.json()).then(d=>setProducts(d.products||[]));
  }, []);

  const items = useMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return Object.entries(cart).map(([pid, qty]) => ({ p: map.get(pid), qty })).filter(x => x.p);
  }, [cart, products]);

  const total = useMemo(() => items.reduce((s, x:any)=> s + x.p.priceUzs*x.qty, 0), [items]);

  return (
    <div style={{ padding: 12, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "6px 0 12px" }}>Корзина</h2>

      {!items.length && <div>Корзина bo‘sh.</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((x:any) => (
          <div key={x.p.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{x.p.title}</div>
            <div style={{ opacity: 0.75, marginTop: 4 }}>
              Цена: {x.p.priceUzs.toLocaleString("ru-RU")} UZS / {x.p.unit}
            </div>
            <div style={{ marginTop: 8 }}>
              {x.qty} {x.p.unit} = {(x.qty * x.p.priceUzs).toLocaleString("ru-RU")} UZS
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <a href="/checkout" style={{
          position: "fixed", left: 12, right: 12, bottom: 12,
          textDecoration: "none",
          background: "#111", color: "white",
          padding: 14, borderRadius: 16,
          display: "flex", justifyContent: "space-between"
        }}>
          <div>Далее</div>
          <div>Итого: {total.toLocaleString("ru-RU")} UZS</div>
        </a>
      )}
    </div>
  );
}
