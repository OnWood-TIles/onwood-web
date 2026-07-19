"use client";

import { useMemo, useState } from "react";
import type { WebsiteRange } from "../../../lib/onbase/client";
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
}: {
  allRanges: WebsiteRange[];
  groups: FilterGroupVM[];
  labelMap: Record<string, string>;
  initialActive: Record<string, string[]>;
  deptSlug: string;
  activeCategory?: string;
}) {
  const [active, setActive] = useState<Record<string, string[]>>(initialActive);

  function syncUrl(a: Record<string, string[]>) {
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("c", activeCategory);
    for (const [g, vals] of Object.entries(a)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    if (typeof window !== "undefined") window.history.replaceState(null, "", `/shop/${deptSlug}${s ? `?${s}` : ""}`);
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
  const filtered = useMemo(
    () =>
      allRanges.filter((r) => {
        for (const [g, vals] of Object.entries(active)) {
          if (!vals.length) continue;
          const rv = r.filters?.[g] ?? [];
          if (!vals.some((v) => rv.includes(v))) return false;
        }
        return true;
      }),
    [allRanges, active],
  );

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
      <FilterBar groups={groups} active={active} onToggle={toggle} onClearAll={clearAll} />

      {filtered.length === 0 ? (
        <EmptyCatalogue note={hasActive ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store." : undefined} />
      ) : exploded ? (
        <>
          <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
            Showing every matching option - {colourways.length} colourway{colourways.length === 1 ? "" : "s"} across {filtered.length} product{filtered.length === 1 ? "" : "s"}.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {colourways.map(({ range, swatch }) => (
              <ColourwayCard key={`${range.id}-${swatch.colour}`} range={range} swatch={swatch} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {filtered.map((r) => (
            <RangeCard key={r.id} range={r} categoryLabels={labelMap} />
          ))}
        </div>
      )}
    </>
  );
}
