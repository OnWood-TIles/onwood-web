// Server-only client for OnBase's public Website Catalogue API. Reads the
// curated catalogue (ranges/products/stock buckets/taxonomy) server-to-server
// via a Bearer API key.
//
// Design rules (from the build plan + red-team):
//   - Server-only: the key never reaches the browser.
//   - READS fail-open: a hiccup returns empty/last-known, never throws into a
//     page render. (WRITES, added in Phase 6, will fail CLOSED.)
//   - Next 16 caching is explicit via next.revalidate + tags (fetch is not
//     cached by default in 16). Stock uses a short TTL; catalogue a longer one.
import "server-only";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

// Cache windows (seconds).
const TTL_CATALOGUE = 300;
const TTL_STOCK = 30;

// ── Shapes (mirror OnBase lib/websiteFeed.ts + /api/v1/website/taxonomy) ─────
export type Availability = "in_stock" | "low" | "out";

export type Swatch = {
  colour: string;
  swatchHex?: string | null;
  image?: string | null;
  images?: string[];
  description?: string | null;
  availability: Availability;
  qty?: number;
  special?: { price: number | null; was: number | null } | null;
  /** Range-member swatches: the member's own page slug when it has one. */
  slug?: string | null;
  /** Colour-filter value slugs this colourway answers to. */
  colours?: string[];
};

export type WebsiteRange = {
  id: string; // opaque rng_/prod_
  slug: string;
  name: string;
  department?: string | null;
  categories: string[];
  /** Ticked filter values by group slug (union across a range's members). */
  filters?: Record<string, string[]>;
  description?: string | null;
  specs: { label: string; value: string }[];
  heroImage?: string | null;
  images: string[];
  special?: { price: number | null; was: number | null } | null;
  availability: Availability;
  swatches: Swatch[];
};

export type WebsiteCategory = { slug: string; label: string };
export type WebsiteDepartment = { slug: string; label: string; categories: WebsiteCategory[] };
export type FilterValue = { slug: string; label: string };
export type FilterGroup = { slug: string; label: string; values: FilterValue[]; departments?: string[] };
export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href?: string; children?: NavChild[] };

type FetchOpts = { revalidate: number; tags?: string[] };

async function onbaseGet<T>(path: string, opts: FetchOpts, fallback: T): Promise<T> {
  if (!KEY) {
    console.error(`[onbase] ONBASE_API_KEY not set - skipping GET ${path}`);
    return fallback;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: opts.revalidate, tags: opts.tags },
    });
    if (!res.ok) {
      console.error(`[onbase] GET ${path} -> ${res.status}`);
      return fallback;
    }
    // The read API wraps lists in { data, meta }; single resources are bare.
    // Unwrap defensively so a shape change can never crash a page render.
    const json = await res.json();
    const payload =
      json && typeof json === "object" && "data" in json ? (json as { data: unknown }).data : json;
    return (payload ?? fallback) as T;
  } catch (err) {
    console.error(`[onbase] GET ${path} failed:`, err);
    return fallback;
  }
}

// OnBase local-dev uploads come back as relative "/uploads/..." paths -
// absolutize against the API origin so <img> works from the website.
const abs = (u?: string | null): string | null | undefined =>
  u && u.startsWith("/") ? `${BASE}${u}` : u;

function normalizeRange(r: WebsiteRange): WebsiteRange {
  return {
    ...r,
    heroImage: abs(r.heroImage) ?? null,
    images: (r.images ?? []).map((i) => abs(i) as string),
    swatches: (r.swatches ?? []).map((s) => ({
      ...s,
      image: abs(s.image) ?? null,
      images: s.images?.map((i) => abs(i) as string),
    })),
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/** The tenant's storefront taxonomy - drives the shop navigation. */
export function getTaxonomy(): Promise<WebsiteDepartment[]> {
  return onbaseGet<WebsiteDepartment[]>(
    "/api/v1/website/taxonomy",
    { revalidate: TTL_CATALOGUE, tags: ["taxonomy"] },
    [],
  );
}

/** The tenant's filter groups (the taxonomy endpoint carries them beside `data`). */
export async function getFilterGroups(): Promise<FilterGroup[]> {
  if (!KEY) return [];
  try {
    const res = await fetch(`${BASE}/api/v1/website/taxonomy`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: TTL_CATALOGUE, tags: ["taxonomy"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { filters?: unknown };
    return Array.isArray(json?.filters) ? (json.filters as FilterGroup[]) : [];
  } catch (err) {
    console.error("[onbase] GET taxonomy filters failed:", err);
    return [];
  }
}

/** The storefront navigation designed on /admin. Empty = use the built-in nav. */
export function getNav(): Promise<NavItem[]> {
  return onbaseGet<NavItem[]>(
    "/api/v1/website/nav",
    { revalidate: TTL_CATALOGUE, tags: ["nav"] },
    [],
  ).then((items) => (Array.isArray(items) ? items : []));
}

/** Save the navigation design (server-to-server; called by the /admin API). WRITES fail closed. */
export async function saveNav(items: NavItem[]): Promise<NavItem[]> {
  if (!KEY) throw new Error("ONBASE_API_KEY not configured");
  const res = await fetch(`${BASE}/api/v1/website/nav`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Nav save failed (${res.status})`);
  const json = (await res.json()) as { data?: NavItem[] };
  return Array.isArray(json?.data) ? json.data : [];
}

/** Published ranges, optionally narrowed by department/category/specials and
 *  attribute filters ({ colour: ["green"] } -> ?f=colour:green; OR within a
 *  group, AND across groups). */
export function listRanges(params?: {
  department?: string;
  category?: string;
  specialsOnly?: boolean;
  filters?: Record<string, string[]>;
}): Promise<WebsiteRange[]> {
  const qs = new URLSearchParams();
  if (params?.department) qs.set("department", params.department);
  if (params?.category) qs.set("category", params.category);
  if (params?.specialsOnly) qs.set("specialsOnly", "1");
  for (const [group, vals] of Object.entries(params?.filters ?? {}))
    for (const v of vals) qs.append("f", `${group}:${v}`);
  qs.set("limit", "100");
  return onbaseGet<WebsiteRange[]>(
    `/api/v1/website/ranges?${qs.toString()}`,
    { revalidate: TTL_STOCK, tags: ["ranges"] },
    [],
  ).then((ranges) => (Array.isArray(ranges) ? ranges.map(normalizeRange) : []));
}

/** One range (or standalone product) by slug. */
export function getRange(slug: string): Promise<WebsiteRange | null> {
  return onbaseGet<WebsiteRange | null>(
    `/api/v1/website/ranges/${encodeURIComponent(slug)}`,
    { revalidate: TTL_STOCK, tags: ["ranges", `range:${slug}`] },
    null,
  ).then((r) => (r ? normalizeRange(r) : null));
}
