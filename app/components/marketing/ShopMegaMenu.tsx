"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ShopMenuDept } from "../../../lib/onbase/client";

// Full-width Shop mega-menu (adapted from the Claude Design shop concept, kept
// entirely on the OnWood theme vars - no new palette). A department list that
// staggers in when the panel opens, with an "IN FOCUS" preview pane that swaps
// its image + category shortcuts as you move between departments.
//
// Desktop only: it lives inside the header's desktop nav (hidden on mobile via
// the nav's own media query), so the fixed panel is hidden on small screens.

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--accent2)",
  marginBottom: 14,
};

function triggerStyle(open: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    color: "inherit",
    fontWeight: 600,
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 9,
    opacity: open ? 1 : 0.8,
    cursor: "pointer",
  };
}

export default function ShopMegaMenu({ depts }: { depts: ShopMenuDept[] }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 130);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // No catalogue yet -> a plain Shop link, no menu.
  if (!depts.length) {
    return (
      <a href="/shop" style={triggerStyle(false)}>
        Shop
      </a>
    );
  }

  const active = depts[Math.min(focus, depts.length - 1)];

  return (
    <div onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <a href="/shop" onFocus={openNow} aria-expanded={open} style={triggerStyle(open)}>
        Shop
        <svg
          viewBox="0 0 12 8"
          width="9"
          height="6"
          aria-hidden="true"
          style={{ marginLeft: 5, opacity: 0.55, transform: open ? "rotate(180deg)" : "none", transition: "transform .3s" }}
        >
          <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <div
        className="ow-mega-panel"
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
        aria-hidden={!open}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 70,
          zIndex: 149,
          overflow: "hidden",
          clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: "clip-path .55s cubic-bezier(.76,0,.19,1)",
          pointerEvents: open ? "auto" : "none",
          background: "color-mix(in oklab, var(--bg) 94%, #fff)",
          borderBottom: "1px solid var(--line)",
          boxShadow: open ? "0 40px 80px -34px rgba(32,48,58,.5)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "34px 28px 38px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 46,
          }}
        >
          {/* Left: departments */}
          <div>
            <div style={eyebrow}>Shop by category</div>
            <div>
              {depts.map((d, i) => (
                <Link
                  key={d.slug}
                  href={`/shop/${d.slug}`}
                  onMouseEnter={() => setFocus(i)}
                  onFocus={() => setFocus(i)}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    width: "100%",
                    textDecoration: "none",
                    color: i === focus ? "var(--accent)" : "var(--ink)",
                    borderBottom: "1px solid var(--line)",
                    padding: "13px 6px",
                    paddingLeft: open && i === focus ? 16 : 6,
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(22px)",
                    transition: `opacity .5s ${i * 0.04 + 0.05}s, transform .5s ${i * 0.04 + 0.05}s, color .25s, padding-left .25s`,
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: "-.01em",
                  }}
                >
                  <span style={{ flex: 1 }}>{d.label}</span>
                  <span style={{ ...eyebrow, marginBottom: 0, opacity: 0.6 }}>{d.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: IN FOCUS preview - a real product shown via its SECONDARY
              ("see it installed") photo; the image links straight to it. */}
          <div>
            <div style={eyebrow}>In focus — {active.focusName ?? active.label}</div>
            {active.focusImage && active.focusSlug ? (
              <Link
                href={`/product/${active.focusSlug}`}
                onClick={() => setOpen(false)}
                style={{ display: "block", position: "relative", height: 260, borderRadius: 16, overflow: "hidden", background: "#efece5", border: "1px solid var(--line)", textDecoration: "none" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={active.focusSlug}
                  src={active.focusImage}
                  alt={active.focusName ?? active.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", animation: "owMegaFade .5s ease" }}
                />
              </Link>
            ) : (
              <div style={{ position: "relative", height: 260, borderRadius: 16, overflow: "hidden", background: "#efece5", border: "1px solid var(--line)" }}>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#8a8577", fontSize: 13 }}>
                  Photos coming soon
                </div>
              </div>
            )}
            {active.categories.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {active.categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop/${active.slug}?c=${c.slug}`}
                    onClick={() => setOpen(false)}
                    style={{
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                      border: "1px solid var(--line)",
                      borderRadius: 99,
                      padding: "6px 14px",
                      background: "#fff",
                    }}
                  >
                    {c.label} <span style={{ opacity: 0.5 }}>{c.count}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/shop/${active.slug}`}
              onClick={() => setOpen(false)}
              style={{ display: "inline-block", marginTop: 16, color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              Shop all {active.label.toLowerCase()} →
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes owMegaFade{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
