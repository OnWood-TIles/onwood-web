"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import type { Swatch, WebsiteRange } from "../../../lib/onbase/client";
import { ColourwayCard, EmptyCatalogue, RangeCard } from "./shared";
import { FilterBar } from "./FilterBar";

type FilterGroupVM = { slug: string; label: string; values: { slug: string; label: string; hex?: string | null; size?: { w: number; h: number } | null }[] };

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
  /** Override the range/colourway cards (the trade portal renders priced,
   *  add-to-cart cards; the public shop uses the defaults). */
  renderCard?: (range: WebsiteRange) => ReactNode;
  renderColourway?: (range: WebsiteRange, swatch: Swatch) => ReactNode;
}) {
  const [active, setActive] = useState<Record<string, string[]>>(initialActive);
  const [search, setSearch] = useState("");

  function syncUrl(a: Record<string, string[]>) {
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("c", activeCategory);
    for (const [g, vals] of Object.entries(a)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    if (typeof window !== "undefined") window.history.replaceState(null, "", `${basePath}/${deptSlug}${s ? `?${s}` : ""}`);
  }

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

  const clearAll = () => { setActive({}); syncUrl({}); };

  const hasActive = Object.values(active).some((v) => v.length);

  // AND across groups, OR within a group.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRanges.filter((r) => {
      for (const [g, vals] of Object.entries(active)) {
        if (!vals.length) continue;
        const rv = r.filters?.[g] ?? [];
        if (!vals.some((v) => rv.includes(v))) return false;
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
  // The per-colourway group (Colour for tiles, Metal for tapware) is whichever
  // active group's selected values live on the swatches themselves - detected
  // generically so any such filter explodes, not just "colour".
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

  return (
    <>
      <FilterBar groups={groups} active={active} onToggle={toggle} onClearAll={clearAll} search={search} onSearchChange={setSearch} />

      {filtered.length === 0 ? (
        <EmptyCatalogue note={hasActive ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store." : undefined} />
      ) : exploded ? (
        <>
          <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
            Showing every matching option - {colourways.length} colourway{colourways.length === 1 ? "" : "s"} across {filtered.length} product{filtered.length === 1 ? "" : "s"}.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {colourways.map(({ range, swatch }) => (
              <Fragment key={`${range.id}-${swatch.colour}`}>
                {renderColourway ? renderColourway(range, swatch) : <ColourwayCard range={range} swatch={swatch} />}
              </Fragment>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {filtered.map((r) => (
            <Fragment key={r.id}>
              {renderCard ? renderCard(r) : <RangeCard range={r} categoryLabels={labelMap} />}
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}
