"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Swatch, WebsiteRange } from "../../../lib/onbase/client";
import { ColourwayCard, EmptyCatalogue, RangeCard } from "./shared";
import { FilterBar } from "./FilterBar";

type FilterGroupVM = { slug: string; label: string; values: { slug: string; label: string; hex?: string | null; size?: { w: number; h: number } | null }[] };

const PER_PAGE = 24;

// Filter groups where ticking multiple values means "match ALL of them" (narrows),
// not "match any" - i.e. suitability/use filters. Everything else is OR.
const AND_GROUPS = new Set(["location-use", "location", "use", "suitability", "location-and-use"]);

// Windowed page list: 1 … 4 5 6 … 20
function pageWindow(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const lo = Math.max(2, cur - 1), hi = Math.min(total - 1, cur + 1);
  if (lo > 2) out.push("…");
  for (let p = lo; p <= hi; p++) out.push(p);
  if (hi < total - 1) out.push("…");
  out.push(total);
  return out;
}

function PageBtn({ children, onClick, active, disabled }: { children: ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 38, height: 38, padding: "0 12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        background: active ? "var(--accent)" : "#fff",
        color: active ? "#fff6ee" : disabled ? "#c3bfb4" : "var(--ink)",
        opacity: disabled ? 0.5 : 1,
        transition: "all .15s ease",
      }}
    >
      {children}
    </button>
  );
}

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
  const [page, setPage] = useState(1);

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

  // Reset to the first page whenever the filters or search change.
  useEffect(() => { setPage(1); }, [active, search]);

  // Paginate the CURRENT view (products, or colourways when exploded) so only a
  // page's worth of cards + images render at once - the rest stay in memory for
  // instant filtering, they just aren't painted until you page to them.
  const total = exploded ? colourways.length : filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PER_PAGE;
  const pagedRanges = filtered.slice(start, start + PER_PAGE);
  const pagedColourways = colourways.slice(start, start + PER_PAGE);
  const gotoPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <FilterBar groups={groups} active={active} onToggle={toggle} onClearAll={clearAll} search={search} onSearchChange={setSearch} />

      {filtered.length === 0 ? (
        <EmptyCatalogue note={hasActive ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store." : undefined} />
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
            {exploded
              ? `Showing ${start + 1}-${Math.min(start + PER_PAGE, total)} of ${total} colourway${total === 1 ? "" : "s"} across ${filtered.length} product${filtered.length === 1 ? "" : "s"}.`
              : `Showing ${start + 1}-${Math.min(start + PER_PAGE, total)} of ${total} product${total === 1 ? "" : "s"}.`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {exploded
              ? pagedColourways.map(({ range, swatch }) => (
                  <Fragment key={`${range.id}-${swatch.colour}`}>
                    {renderColourway ? renderColourway(range, swatch) : <ColourwayCard range={range} swatch={swatch} />}
                  </Fragment>
                ))
              : pagedRanges.map((r) => (
                  <Fragment key={r.id}>
                    {renderCard ? renderCard(r) : <RangeCard range={r} categoryLabels={labelMap} />}
                  </Fragment>
                ))}
          </div>
          {pageCount > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 34 }}>
              <PageBtn disabled={safePage <= 1} onClick={() => gotoPage(safePage - 1)}>Prev</PageBtn>
              {pageWindow(safePage, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} style={{ color: "#8a8577", padding: "0 4px" }}>…</span>
                ) : (
                  <PageBtn key={p} active={p === safePage} onClick={() => gotoPage(p as number)}>{p}</PageBtn>
                ),
              )}
              <PageBtn disabled={safePage >= pageCount} onClick={() => gotoPage(safePage + 1)}>Next</PageBtn>
            </div>
          )}
        </>
      )}
    </>
  );
}
