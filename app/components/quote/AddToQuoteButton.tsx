"use client";

import { useState } from "react";
import Link from "next/link";
import { addQuote, type QuoteItem } from "../../../lib/quoteCart";

// "Add to quote" - puts the product (or the current build) on the quote list. The
// quantity / m² / waste are set on the list itself (/quote), so this is one tap.
export default function AddToQuoteButton({ item, label = "Add to quote" }: { item: Omit<QuoteItem, "id">; label?: string }) {
  const [added, setAdded] = useState(false);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => { addQuote(item); setAdded(true); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer", fontFamily: "inherit",
          fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 99, border: "1px solid var(--ink)",
          background: added ? "var(--ink)" : "#fff", color: added ? "#fff6ee" : "var(--ink)", transition: "all .2s ease",
        }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 4h6l1 2h3v14H5V6h3z" /><path d="M9 11h6M9 15h4" />
        </svg>
        {added ? "Added to quote" : label}
      </button>
      {added && <Link href="/quote" style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>View quote list →</Link>}
    </span>
  );
}
