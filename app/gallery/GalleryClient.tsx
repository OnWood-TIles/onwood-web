"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FilterBar } from "../components/shop/FilterBar";
import type { FilterGroupVM } from "../../lib/shopFilters";

// Pinterest-style masonry gallery of "see it installed" product visuals, with the
// SAME filter set as the shop (Colour, Size, Location, …) plus a Tiles / Stone
// Veneer chip, and a click-to-enlarge lightbox. Filters + department are mirrored
// to the URL (?dept=&f=group:value) so the state is shareable and so the shop's
// "Search by inspiration" button can hand its active filters straight over.
// Every image carries descriptive alt text (built server-side from the product).

export type GalleryItem = {
  img: string;
  name: string;
  colour: string;
  href: string;
  alt: string;
  group: "tiles" | "stone";
  groupLabel: string;
  watermark: boolean;
  /** Range-level filter values (size, location, look, …) by group slug. */
  rf: Record<string, string[]>;
  /** This colourway's own colour-filter value slugs (per-swatch accuracy). */
  sc: string[];
};

type Dept = "all" | "tiles" | "stone";

// Match the shop: ticking multiple values in a suitability/use group means "works
// in ALL of them" (narrows); every other group is OR.
const AND_GROUPS = new Set(["location-use", "location", "use", "suitability", "location-and-use"]);

// Render in pages so only a batch mounts at once (fast first paint, small DOM).
const PER_PAGE = 60;

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" };

