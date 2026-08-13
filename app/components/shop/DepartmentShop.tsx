"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Swatch, WebsiteRange } from "../../../lib/onbase/client";
import { ColourwayCard, EmptyCatalogue, InFocusPanel, RangeCard, SpecialsPanel } from "./shared";
import { FilterBar } from "./FilterBar";

type FilterGroupVM = { slug: string; label: string; values: { slug: string; label: string; hex?: string | null; size?: { w: number; h: number } | null }[] };

// How many cards to add each time (initial view + every "Load more").
const PER_PAGE = 24;

// Filter groups where ticking multiple values means "match ALL of them" (narrows),
// not "match any" - i.e. suitability/use filters. Everything else is OR.
const AND_GROUPS = new Set(["location-use", "location", "use", "suitability", "location-and-use"]);

// Client-side filtering: all department ranges are fetched once (server), then
// ticking a filter re-filters INSTANTLY in the browser - no navigation, no
// server round-trip. The URL is kept in sync (shareable) via replaceState so it
// never triggers a reload.
export function DepartmentShop({
  allRanges,
  groups,
  labelMap,
  initialActive,
  deptSlug,
  activeCategory,
  basePath = "/shop",
  galleryDept,
  renderCard,
  renderColourway,
}: {
  allRanges: WebsiteRange[];
  groups: FilterGroupVM[];
  labelMap: Record<string, string>;
  initialActive: Record<string, string[]>;
  deptSlug: string;
  activeCategory?: string;
  /** URL prefix for the shareable filter state (default the public shop). */
  basePath?: string;
  /** When set (tiles/stone on the public shop), show a "Search by inspiration"
   *  button that opens the gallery carrying the customer's current filters. */
  galleryDept?: "tiles" | "stone";
  /** Override the range/colourway cards (the trade portal renders priced,
   *  add-to-cart cards; the public shop uses the defaults). */
  renderCard?: (range: WebsiteRange) => ReactNode;
  renderColourway?: (range: WebsiteRange, swatch: Swatch) => ReactNode;
}) {
  const [active, setActive] = useState<Record<string, string[]>>(initialActive);
  const [search, setSearch] = useState("");
  // Load-more model: how many cards are visible. Grows by PER_PAGE; never resets
  // to "page 1" mid-scroll, so earlier products stay put for easy reference.
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  function syncUrl(a: Record<string, string[]>) {
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("c", activeCategory);
    for (const [g, vals] of Object.entries(a)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    if (typeof window !== "undefined") window.history.replaceState(null, "", `${basePath}/${deptSlug}${s ? `?${s}` : ""}`);
  }

  // Changing a filter/search starts the view fresh (back at the top of the list).
  const toggle = (group: string, value: string) =>
    setActive((prev) => {
      const cur = prev[group] ?? [];
      const nextVals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const next = { ...prev };
      if (nextVals.length) next[group] = nextVals;
      else delete next[group];
      syncUrl(next);
      return next;
    });

  const clearAll = () => { setActive({}); syncUrl({}); setVisibleCount(PER_PAGE); };
  const onSearch = (v: string) => { setSearch(v); setVisibleCount(PER_PAGE); };
  // Reset the visible window whenever the active filters change (toggle updates
  // `active`; keep the count reset out of the state updater so it always runs).
  const toggleAndReset = (group: string, value: string) => { toggle(group, value); setVisibleCount(PER_PAGE); };

  const hasActive = Object.values(active).some((v) => v.length);

  // Hand the customer's current filters to the gallery (?dept=&f=group:value),
  // so "Search by inspiration" opens a visual view of the same selection.
  const galleryHref = useMemo(() => {
    if (!galleryDept) return null;
    const qs = new URLSearchParams();
    qs.set("dept", galleryDept);
    for (const [g, vals] of Object.entries(active)) for (const v of vals) qs.append("f", `${g}:${v}`);
    return `/gallery?${qs.toString()}`;
  }, [galleryDept, active]);

  // AND across groups. Within a group: OR by default (colour beige OR grey), but
  // "suitability" groups (Location/Use) are AND - ticking Outdoor + Splashback means
  // "a tile that works in BOTH", which narrows instead of broadening.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRanges.filter((r) => {
      for (const [g, vals] of Object.entries(active)) {
        if (!vals.length) continue;
        const rv = r.filters?.[g] ?? [];
        const ok = AND_GROUPS.has(g) ? vals.every((v) => rv.includes(v)) : vals.some((v) => rv.includes(v));
        if (!ok) return false;
      }
      if (q && !(
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.swatches.some((s) => s.colour.toLowerCase().includes(q))
      )) return false;
      return true;
    });
  }, [allRanges, active, search]);

  // Per-colourway filter active -> explode into one card per matching colourway.
  const colourwaySel = Object.entries(active)
    .filter(([, vals]) => vals.length && filtered.some((r) => r.swatches.some((s) => (s.colours ?? []).some((c) => vals.includes(c)))))
    .flatMap(([, vals]) => vals);
  const colourways = colourwaySel.length
    ? filtered.flatMap((r) =>
        r.swatches
          .filter((s) => (s.colours ?? []).some((c) => colourwaySel.includes(c)))
          .map((s) => ({ range: r, swatch: s })),
      )
    : [];
  const exploded = colourwaySel.length > 0 && colourways.length > 0;

  // ── Back-button restore ─────────────────────────────────────────────────────
  // When a shopper opens a product and presses Back, return them to the exact
  // spot: how many they'd loaded, their text search, and the scroll position -
  // no reset to the top, no reload. State is keyed by the (filter-carrying) URL in
  // sessionStorage. Cards use a fixed aspect-ratio so page height is deterministic
  // before images finish loading, which makes scroll restoration land accurately.
  const firstSave = useRef(true);
  useEffect(() => {
    try {
      const key = "ows:" + window.location.pathname + window.location.search;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const s = JSON.parse(raw) as { count?: number; y?: number; search?: string };
        if (typeof s.search === "string" && s.search) setSearch(s.search);
        if (s.count && s.count > PER_PAGE) setVisibleCount(s.count);
        const y = s.y || 0;
        if (y > 0) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const key = "ows:" + window.location.pathname + window.location.search;
    const save = () => { try { sessionStorage.setItem(key, JSON.stringify({ count: visibleCount, y: window.scrollY, search })); } catch {} };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(save); };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Skip the very first run so it can't clobber a value we're about to restore.
    if (firstSave.current) firstSave.current = false; else save();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [visibleCount, search, active]);

  const total = exploded ? colourways.length : filtered.length;
  const shown = Math.min(visibleCount, total);
  const pagedRanges = exploded ? [] : filtered.slice(0, shown);
  const pagedColourways = exploded ? colourways.slice(0, shown) : [];

  // Active-filter chips ("Showing:") - a glance at what's applied, each removable.
  const activeChips = Object.entries(active).flatMap(([g, vals]) => {
    const grp = groups.find((x) => x.slug === g);
    return vals.map((v) => ({ g, v, groupLabel: grp?.label || g, valueLabel: grp?.values.find((x) => x.slug === v)?.label || labelMap[v] || v }));
  });

  // Feature panels (public shop only, normal grid): an "In focus" range and, if the
  // department has any special, a "Specials" feature - injected to break up the grid.
  const showFeatures = !renderCard && !exploded && pagedRanges.length >= 6;
  const focusRange = showFeatures ? filtered.filter((r) => r.swatches.some((s) => s.installedImage))[0] || null : null;
  const specialRange = showFeatures ? filtered.find((r) => (r.special || r.swatches.some((s) => s.special)) && r.id !== focusRange?.id) || null : null;

  return (
    <>
      <FilterBar groups={groups} active={active} onToggle={toggleAndReset} onClearAll={clearAll} search={search} onSearchChange={onSearch} />

      {activeChips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, margin: "0 0 20px" }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#8a8577" }}>Showing</span>
          {activeChips.map(({ g, v, groupLabel, valueLabel }) => (
            <button
              key={`${g}:${v}`}
              type="button"
              onClick={() => toggleAndReset(g, v)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 99, border: "1px solid var(--accent)", background: "color-mix(in oklab, var(--accent) 12%, #fff)", color: "var(--accent)" }}
            >
              <span style={{ opacity: 0.72, fontWeight: 600 }}>{groupLabel}:</span> {valueLabel}
              <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>✕</span>
            </button>
          ))}
          <button type="button" onClick={clearAll} style={{ appearance: "none", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#8a8577", textDecoration: "underline", padding: "0 4px" }}>Clear all</button>
        </div>
      )}

      {galleryHref && (
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "-4px 0 22px" }}>
          <Link
            href={galleryHref}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--ink)", color: "#fff6ee", fontWeight: 800, fontSize: 13.5, textDecoration: "none", padding: "10px 18px", borderRadius: 999 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
            Search by inspiration <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyCatalogue note={hasActive ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store." : undefined} />
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
            {exploded
              ? `Showing ${shown} of ${total} colourway${total === 1 ? "" : "s"} across ${filtered.length} product${filtered.length === 1 ? "" : "s"}.`
              : `Showing ${shown} of ${total} product${total === 1 ? "" : "s"}.`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {exploded
              ? pagedColourways.map(({ range, swatch }) => (
                  <Fragment key={`${range.id}-${swatch.colour}`}>
                    {renderColourway ? renderColourway(range, swatch) : <ColourwayCard range={range} swatch={swatch} />}
                  </Fragment>
                ))
              : pagedRanges.map((r, i) => (
                  <Fragment key={r.id}>
                    {renderCard ? renderCard(r) : <RangeCard range={r} categoryLabels={labelMap} />}
                    {showFeatures && i === 5 && focusRange && <InFocusPanel range={focusRange} />}
                    {showFeatures && i === 13 && specialRange && <SpecialsPanel range={specialRange} />}
                  </Fragment>
                ))}
          </div>
          {shown < total && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PER_PAGE)}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, color: "var(--ink)", background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: "13px 28px", boxShadow: "0 10px 30px -18px rgba(32,48,58,.3)" }}
              >
                Load more <span style={{ color: "#8a8577", fontWeight: 700 }}>({total - shown} more)</span>
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .ow-feature { grid-column: span 2; }
        @media (max-width: 560px) {
          .ow-feature { grid-column: 1 / -1; }
          .ow-featurecard { flex-direction: column; }
          .ow-featureimg { height: 180px; flex: 0 0 auto !important; }
        }
      `}</style>
    </>
  );
}
