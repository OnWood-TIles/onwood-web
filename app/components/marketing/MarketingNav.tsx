"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "../../../lib/content";
import styles from "./marketingNav.module.css";

// Fixed marketing header transcribed from .refwork/tiles-sections/00-header-header.html.
// Adds a scrolled state (background/blur intensify past 12px) and a mobile
// hamburger that toggles a dropdown of the same links. Anchor links scroll the
// current page; /specials is an internal route via next/link.
export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} style={linkStyle}>
            {l.label}
          </a>
        ))}
        <Link
          href="/specials"
          style={{
            textDecoration: "none",
            color: "var(--accent)",
            fontWeight: 700,
            fontSize: 14,
            padding: "8px 12px",
            borderRadius: 9,
          }}
        >
          Specials
        </Link>
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
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/specials"
            className={`${styles.mobileLink} ${styles.mobileSpecials}`}
            onClick={() => setOpen(false)}
          >
            Specials
          </Link>
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
