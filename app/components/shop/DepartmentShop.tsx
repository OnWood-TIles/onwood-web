"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Swatch, WebsiteRange } from "../../../lib/onbase/client";
import { ColourwayCard, EmptyCatalogue, InFocusPanel, RangeCard, SpecialsPanel } from "./shared";
import { FilterBar } from "./FilterBar";

type FilterGroupVM = { slug: string; label: string; values: { slug: string; label: string; hex?: string | null; size?: { w: number; h: number } | null }[] };

const PER_PAGE = 24;
// The public shop inserts a feature panel roughly every N product cards.
const FEATURE_EVERY = 12;

// Filter groups where ticking multiple values means "match ALL of them" (narrows),
// not "match any" - i.e. suitability/use filters. Everything else is OR.
const AND_GROUPS = new Set(["location-use", "location", "use", "suitability", "location-and-use"]);

// Effective customer-facing price for sorting/filtering: the special price when on
// special, else the standard price. A range takes its LOWEST colourway price ("from"),
// falling back to any range-level price. null = no price shown (sorts last).
const swatchPrice = (s: Swatch): number | null => s.special?.price ?? s.price ?? null;
function rangePrice(r: WebsiteRange): number | null {
  const ps = r.swatches.map(swatchPrice).filter((x): x is number => x != null);
  if (ps.length) return Math.min(...ps);
  return r.special?.price ?? r.price ?? null;
}
const PRICE_BANDS: { key: string; label: string; min: number; max: number }[] = [
  { key: "u30", label: "Under $30", min: 0, max: 30 },
  { key: "30-50", label: "$30 to $50", min: 30, max: 50 },
  { key: "50-80", label: "$50 to $80", min: 50, max: 80 },
  { key: "80up", label: "$80 and up", min: 80, max: Infinity },
];
const SORTS: { key: string; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name: A to Z" },
];

// "Price" rendered as a filter group so it lives inside the Refine bar with the others.
const PRICE_GROUP = { slug: "price", label: "Price", values: PRICE_BANDS.map((b) => ({ slug: b.key, label: b.label })) };

// Windowed page list for the trade portal's classic pagination: 1 … 4 5 6 … 20
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
    <button onClick={onClick} disabled={disabled} style={{ minWidth: 38, height: 38, padding: "0 12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`, background: active ? "var(--accent)" : "#fff", color: active ? "#fff6ee" : disabled ? "#c3bfb4" : "var(--ink)", opacity: disabled ? 0.5 : 1, transition: "all .15s ease" }}>
      {children}
    </button>
  );
}

