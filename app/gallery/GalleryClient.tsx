"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FilterBar } from "../components/shop/FilterBar";
import SaveButton from "../components/wishlist/SaveButton";
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
  // Focus management for the lightbox dialog: remember the trigger that opened
  // it (to restore focus on close) and move focus onto the Close button when it
  // opens, so keyboard/screen-reader users land inside the dialog.
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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
    // Move keyboard focus into the dialog once it renders.
    const trigger = triggerRef.current;
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // Restore focus to the thumbnail that opened the lightbox.
      trigger?.focus();
    };
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
              <div key={`${it.img}-${idx}`} className={`gal-cell ${galVariant(idx)}`}>
                <button
                  type="button"
                  className="gal-item"
                  onClick={(e) => { triggerRef.current = e.currentTarget; setLightbox(idx); }}
                  aria-label={`Enlarge ${it.name}${it.colour ? " in " + it.colour : ""}`}
                >
                  <span className="gal-imgwrap">
                    <Image
                      src={it.img}
                      alt={it.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 760px) 50vw, (max-width: 1240px) 33vw, 420px"
                      className="gal-img"
                      style={{ objectFit: "cover" }}
                    />
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
              </div>
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
          <button ref={closeBtnRef} type="button" onClick={close} aria-label="Close" style={iconBtn({ top: 18, right: 18 })}>
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
                {/* Actions live here (not on every thumbnail) so the gallery wall
                    stays clean: favourite + Save-to-Pinterest for the opened image. */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                  <SaveButton variant="inline" item={{ href: current.href, name: current.name, colour: current.colour, image: current.img }} />
                  <a
                    href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent("https://onwoodtiles.com.au" + current.href)}&media=${encodeURIComponent(current.img)}&description=${encodeURIComponent(current.alt || current.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Save ${current.name} to Pinterest`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 99, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", textDecoration: "none" }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#e60023" aria-hidden>
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24.007 5.367 18.641.001 12.017.001z" />
                    </svg>
                    Save to Pinterest
                  </a>
                </div>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(246,241,232,.7)", margin: "16px auto 0", maxWidth: "54ch" }}>
                  Illustration - AI-generated or digitally rendered, not a photograph of the actual product. Colour, tone, veining, scale, layout, grout colour and finish can differ noticeably; always confirm your selection from a current physical sample.{" "}
                  <Link href="/terms-of-use#ai-imagery" style={{ color: "var(--accent2)", textDecoration: "underline", fontWeight: 600 }}>Read our full imagery disclosure</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Pinterest-style grid: fixed row height + spanning "tall"/"wide"/"big"
           cells give varied, staggered sizes for visual interest, while the grid
           (not the images) defines every cell's box - so NOTHING reflows/jumps as
           photos load. Square photos are cover-cropped to fill each cell. */
        .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));grid-auto-rows:216px;grid-auto-flow:dense;gap:14px}
        @media(max-width:760px){.gal-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:150px;gap:10px}}
        .gal-cell{position:relative}
        .gal-cell.tall{grid-row:span 2}
        .gal-cell.wide{grid-column:span 2}
        .gal-cell.big{grid-row:span 2;grid-column:span 2}
        .gal-item{display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:none;cursor:pointer}
        .gal-imgwrap{position:relative;display:block;width:100%;height:100%;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--surface);box-shadow:0 18px 40px -34px rgba(16,28,30,.5)}
        .gal-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease}
        .gal-item:hover .gal-img{transform:scale(1.05)}
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

// Deterministic size variety for the Pinterest-style grid - stable per grid
// position (no reflow) but reads as random. Occasional big/wide, more tall.
function galVariant(i: number): string {
  const m = (i * 5 + 2) % 17;
  if (m === 0) return "big";
  if (m === 6 || m === 12) return "wide";
  if (m === 3 || m === 8 || m === 14) return "tall";
  return "";
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