export default function GalleryClient({
  items,
  groups,
  initialActive,
  initialDept,
}: {
  items: GalleryItem[];
  groups: FilterGroupVM[];
  initialActive: Record<string, string[]>;
  initialDept: Dept;
}) {
  const [dept, setDept] = useState<Dept>(initialDept);
  const [active, setActive] = useState<Record<string, string[]>>(initialActive);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(PER_PAGE);

  const hasTiles = items.some((i) => i.group === "tiles");
  const hasStone = items.some((i) => i.group === "stone");

  function syncUrl(d: Dept, a: Record<string, string[]>) {
    const qs = new URLSearchParams();
    if (d !== "all") qs.set("dept", d);
    for (const [g, vals] of Object.entries(a)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    if (typeof window !== "undefined") window.history.replaceState(null, "", `/gallery${s ? `?${s}` : ""}`);
  }

  const toggle = (group: string, value: string) =>
    setActive((prev) => {
      const cur = prev[group] ?? [];
      const nextVals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const next = { ...prev };
      if (nextVals.length) next[group] = nextVals;
      else delete next[group];
      syncUrl(dept, next);
      return next;
    });

  const clearAll = () => { setActive({}); syncUrl(dept, {}); };
  const pickDept = (d: Dept) => { setDept(d); syncUrl(d, active); };

  // AND across groups; OR within (except AND_GROUPS). Colour matches per-swatch
  // (sc); other groups match the range's values (rf). Mirrors the shop exactly.
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (dept !== "all" && it.group !== dept) return false;
      for (const [g, vals] of Object.entries(active)) {
        if (!vals.length) continue;
        // Colour is per-colourway: match THIS swatch's own colour (sc), not the
        // range's union - otherwise every colourway of a range that merely has a
        // white option would match "white". Other groups are range-level (rf).
        const rv = g === "colour" ? it.sc : (it.rf[g] ?? []);
        const test = (v: string) => rv.includes(v);
        const ok = AND_GROUPS.has(g) ? vals.every(test) : vals.some(test);
        if (!ok) return false;
      }
      if (q && !(it.name.toLowerCase().includes(q) || it.colour.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, dept, active, search]);

  // Any filter/department/search change invalidates the lightbox index and
  // resets paging back to the first batch.
  useEffect(() => { setLightbox(null); setVisible(PER_PAGE); }, [dept, active, search]);

  const deptChips: { key: Dept; label: string }[] = [
    { key: "all", label: `All (${items.length})` },
    ...(hasTiles ? [{ key: "tiles" as Dept, label: "Tiles" }] : []),
    ...(hasStone ? [{ key: "stone" as Dept, label: "Stone Veneer" }] : []),
  ];

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) => setLightbox((a) => (a == null ? a : (a + dir + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightbox, close, step]);

  const current = lightbox == null ? null : shown[lightbox];

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto" }}>
      {/* ── Department chips ── */}
      {deptChips.length > 1 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 18 }}>
          {deptChips.map((c) => {
            const on = dept === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => pickDept(c.key)}
                style={{
                  cursor: "pointer", fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 12.5,
                  letterSpacing: ".04em", textTransform: "uppercase", padding: "10px 18px", borderRadius: 999,
                  border: `1px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  background: on ? "var(--accent)" : "var(--surface)", color: on ? "#fff" : "var(--ink)",
                  transition: "all .18s ease",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filter bar (same as the shop) ── */}
      {groups.length > 0 && (
        <FilterBar groups={groups} active={active} onToggle={toggle} onClearAll={clearAll} search={search} onSearchChange={setSearch} />
      )}

      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px", textAlign: "center" }}>
        {shown.length} {shown.length === 1 ? "image" : "images"}
      </p>

      {/* ── Masonry ── */}
      {shown.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 16, padding: "40px 0" }}>
          Nothing matches those filters just yet. Try clearing a filter, or come and see the full range in the showroom.
        </p>
      ) : (
        <>
          <div className="gal-grid">
            {shown.slice(0, visible).map((it, idx) => (
              <button
                key={`${it.img}-${idx}`}
                type="button"
                className="gal-item"
                onClick={() => setLightbox(idx)}
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
          {visible < shown.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
              <button
                type="button"
                onClick={() => setVisible((v) => v + PER_PAGE)}
                style={{ cursor: "pointer", fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 14, letterSpacing: ".02em", padding: "13px 30px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
              >
                Load more <span style={{ color: "var(--muted)", fontWeight: 700 }}>({shown.length - visible} left)</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Lightbox ── */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.name}${current.colour ? ", " + current.colour : ""}`}
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(14,20,22,.93)", backdropFilter: "blur(4px)", overflowY: "auto" }}
        >
          <button type="button" onClick={close} aria-label="Close" style={iconBtn({ top: 18, right: 18 })}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
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
          <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "76px 20px 46px" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: "94vw" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.img} alt={current.alt} style={{ maxWidth: "94vw", maxHeight: "70vh", objectFit: "contain", borderRadius: 14, boxShadow: "0 30px 80px -30px rgba(0,0,0,.7)", display: "block" }} />
              <div style={{ textAlign: "center", color: "#F6F1E8", maxWidth: 540 }}>
                <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em" }}>{current.name}</div>
                {current.colour ? <div style={{ ...eyebrow, color: "var(--accent2)", marginTop: 6 }}>{current.colour}</div> : null}
                <Link href={current.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "var(--accent)", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "11px 22px", borderRadius: 999 }}>
                  View this {current.group === "stone" ? "stone" : "tile"} <span aria-hidden>→</span>
                </Link>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(246,241,232,.7)", margin: "14px auto 0", maxWidth: "48ch" }}>
                  Illustration - AI-generated or rendered. Colour and finish vary; confirm from a physical sample.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Fixed-ratio grid: each cell reserves its space BEFORE the image loads,
           so nothing reflows/jumps as photos come in (the images are square). */
        .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
        @media(max-width:760px){.gal-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}}
        .gal-item{display:block;width:100%;padding:0;margin:0;border:0;background:none;cursor:pointer}
        .gal-imgwrap{position:relative;display:block;aspect-ratio:1/1;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--surface);box-shadow:0 18px 40px -34px rgba(16,28,30,.5)}
        .gal-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease}
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
    zIndex: 310, display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 999,
    border: "1px solid rgba(246,241,232,.28)", background: "rgba(20,26,28,.55)", color: "#F6F1E8", cursor: "pointer",
  };
}
