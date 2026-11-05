"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../CartProvider";
import type { TradeBuild } from "../../../../lib/tradeBuild";

// The trade builder's add-to-order block (the 2D builder's summary, trade mode): a
// quantity and "Add to order". The build goes into the same order request as their
// tiles; OnBase re-prices it at submit (the build's RRP less their % off).
export default function TradeBuildActions({
  trade,
  name,
  image,
  unitPrice,
  options,
  spec,
  href,
  ok,
}: {
  trade: TradeBuild;
  name: string;
  image: string | null;
  unitPrice: number;
  options: Record<string, string | string[] | undefined>;
  spec: string[];
  href: string;
  ok: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (trade.pct == null) {
    return (
      <p className="vb-fine" style={{ marginTop: 10 }}>
        Trade pricing for this range isn&apos;t set up on your account yet. <a href="/contact" target="_blank" rel="noopener noreferrer" className="vb-link">Ask us</a> and we&apos;ll add it.
      </p>
    );
  }

  const addBuild = () => {
    const picks: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(options)) if (v != null && v !== "" && !(Array.isArray(v) && !v.length)) picks[k] = v;
    add({ productId: trade.productId, name, unit: "Per Unit", unitPrice, image, options: picks, spec, href }, qty);
    setAdded(true);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line, #dedad2)", borderRadius: 10, overflow: "hidden" }}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" style={stepBtn}>&minus;</button>
          <span style={{ width: 40, textAlign: "center", fontWeight: 700 }}>{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" style={stepBtn}>+</button>
        </div>
        <button type="button" className="vb-btn" disabled={!ok} onClick={addBuild} style={{ flex: 1, minWidth: 160, border: "none", background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 15, padding: "12px 18px", borderRadius: 99, cursor: ok ? "pointer" : "not-allowed", opacity: ok ? 1 : 0.5 }}>
          Add to order
        </button>
      </div>
      {added && (
        <p className="vb-fine" role="status" style={{ marginTop: 10, color: "#1f7a54", fontWeight: 700 }}>
          Added to your order request. <Link href="/trade/cart" className="vb-link">View order request →</Link>
        </p>
      )}
      {!added && <Link href="/trade/cart" className="vb-link" style={{ display: "block", marginTop: 10 }}>View order request →</Link>}
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 34,
  height: 38,
  border: "none",
  background: "#f6f2ea",
  color: "var(--ink)",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};
