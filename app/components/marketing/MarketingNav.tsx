"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "../../../lib/content";
import { useNavConfig } from "./NavConfigProvider";
import { useShopMenu } from "./ShopMenuProvider";
import ShopMegaMenu from "./ShopMegaMenu";
import type { NavItem } from "../../../lib/onbase/client";
import styles from "./marketingNav.module.css";

// Fixed marketing header transcribed from .refwork/tiles-sections/00-header-header.html.
// Adds a scrolled state (background/blur intensify past 12px) and a mobile
// hamburger that toggles a dropdown of the same links. Anchor links scroll the
// current page; /specials is an internal route via next/link.
// The link set comes from the /admin nav designer (NavConfigProvider); until
// something is designed there, the built-in NAV_LINKS + Specials render.
export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const designed = useNavConfig();
  const shopDepts = useShopMenu();
  const rawItems: NavItem[] = designed.length
    ? designed
    : [...NAV_LINKS.map((l) => ({ label: l.label, href: l.href })), { label: "Specials", href: "/specials" }];
  // The Shop mega-menu is always rendered as the shop entry, so drop any "Shop"
  // item from the designed/built-in list to avoid a duplicate Shop button.
  const items: NavItem[] = rawItems.filter(
    (i) => (i.label || "").trim().toLowerCase() !== "shop" && i.href !== "/shop",
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "inherit",
    fontWeight: 600,
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 9,
    opacity: 0.8,
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        background: scrolled
          ? "color-mix(in oklab, var(--bg) 88%, transparent)"
          : "color-mix(in oklab, var(--bg) 62%, transparent)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(16px)",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(16px)",
        borderBottom: "1px solid var(--line)",
        boxShadow: scrolled ? "0 10px 30px -22px rgba(32,48,58,.4)" : "none",
        transition: "background .3s ease, backdrop-filter .3s ease, box-shadow .3s ease",
      }}
    >
      {/* Brand: roof mark + ONWOOD wordmark */}
      <a
        href="/"
        aria-label="OnWood Tiles home"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <span style={{ display: "grid", placeItems: "center", width: 34, height: 34 }}>
          <svg viewBox="0 0 100 74" width="30" height="24" aria-hidden="true">
            <path
              d="M8 44 L50 8 L92 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="20" y="52" width="60" height="8" rx="4" fill="var(--accent2)" />
            <rect x="28" y="66" width="44" height="7" rx="3.5" fill="var(--accent)" />
          </svg>
        </span>
        <span
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 900,
            letterSpacing: "0.14em",
            fontSize: 18,
          }}
        >
          ONWOOD
        </span>
      </a>

      {/* Desktop nav */}
      <nav className={styles.desktopNav} aria-label="Primary">
        <ShopMegaMenu depts={shopDepts} />
        {items.map((item) =>
          item.children?.length ? (
            // Popup item: hover/focus opens a dropdown of its children.
            <div key={item.label} className={styles.popupWrap}>
              <a href={item.href || item.children[0].href} style={{ ...linkStyle, ...(item.label === "Specials" ? { color: "var(--accent)", fontWeight: 700, opacity: 1 } : {}) }}>
                {item.label}
                <svg viewBox="0 0 12 8" width="9" height="6" aria-hidden="true" style={{ marginLeft: 5, opacity: 0.55 }}>
                  <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <div className={styles.popupMenu}>
                {item.children.map((c) => (
                  <a key={`${c.label}-${c.href}`} href={c.href} className={styles.popupLink}>
                    {c.label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <a
              key={item.label}
              href={item.href || "/"}
              style={{ ...linkStyle, ...(item.label === "Specials" ? { color: "var(--accent)", fontWeight: 700, opacity: 1 } : {}) }}
            >
              {item.label}
            </a>
          ),
        )}
        <a
          href="/#contact"
          style={{
            textDecoration: "none",
            color: "#fff",
            background: "var(--ink)",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 20px",
            borderRadius: 100,
            marginLeft: 6,
            whiteSpace: "nowrap",
          }}
        >
          Book a visit
        </a>
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className={styles.burger}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          {open ? (
            <path
              d="M6 6 L18 18 M18 6 L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7 H20 M4 12 H20 M4 17 H20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {/* Mobile dropdown */}
      {open ? (
        <div className={styles.mobileMenu}>
          {shopDepts.length > 0 && (
            <div>
              <a href="/shop" className={styles.mobileLink} onClick={() => setOpen(false)} style={{ fontWeight: 800 }}>
                Shop
              </a>
              {shopDepts.map((d) => (
                <a
                  key={d.slug}
                  href={`/shop/${d.slug}`}
                  className={styles.mobileLink}
                  style={{ paddingLeft: 28, fontSize: 14, opacity: 0.8 }}
                  onClick={() => setOpen(false)}
                >
                  {d.label} <span style={{ opacity: 0.5 }}>({d.count})</span>
                </a>
              ))}
            </div>
          )}
          {items.map((item) => (
            <div key={item.label}>
              <a
                href={item.href || item.children?.[0]?.href || "/"}
                className={`${styles.mobileLink} ${item.label === "Specials" ? styles.mobileSpecials : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
              {item.children?.map((c) => (
                <a
                  key={`${c.label}-${c.href}`}
                  href={c.href}
                  className={styles.mobileLink}
                  style={{ paddingLeft: 28, fontSize: 14, opacity: 0.8 }}
                  onClick={() => setOpen(false)}
                >
                  {c.label}
                </a>
              ))}
            </div>
          ))}
          <a
            href="/#contact"
            className={styles.mobileLink}
            onClick={() => setOpen(false)}
            style={{
              color: "#fff",
              background: "var(--ink)",
              fontWeight: 700,
              textAlign: "center",
              borderRadius: 100,
              marginTop: 6,
            }}
          >
            Book a visit
          </a>
        </div>
      ) : null}
    </header>
  );
}
