"use client";

import { useMemo, useState } from "react";
import type { CatalogueItem } from "../../../../lib/onbase/trade";
import { AvailabilityPill } from "../../../components/shop/shared";
import { useCart } from "../CartProvider";

// Trade catalogue: the full online range grouped by category. Each product shows
// the RRP struck through and the customer's "Your Price" beneath (or "trade price
// on request" where we have not priced it for them yet). Priced items can be added
// to the order request; the real price is re-computed server-side at submit.
function gstSuffix(mode: CatalogueItem["priceDisplayGst"]): string {
  if (mode === "INCLUDE_GST") return " inc GST";
  if (mode === "EXCLUDE_GST") return " ex GST";
  return "";
}

function money(n: number): string {
  return `$${(n ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CatalogueGrid({ items }: { items: CatalogueItem[] }) {
  const [q, setQ] = useState("");
  const [onlyPriced, setOnlyPriced] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items;
    if (needle) {
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(needle) ||
          (it.description ?? "").toLowerCase().includes(needle) ||
          it.colours.some((c) => c.colour.toLowerCase().includes(needle)),
      );
    }
    if (onlyPriced) list = list.filter((it) => it.tradePrice != null);
    return list;
  }, [items, q, onlyPriced]);

  const groups = useMemo(() => {
    const map = new Map<string, CatalogueItem[]>();
    for (const it of filtered) {
      const key = it.departmentLabel || "Other";
      const g = map.get(key) ?? [];
      g.push(it);
      map.set(key, g);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const pricedCount = items.filter((it) => it.tradePrice != null).length;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", borderRadius: 18, border: "1px dashed var(--line)", background: "color-mix(in oklab, var(--bg) 60%, #fff)" }}>
        <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, margin: 0 }}>Your catalogue is being set up</p>
        <p style={{ color: "#5a6067", fontSize: 14.5, maxWidth: 440, margin: "10px auto 0", lineHeight: 1.6 }}>
          We are still adding your trade items. Please check back shortly, or get in touch and we will sort it out.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the range..."
          aria-label="Search catalogue"
          style={{ flex: "1 1 240px", maxWidth: 420, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "#fff", fontSize: 15, color: "var(--ink)" }}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#5a6067", cursor: "pointer", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={onlyPriced} onChange={(e) => setOnlyPriced(e.target.checked)} />
          Only my priced items <span style={{ color: "#a8a294" }}>({pricedCount})</span>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#5a6067", fontSize: 15 }}>Nothing matched &ldquo;{q}&rdquo;.</p>
      ) : (
        groups.map(([label, rows]) => (
          <section key={label} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 17, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--ink)", margin: "0 0 14px", display: "flex", alignItems: "baseline", gap: 8 }}>
              {label}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#a8a294", textTransform: "none", letterSpacing: 0 }}>{rows.length}</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
              {rows.map((it) => <CatalogueCard key={it.productId} item={it} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function CatalogueCard({ item }: { item: CatalogueItem }) {
  const { add } = useCart();
  const priced = item.tradePrice != null;
  const hasColours = item.colours.length > 1;
  const [colourIdx, setColourIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const colour = hasColours ? item.colours[colourIdx] : item.colours[0] ?? null;
  const availability = colour?.availability ?? item.availability;
  const image = colour?.image ?? item.image ?? null;
  const swatchHex = colour?.swatchHex ?? null;
  const unitSuffix = item.unit ? ` / ${item.unit}` : "";
  const saving = priced && item.rrpPrice > (item.tradePrice ?? 0);

  function addToCart() {
    if (!priced) return;
    add(
      { productId: item.productId, colour: hasColours ? colour?.colour : undefined, name: item.name, unit: item.unit, unitPrice: item.tradePrice!, image },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px -22px rgba(32,48,58,.3)" }}>
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: swatchHex || "#f3efe6" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={item.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(32,48,58,.4)", fontWeight: 700, fontSize: 13 }}>Photo coming soon</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10 }}><AvailabilityPill availability={availability} /></div>
      </div>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 15.5, lineHeight: 1.25 }}>{item.name}</h3>

        {/* Price */}
        {priced ? (
          <div style={{ marginTop: 8 }}>
            {saving && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ textDecoration: "line-through", color: "#a8a294", fontSize: 14, fontWeight: 600 }}>{money(item.rrpPrice)}</span>
                <span style={{ fontSize: 10.5, color: "#a8a294", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>RRP</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: saving ? 1 : 0 }}>
              <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{money(item.tradePrice!)}</span>
              <span style={{ fontSize: 12.5, color: "#8a8577", fontWeight: 600 }}>{unitSuffix}{gstSuffix(item.priceDisplayGst)}</span>
            </div>
            <div style={{ fontSize: 11, color: "#1f7a54", fontWeight: 700, marginTop: 1 }}>Your Price</div>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>{money(item.rrpPrice)}</span>
              <span style={{ fontSize: 12.5, color: "#8a8577", fontWeight: 600 }}>{unitSuffix}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#a86a3c", fontWeight: 700, marginTop: 2 }}>Trade price on request</div>
          </div>
        )}

        {item.coverageM2 != null && item.coverageM2 > 0 && (
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#8a8577" }}>
            about {Math.round(1 / item.coverageM2)} per m&sup2; ({item.coverageM2} m&sup2; each)
          </p>
        )}

        {/* Colour picker */}
        {hasColours && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#5a6067", marginBottom: 7 }}>{colour?.colour}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {item.colours.map((c, i) => (
                <button key={`${c.colour}-${i}`} type="button" onClick={() => setColourIdx(i)} title={c.colour} aria-label={c.colour}
                  style={{ width: 26, height: 26, borderRadius: 8, cursor: "pointer", padding: 0, overflow: "hidden", background: c.swatchHex || "#e7e2d6", border: i === colourIdx ? "2px solid var(--accent)" : "1px solid var(--line)" }}>
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + add (priced only) */}
        {priced ? (
          <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease quantity" style={stepBtn}>&minus;</button>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Math.round(Number(e.target.value) || 1)))} aria-label="Quantity"
                style={{ width: 44, textAlign: "center", border: "none", fontSize: 14, fontWeight: 700, color: "var(--ink)", background: "transparent", MozAppearance: "textfield" }} />
              <button type="button" onClick={() => setQty((v) => v + 1)} aria-label="Increase quantity" style={stepBtn}>+</button>
            </div>
            <button type="button" onClick={addToCart}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", background: added ? "#1f7a54" : "var(--accent)", color: "#fff6ee", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background .2s ease" }}>
              {added ? "Added" : "Add"}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <a href="/contact" style={{ display: "block", textAlign: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "#faf7f1", color: "#5a6067", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
              Ask us for a price
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 34,
  height: 38,
  border: "none",
  background: "#f6f2ea",
  color: "var(--ink)",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer",
};
