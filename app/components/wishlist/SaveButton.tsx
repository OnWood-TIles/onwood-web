"use client";

import { toggleWish, useWishHas, type WishItem } from "../../../lib/wishlist";

// Heart toggle for saving a product to the browser wishlist. Works inside a
// <Link> or a clickable card: it stops the click from bubbling/navigating.
//   "overlay" - a round translucent chip for the corner of an image card
//   "inline"  - a pill with a label, for the product page
export default function SaveButton({ item, variant = "overlay" }: { item: WishItem; variant?: "overlay" | "inline" }) {
  const saved = useWishHas(item.href);
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); toggleWish(item); };

  const Heart = (
    <svg viewBox="0 0 24 24" width={variant === "inline" ? 18 : 17} height={variant === "inline" ? 18 : 17} aria-hidden="true"
      fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
    </svg>
  );

  if (variant === "inline") {
    return (
      <button type="button" onClick={onClick} aria-pressed={saved} style={{
        display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer", fontFamily: "inherit",
        fontWeight: 800, fontSize: 14, padding: "12px 20px", borderRadius: 999,
        border: `1px solid ${saved ? "var(--accent)" : "var(--line)"}`,
        background: saved ? "color-mix(in oklab, var(--accent) 12%, #fff)" : "#fff",
        color: saved ? "var(--accent)" : "var(--ink)", transition: "all .2s ease",
      }}>
        {Heart}{saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={saved} aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
      title={saved ? "Saved" : "Save"} style={{
        display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 999, cursor: "pointer",
        border: "none", background: "rgba(255,255,255,.92)", color: saved ? "var(--accent)" : "#3a444a",
        boxShadow: "0 4px 14px -4px rgba(16,28,30,.45)", transition: "transform .15s ease, color .2s ease",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.9)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {Heart}
    </button>
  );
}
