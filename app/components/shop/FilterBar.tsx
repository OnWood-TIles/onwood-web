"use client";

import { useEffect, useRef, useState } from "react";

type FilterVal = {
  slug: string;
  label: string;
  hex?: string | null;
  size?: { w: number; h: number } | null;
};
type FilterGroupVM = { slug: string; label: string; values: FilterVal[] };

// A little proportional rectangle for a tile size (e.g. 600x300), so shoppers
// have something visual to relate the format to.
function SizeGlyph({ w, h }: { w: number; h: number }) {
  const box = 20;
  const ar = w / h;
  const gw = ar >= 1 ? box : Math.max(6, Math.round(box * ar));
  const gh = ar >= 1 ? Math.max(6, Math.round(box / ar)) : box;
  return (
    <span style={{ display: "inline-flex", width: 22, height: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ width: gw, height: gh, border: "1.5px solid currentColor", borderRadius: 2, opacity: 0.75 }} />
    </span>
  );
}

// Full-width horizontal filter bar: one dropdown per group. Controlled - ticking
// a value calls onToggle and the grid re-filters INSTANTLY in the browser (no
// navigation / server round-trip). Multi-select stays open so you can tick a few.
export function FilterBar({
  groups,
  active,
  onToggle,
  onClearAll,
  search,
  onSearchChange,
  sort,
  sortOptions,
  onSortChange,
}: {
  groups: FilterGroupVM[];
  active: Record<string, string[]>;
  onToggle: (group: string, value: string) => void;
  onClearAll: () => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  /** Optional "Sort by" control rendered inside the bar (public shop + gallery). */
  sort?: string;
  sortOptions?: { key: string; label: string }[];
  onSortChange?: (v: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile: filters hidden until "Refine" tapped
  const ref = useRef<HTMLDivElement>(null);
  const hasActive = Object.values(active).some((v) => v.length);
  const activeCount = Object.values(active).reduce((n, v) => n + (v?.length ?? 0), 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!groups.length && !onSearchChange && !(sortOptions && sortOptions.length)) return null;

  return (
    <div
      ref={ref}
      className="fb-bar"
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
        padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 14, background: "#fff", marginBottom: 26,
      }}
    >
      {/* Mobile-only toggle: the filters collapse behind this "Refine" button (Sort stays visible). */}
      <button
        type="button"
        className="fb-refine-toggle"
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800,
          padding: "8px 14px", borderRadius: 99,
          border: `1px solid ${activeCount ? "var(--accent)" : "var(--line)"}`,
          background: activeCount ? "color-mix(in oklab, var(--accent) 12%, #fff)" : "#fff",
          color: activeCount ? "var(--accent)" : "var(--ink)",
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Refine{activeCount ? ` (${activeCount})` : ""}
        <svg viewBox="0 0 12 8" width="9" height="6" aria-hidden="true" style={{ opacity: 0.55, transform: filtersOpen ? "rotate(180deg)" : "none", transition: "transform .25s" }}>
          <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="fb-label" style={{ fontFamily: "var(--font-archivo)", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent2)", padding: "0 6px" }}>
        Refine
      </span>
      <div className={`fb-groups${filtersOpen ? " open" : ""}`}>
      {onSearchChange && (
        <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 260 }}>
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products by name"
            style={{ width: "100%", padding: "8px 14px", borderRadius: 99, border: "1px solid var(--line)", background: "#fff", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", fontFamily: "inherit" }}
          />
        </div>
      )}
      {groups.map((g) => {
        const on = open === g.slug;
        const count = active[g.slug]?.length ?? 0;
        const activeHere = count > 0;
        return (
          <div key={g.slug} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen(on ? null : g.slug)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13.5, fontWeight: 700, padding: "8px 14px", borderRadius: 99,
                border: `1px solid ${activeHere || on ? "var(--accent)" : "var(--line)"}`,
                background: activeHere ? "color-mix(in oklab, var(--accent) 12%, #fff)" : "#fff",
                color: activeHere ? "var(--accent)" : "var(--ink)", transition: "all .2s ease",
              }}
            >
              {g.label}
              {activeHere ? ` (${count})` : ""}
              <svg viewBox="0 0 12 8" width="9" height="6" aria-hidden="true" style={{ opacity: 0.55, transform: on ? "rotate(180deg)" : "none", transition: "transform .25s" }}>
                <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {on && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 40,
                  // Hug the viewport so a right-aligned filter's panel never overflows a phone screen.
                  minWidth: "min(210px, calc(100vw - 32px))", maxWidth: "calc(100vw - 32px)", maxHeight: 340,
                  overflowY: "auto", padding: 8, borderRadius: 14, border: "1px solid var(--line)", background: "#fff",
                  boxShadow: "0 24px 50px -22px rgba(32,48,58,.4)",
                }}
              >
                {g.values.map((v) => {
                  const isOn = active[g.slug]?.includes(v.slug) ?? false;
                  return (
                    <button
                      key={v.slug}
                      type="button"
                      onClick={() => onToggle(g.slug, v.slug)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                        appearance: "none", cursor: "pointer", border: "none", padding: "8px 10px", borderRadius: 9,
                        fontFamily: "inherit", fontSize: 13.5, fontWeight: isOn ? 700 : 500,
                        color: isOn ? "var(--accent)" : "var(--ink)",
                        background: isOn ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "transparent",
                      }}
                    >
                      {v.hex && <span style={{ width: 14, height: 14, borderRadius: "50%", background: v.hex, border: "1px solid rgba(0,0,0,.15)", flexShrink: 0 }} />}
                      {v.size && <SizeGlyph w={v.size.w} h={v.size.h} />}
                      <span style={{ flex: 1 }}>{v.label}</span>
                      {isOn && (
                        <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
                          <path d="M2 7.5 L6 11 L12 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {hasActive && (
        <button type="button" onClick={onClearAll} className="fb-clear" style={{ appearance: "none", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "var(--accent)", padding: "0 6px" }}>
          Clear all ✕
        </button>
      )}
      </div>
      {sortOptions && sortOptions.length > 0 && onSortChange && (
        <label className="fb-sort" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#8a8577" }}>Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort"
            style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", background: "#fff", border: "1px solid var(--line)", borderRadius: 99, padding: "8px 30px 8px 13px", cursor: "pointer", appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 L6 6.5 L11 1.5' fill='none' stroke='%238a8577' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center" }}
          >
            {sortOptions.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
          </select>
        </label>
      )}
      <style>{`
        .fb-groups { display: contents; }
        @media (max-width: 640px) {
          .fb-label { display: none; }
          .fb-sort { order: 1; }
          .fb-groups { display: none; order: 2; flex-basis: 100%; flex-wrap: wrap; align-items: center; gap: 8px; }
          .fb-groups.open { display: flex; }
        }
        @media (min-width: 641px) { .fb-refine-toggle { display: none !important; } }
      `}</style>
    </div>
  );
}
