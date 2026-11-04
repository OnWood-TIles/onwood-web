"use client";

import Link from "next/link";
import { useWishlist } from "../../../lib/wishlist";
import { useQuoteCart } from "../../../lib/quoteCart";

// Floating "Quote (N)" and "Saved (N)" pills, mounted site-wide. Each hidden until
// something is in it, so they never clutter an empty page.
export default function WishlistFab() {
  const items = useWishlist();
  const quote = useQuoteCart();
  if (!items.length && !quote.length) return null;
  return (
    <div style={{ position: "fixed", right: 18, bottom: "calc(18px + env(safe-area-inset-bottom))", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      {quote.length > 0 && (
        <Link href="/quote" aria-label={`View your quote list (${quote.length} item${quote.length === 1 ? "" : "s"})`} style={{
          display: "inline-flex", alignItems: "center", gap: 9, background: "var(--accent, #b85c3a)", color: "#fff6ee", textDecoration: "none", fontWeight: 800, fontSize: 14,
          padding: "12px 18px", borderRadius: 999, boxShadow: "0 14px 34px -14px rgba(16,28,30,.6)",
        }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4h6l1 2h3v14H5V6h3z" /><path d="M9 11h6M9 15h4" /></svg>
          Quote ({quote.length})
        </Link>
      )}
      {items.length > 0 && <Link
      href="/saved"
      aria-label={`View your ${items.length} saved item${items.length === 1 ? "" : "s"}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 9,
        background: "var(--ink, #20303a)", color: "#fff6ee", textDecoration: "none", fontWeight: 800, fontSize: 14,
        padding: "12px 18px", borderRadius: 999, boxShadow: "0 14px 34px -14px rgba(16,28,30,.6)",
      }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
      </svg>
      Saved ({items.length})
    </Link>}
    </div>
  );
}
