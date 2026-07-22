"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

// Trade Partner portal header: brand lockup, the section links, a cart badge and log out.
// Kept deliberately simple (warm cream band) so it reads as "your account area",
// distinct from the marketing chrome.
const LINKS = [
  { label: "Dashboard", href: "/trade" },
  { label: "Catalogue", href: "/trade/catalogue" },
  { label: "Orders", href: "/trade/orders" },
];

export default function TradeNav({ customerName }: { customerName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [busy, setBusy] = useState(false);

  const isActive = (href: string) =>
    href === "/trade" ? pathname === "/trade" : pathname.startsWith(href);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/trade/logout", { method: "POST" });
    } catch {
      // even if the call fails, the cookie clears on the server side best-effort
    }
    router.replace("/trade/login");
    router.refresh();
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "color-mix(in oklab, var(--bg) 92%, transparent)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/trade"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/onwood-logo-ink-tight.png" alt="OnWood Tiles" style={{ height: 32, width: "auto", display: "block" }} />
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
              borderRadius: 99,
              padding: "2px 8px",
            }}
          >
            Trade
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginLeft: "auto" }} aria-label="Trade Partner portal">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700,
                padding: "8px 13px",
                borderRadius: 10,
                color: isActive(l.href) ? "var(--accent)" : "#3a4750",
                background: isActive(l.href) ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/trade/cart"
            aria-label={`Order request (${count} items)`}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              padding: "8px 13px",
              borderRadius: 10,
              color: pathname.startsWith("/trade/cart") ? "var(--accent)" : "#3a4750",
              background: pathname.startsWith("/trade/cart") ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "transparent",
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2.2l1.7 11.4a1.5 1.5 0 0 0 1.5 1.3h8.9a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6" />
            </svg>
            Cart
            {count > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 99,
                  background: "var(--accent)",
                  color: "#fff6ee",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-grid",
                  placeItems: "center",
                }}
              >
                {count}
              </span>
            )}
          </Link>

          <span style={{ width: 1, height: 22, background: "var(--line)", margin: "0 6px" }} aria-hidden />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#5a6067", whiteSpace: "nowrap" }}>{customerName}</span>
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            style={{
              marginLeft: 6,
              fontSize: 13.5,
              fontWeight: 700,
              padding: "8px 13px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "#fff",
              color: "#3a4750",
              cursor: "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "..." : "Log out"}
          </button>
        </nav>
      </div>
    </header>
  );
}