// Client-side filtering: all department ranges are fetched once (server), then
// ticking a filter re-filters INSTANTLY in the browser. The URL stays in sync
// (shareable) via replaceState so it never triggers a reload.
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
  /** The trade portal passes its own priced add-to-order cards; the public shop
   *  uses the defaults. This ALSO flags the two experiences apart: the public
   *  shop gets load-more + back-restore + feature panels; the trade portal keeps
   *  its classic paginated grid, unchanged. */
  renderCard?: (range: WebsiteRange) => ReactNode;
  renderColourway?: (range: WebsiteRange, swatch: Swatch) => ReactNode;
}) {
  const isPublic = !renderCard;

  const [active, setActive] = useState<Record<string, string[]>>(initialActive);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // trade: classic pagination
  const [visibleCount, setVisibleCount] = useState(PER_PAGE); // public: load-more
  const [sort, setSort] = useState("featured"); // Featured (as-loaded) | price | name
  const [priceBands, setPriceBands] = useState<string[]>([]); // selected price bands (OR)

  const resetPager = () => { setPage(1); setVisibleCount(PER_PAGE); };

  function syncUrl(a: Record<string, string[]>) {
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("c", activeCategory);
    for (const [g, vals] of Object.entries(a)) for (const v of vals) qs.append("f", `${g}:${v}`);
    const s = qs.toString();
    if (typeof window !== "undefined") window.history.replaceState(null, "", `${basePath}/${deptSlug}${s ? `?${s}` : ""}`);
  }

  const toggle = (group: string, value: string) => {
    setActive((prev) => {
      const cur = prev[group] ?? [];
      const nextVals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      const next = { ...prev };
      if (nextVals.length) next[group] = nextVals;
      else delete next[group];
      syncUrl(next);
      return next;
    });
    resetPager();
  };
  const clearAll = () => { setActive({}); setPriceBands([]); syncUrl({}); resetPager(); };
  const onSearch = (v: string) => { setSearch(v); resetPager(); };
  const togglePriceBand = (k: string) => {
    setPriceBands((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
    resetPager();
  };
  const onSort = (v: string) => { setSort(v); resetPager(); };

  const hasActive = Object.values(active).some((v) => v.length) || priceBands.length > 0;

  // AND across groups. Within a group: OR by default, but "suitability" groups
  // (Location/Use) are AND - ticking Outdoor + Splashback means "works in BOTH".
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
      if (priceBands.length) {
        const p = rangePrice(r);
        if (p == null) return false; // hidden/no-price tiles drop out once a band is picked
        const inAny = priceBands.some((k) => { const b = PRICE_BANDS.find((x) => x.key === k); return !!b && p >= b.min && p < b.max; });
        if (!inAny) return false;
      }
      return true;
    });
  }, [allRanges, active, search, priceBands]);

  // Sort the filtered list. "Featured" keeps the server order (curated + specials).
  // Price sorts on the effective "from" price; no-price ranges fall to the end.
  const sorted = useMemo(() => {
    if (sort === "featured") return filtered;
    const arr = [...filtered];
    if (sort === "name") { arr.sort((a, b) => a.name.localeCompare(b.name)); return arr; }
    arr.sort((a, b) => {
      const pa = rangePrice(a), pb = rangePrice(b);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return sort === "price-asc" ? pa - pb : pb - pa;
    });
    return arr;
  }, [filtered, sort]);

  // Per-colourway filter active -> explode into one card per matching colourway.
  const colourwaySel = Object.entries(active)
    .filter(([, vals]) => vals.length && filtered.some((r) => r.swatches.some((s) => (s.colours ?? []).some((c) => vals.includes(c)))))
    .flatMap(([, vals]) => vals);
  const colourways = colourwaySel.length
    ? sorted.flatMap((r) =>
        r.swatches
          .filter((s) => (s.colours ?? []).some((c) => colourwaySel.includes(c)))
          .map((s) => ({ range: r, swatch: s })),
      )
    : [];
  const exploded = colourwaySel.length > 0 && colourways.length > 0;

  // ── Back-button restore (PUBLIC shop only) ──────────────────────────────────
  // Open a product, press Back, and land in the exact spot: loaded count, text
  // search and scroll position - no reset, no reload. Keyed by the filter-carrying
  // URL in sessionStorage. Cards use a fixed aspect-ratio so page height is
  // deterministic before images load, which makes scroll restoration land right.
  const firstSave = useRef(true);
  useEffect(() => {
    if (!isPublic) return;
    try {
      const key = "ows:" + window.location.pathname + window.location.search;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const s = JSON.parse(raw) as { count?: number; y?: number; search?: string; sort?: string; priceBands?: string[] };
        if (typeof s.search === "string" && s.search) setSearch(s.search);
        if (s.count && s.count > PER_PAGE) setVisibleCount(s.count);
        if (typeof s.sort === "string") setSort(s.sort);
        if (Array.isArray(s.priceBands)) setPriceBands(s.priceBands);
        const y = s.y || 0;
        if (y > 0) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!isPublic) return;
    const key = "ows:" + window.location.pathname + window.location.search;
    const save = () => { try { sessionStorage.setItem(key, JSON.stringify({ count: visibleCount, y: window.scrollY, search, sort, priceBands })); } catch {} };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(save); };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (firstSave.current) firstSave.current = false; else save();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [isPublic, visibleCount, search, active, sort, priceBands]);

  const total = exploded ? colourways.length : filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const sliceStart = isPublic ? 0 : (safePage - 1) * PER_PAGE;
  const sliceEnd = isPublic ? Math.min(visibleCount, total) : sliceStart + PER_PAGE;
  const pagedRanges = exploded ? [] : sorted.slice(sliceStart, sliceEnd);
  const pagedColourways = exploded ? colourways.slice(sliceStart, sliceEnd) : [];
  const gotoPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), pageCount));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Feature panels (public shop only): recur through the grid, cycling the pools
  // so specials + featured ranges keep appearing as you load more, not just once.
  const showFeatures = isPublic && !exploded && pagedRanges.length >= 6;
  const focusPool = showFeatures ? sorted.filter((r) => r.swatches.some((s) => s.installedImage)) : [];
  const specialPool = showFeatures ? sorted.filter((r) => r.special || r.swatches.some((s) => s.special)) : [];

  const gridItems: ReactNode[] = [];
  if (!exploded) {
    let feat = 0;
    pagedRanges.forEach((r, i) => {
      gridItems.push(
        <Fragment key={r.id}>{renderCard ? renderCard(r) : <RangeCard range={r} categoryLabels={labelMap} />}</Fragment>,
      );
      if (showFeatures && (i + 1) % FEATURE_EVERY === 0) {
        const wantSpecial = specialPool.length > 0 && (feat % 2 === 1 || focusPool.length === 0);
        if (wantSpecial) {
          gridItems.push(<SpecialsPanel key={`sp-${i}`} range={specialPool[Math.floor(feat / 2) % specialPool.length]} />);
        } else if (focusPool.length) {
          gridItems.push(<InFocusPanel key={`fo-${i}`} range={focusPool[Math.floor(feat / 2) % focusPool.length]} />);
        }
        feat++;
      }
    });
  }

  const shownLabel = isPublic ? `${sliceEnd}` : `${sliceStart + 1}-${Math.min(sliceEnd, total)}`;

  return (
    <>
      <FilterBar
        groups={isPublic ? [...groups, PRICE_GROUP] : groups}
        active={isPublic && priceBands.length ? { ...active, price: priceBands } : active}
        onToggle={isPublic ? (g, v) => (g === "price" ? togglePriceBand(v) : toggle(g, v)) : toggle}
        onClearAll={clearAll}
        search={search}
        onSearchChange={onSearch}
        {...(isPublic ? { sort, sortOptions: SORTS, onSortChange: onSort } : {})}
      />

      {filtered.length === 0 ? (
        <EmptyCatalogue note={hasActive ? "Nothing matches those filters just yet. Try clearing a filter or two, or visit the showroom - the full range is in store." : undefined} />
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#8a8577", margin: "0 0 14px" }}>
            {exploded
              ? `Showing ${shownLabel} of ${total} colourway${total === 1 ? "" : "s"} across ${filtered.length} product${filtered.length === 1 ? "" : "s"}.`
              : `Showing ${shownLabel} of ${total} product${total === 1 ? "" : "s"}.`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {exploded
              ? pagedColourways.map(({ range, swatch }) => (
                  <Fragment key={`${range.id}-${swatch.colour}`}>
                    {renderColourway ? renderColourway(range, swatch) : <ColourwayCard range={range} swatch={swatch} />}
                  </Fragment>
                ))
              : gridItems}
          </div>

          {/* PUBLIC: load-more. */}
          {isPublic && sliceEnd < total && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PER_PAGE)}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, color: "var(--ink)", background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: "13px 28px", boxShadow: "0 10px 30px -18px rgba(32,48,58,.3)" }}
              >
                Load more <span style={{ color: "#8a8577", fontWeight: 700 }}>({total - sliceEnd} more)</span>
              </button>
            </div>
          )}

          {/* TRADE: classic pagination. */}
          {!isPublic && pageCount > 1 && (
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
