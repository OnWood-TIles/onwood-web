"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { Swatch, WebsiteRange } from "../../../../lib/onbase/client";
import { AddToOrderModal, PriceBlock, type Summary } from "./TradeCards";

// The trade product page's action block: the selected colourway's trade price
// (RRP struck / Your Price) plus "Add to order". Rendered by ProductView via its
// renderActions slot, so it always reflects the swatch the customer is viewing.
// Unpriced options fall back to "Ask us for a price" (browse-only), matching the
// grid cards.
export default function TradeProductActions({
  range,
  swatch,
}: {
  range: WebsiteRange;
  swatch: Swatch | undefined;
}) {
  const [open, setOpen] = useState(false);
  if (!swatch) return null;

  const t = swatch.trade;
  const priced = t?.tradePrice != null;
  const s: Summary = {
    anyPriced: priced,
    sameTrade: true,
    minTrade: t?.tradePrice ?? null,
    rrp: t?.rrpPrice ?? null,
    gst: t?.priceDisplayGst,
    unit: t?.unit ?? range.unit ?? null,
  };

  return (
    <div style={{ marginTop: 28 }}>
      <PriceBlock s={s} singleSwatch />

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {priced ? (
          <button type="button" onClick={() => setOpen(true)} style={addBtn}>
            Add to order
          </button>
        ) : (
          <a href="/contact" style={askBtn}>
            Ask us for a price
          </a>
        )}
        <a href="/trade/cart" style={cartLink}>
          View order request →
        </a>
      </div>

      <p style={{ marginTop: 14, fontSize: 12.5, color: "#8a8577" }}>
        Your trade pricing. Stock is live from our system - add it to your order request and our team will confirm.
      </p>

      {open && <AddToOrderModal range={range} preselectColour={swatch.colour} onClose={() => setOpen(false)} />}
    </div>
  );
}

const addBtn: CSSProperties = {
  border: "none",
  background: "var(--accent)",
  color: "#fff6ee",
  fontWeight: 800,
  fontSize: 15,
  padding: "14px 30px",
  borderRadius: 99,
  cursor: "pointer",
};

const askBtn: CSSProperties = {
  textDecoration: "none",
  background: "#faf7f1",
  color: "#5a6067",
  fontWeight: 700,
  fontSize: 15,
  padding: "14px 26px",
  borderRadius: 99,
  border: "1px solid var(--line)",
};

const cartLink: CSSProperties = {
  textDecoration: "none",
  background: "#fff",
  color: "var(--ink)",
  fontWeight: 700,
  fontSize: 15,
  padding: "14px 26px",
  borderRadius: 99,
  border: "1px solid var(--line)",
};
