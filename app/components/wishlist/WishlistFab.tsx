"use client";

import Link from "next/link";
import { useWishlist } from "../../../lib/wishlist";

// Floating "Saved (N)" pill, mounted site-wide. Hidden until something is saved,
// so it never clutters an empty page. Links to /saved.
export default function WishlistFab() {
  const items = useWishlist();
  if (!items.length) return null;
  return (
    <Link
      href="/saved"
      aria-label={`View your ${items.length} saved item${items.length === 1 ? "" : "s"}`}
      style={{
        position: "fixed", right: 18, bottom: "calc(18px + env(safe-area-inset-bottom))", zIndex: 200, display: "inline-flex", alignItems: "center", gap: 9,
        background: "var(--ink, #20303a)", color: "#fff6ee", textDecoration: "none", fontWeight: 800, fontSize: 14,
        padding: "12px 18px", borderRadius: 999, boxShadow: "0 14px 34px -14px rgba(16,28,30,.6)",
      }}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
      </svg>
      Saved ({items.length})
    </Link>
  );
}
