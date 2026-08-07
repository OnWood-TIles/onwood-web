"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// Pinterest-style masonry gallery of "see it installed" product images, with a
// simple Tiles / Stone Veneer filter bar and a click-to-enlarge lightbox. Every
// image carries descriptive alt text (built server-side from the product data).
// Images keep their natural aspect ratio inside CSS columns, which gives the
// staggered masonry look for free (no layout JS).

export type GalleryItem = {
  img: string;
  name: string;
  colour: string;
  href: string;
  alt: string;
  group: "tiles" | "stone";
  groupLabel: string;
  watermark: boolean;
};

type Filter = "all" | "tiles" | "stone";

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" };

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);

  const shown = filter === "all" ? items : items.filter((i) => i.group === filter);
  const hasTiles = items.some((i) => i.group === "tiles");
  const hasStone = items.some((i) => i.group === "stone");

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${items.length})` },
    ...(hasTiles ? [{ key: "tiles" as Filter, label: `Tiles (${items.filter((i) => i.group === "tiles").length})` }] : []),
    ...(hasStone ? [{ key: "stone" as Filter, label: `Stone Veneer (${items.filter((i) => i.group === "stone").length})` }] : []),
  ];

  // When the filter changes, close any open lightbox (indexes no longer align).
  const pick = (f: Filter) => { setFilter(f); setActive(null); };

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: number) => setActive((a) => (a == null ? a : (a + dir + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (active == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [active, close, step]);

  const current = active == null ? null : shown[active];

  return (
    <div>
      {/* ── Filter bar ── */}
      {chips.length > 1 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", margin: "0 auto 30px", maxWidth: 900 }}>
          {chips.map((c) => {
            const on = filter === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => pick(c.key)}
                style={{
                  cursor: "pointer",
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 800,
                  fontSize: 12.5,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  background: on ? "var(--accent)" : "var(--surface)",
                  color: on ? "#fff" : "var(--ink)",
                  transition: "all .18s ease",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Masonry ── */}
      {shown.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 16, padding: "40px 0" }}>Nothing to show here yet.</p>
      ) : (
        <div className="gal-masonry">
          {shown.map((it, idx) => (
            <button
              key={`${it.img}-${idx}`}
              type="button"
              className="gal-item"
              onClick={() => setActive(idx)}
              aria-label={`Enlarge ${it.name}${it.colour ? " in " + it.colour : ""}`}
            >
              <span className="gal-imgwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.img} alt={it.alt} loading="lazy" className="gal-img" />
                {it.watermark && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/onwood-logo-white.png" alt="" aria-hidden className="gal-wm" />
                )}
                <span className="gal-cap">
                  <span className="gal-name">{it.name}</span>
                  {it.colour ? <span className="gal-col">{it.colour}</span> : null}
                </span>
                <span className="gal-zoom" aria-hidden>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                  </svg>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.name}${current.colour ? ", " + current.colour : ""}`}
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(14,20,22,.93)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          {/* Close */}
          <button type="button" onClick={close} aria-label="Close" style={iconBtn({ top: 18, right: 18 })}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {/* Prev / next */}
          {shown.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous" style={iconBtn({ left: 14, top: "50%" }, true)}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next" style={iconBtn({ right: 14, top: "50%" }, true)}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          {/* Image + caption (clicks inside don't close) */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: "94vw" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.img} alt={current.alt} style={{ maxWidth: "94vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 14, boxShadow: "0 30px 80px -30px rgba(0,0,0,.7)", display: "block" }} />
            <div style={{ textAlign: "center", color: "#F6F1E8" }}>
              <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em" }}>{current.name}</div>
              {current.colour ? <div style={{ ...eyebrow, color: "var(--accent2)", marginTop: 6 }}>{current.colour}</div> : null}
              <Link href={current.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "11px 22px", borderRadius: 999 }}>
                View this {current.group === "stone" ? "stone" : "tile"} <span aria-hidden>→</span>
              </Link>
              <p style={{ fontSize: 11.5, color: "rgba(246,241,232,.5)", margin: "14px 0 0", maxWidth: "44ch" }}>
                Illustration - AI-generated or rendered. Colour and finish vary; confirm from a physical sample.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gal-masonry{column-count:4;column-gap:18px;max-width:1240px;margin:0 auto}
        @media(max-width:1100px){.gal-masonry{column-count:3}}
        @media(max-width:760px){.gal-masonry{column-count:2;column-gap:14px}}
        @media(max-width:440px){.gal-masonry{column-count:1}}
        .gal-item{display:block;width:100%;padding:0;margin:0 0 18px;border:0;background:none;cursor:pointer;break-inside:avoid;-webkit-column-break-inside:avoid}
        .gal-imgwrap{position:relative;display:block;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--surface);box-shadow:0 18px 40px -34px rgba(16,28,30,.5)}
        .gal-img{width:100%;height:auto;display:block;transition:transform .4s ease}
        .gal-item:hover .gal-img{transform:scale(1.05)}
        .gal-wm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:46%;max-width:150px;opacity:.5;filter:drop-shadow(0 2px 8px rgba(0,0,0,.35));pointer-events:none}
        .gal-cap{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:2px;padding:34px 14px 12px;text-align:left;background:linear-gradient(to top,rgba(14,20,22,.82),rgba(14,20,22,.28) 62%,transparent);opacity:0;transform:translateY(6px);transition:opacity .25s ease,transform .25s ease}
        .gal-item:hover .gal-cap,.gal-item:focus-visible .gal-cap{opacity:1;transform:none}
        .gal-name{font-family:var(--font-archivo);font-weight:800;font-size:14.5px;color:#fff;line-height:1.2}
        .gal-col{font-size:12px;font-weight:700;letter-spacing:.02em;color:var(--accent2)}
        .gal-zoom{position:absolute;top:12px;right:12px;display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--ink);opacity:0;transform:scale(.85);transition:opacity .22s ease,transform .22s ease}
        .gal-item:hover .gal-zoom,.gal-item:focus-visible .gal-zoom{opacity:1;transform:none}
      `}</style>
    </div>
  );
}

function iconBtn(pos: React.CSSProperties, vCenter = false): React.CSSProperties {
  return {
    position: "fixed",
    ...pos,
    ...(vCenter ? { transform: "translateY(-50%)" } : {}),
    zIndex: 310,
    display: "grid",
    placeItems: "center",
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid rgba(246,241,232,.28)",
    background: "rgba(20,26,28,.55)",
    color: "#F6F1E8",
    cursor: "pointer",
  };
}
