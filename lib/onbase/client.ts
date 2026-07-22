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

export type PriceDisplayGst = "NO_GST" | "INCLUDE_GST" | "EXCLUDE_GST";

// Per-swatch trade pricing (present ONLY on the authenticated trade feed, never
// the public shop). Carries the sold-unit maths the cart needs (box multiples).
export type TradeSwatchInfo = {
  productId: string;
  rrpPrice: number; // struck-through RRP
  tradePrice: number | null; // "Your Price"; null = not priced (browse-only)
  priceLevel: string | null;
  priceDisplayGst: PriceDisplayGst;
  boxQuantity: number; // order qty snaps up to whole multiples of this
  coverageM2: number | null; // m² one sold unit covers
  unit: string; // sold unit (m², LM, Per Unit…)
};

export type Swatch = {
  colour: string;
  swatchHex?: string | null;
  image?: string | null;
  /** "See it installed" room photo for this colour, when the tenant added one. */
  installedImage?: string | null;
  images?: string[];
  description?: string | null;
  availability: Availability;
  qty?: number;
  special?: { price: number | null; was: number | null } | null;
  /** Overlay the brand logo on the primary product photo / the secondary
   *  "see it installed" photo (independent). */
  watermarkPrimary?: boolean;
  watermarkSecondary?: boolean;
  /** Range-member swatches: the member's own page slug when it has one. */
  slug?: string | null;
  /** Colour-filter value slugs this colourway answers to. */
  colours?: string[];
  /** The product this swatch orders (trade feed only). */
  productId?: string;
  /** This swatch's trade pricing (trade feed only; absent on the public shop). */
  trade?: TradeSwatchInfo | null;
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
  /** Sold unit (m², LM, Per Unit…) and, for per-sheet goods, the m² one unit
   *  covers - drives "sold per sheet · ~11 per m²" copy on the product page. */
  unit?: string | null;
  coverageM2?: number | null;
  heroImage?: string | null;
  images: string[];
  special?: { price: number | null; was: number | null } | null;
  /** Overlay the brand logo on the range hero (primary) / installed (secondary). */
  watermarkPrimary?: boolean;
  watermarkSecondary?: boolean;
  availability: Availability;
  swatches: Swatch[];
  /** Downloadable documents (fire ratings, warranties, install guides…). */
  documents?: { name: string; type: string | null; url: string; isExternal: boolean }[];
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
      installedImage: abs(s.installedImage) ?? null,
      images: s.images?.map((i) => abs(i) as string),
    })),
    documents: (r.documents ?? []).map((d) => ({ ...d, url: abs(d.url) as string })),
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

// ── Shop mega-menu ──────────────────────────────────────────────────────────
export type ShopMenuCategory = { slug: string; label: string; count: number };
export type ShopMenuDept = {
  slug: string;
  label: string;
  count: number;
  image: string | null;
  /** "In focus" featured product: its SECONDARY ("see it installed") photo, the
   *  product name, and the slug to link straight to it. Null when no product in
   *  the department has an installed photo yet. */
  focusImage: string | null;
  focusSlug: string | null;
  focusName: string | null;
  categories: ShopMenuCategory[];
};

/** Departments (with live product counts, a preview image and their populated
 *  sub-categories) that drive the Shop mega-menu. Built from the taxonomy plus
 *  the range feed so counts and imagery always reflect what is published. */
export async function getShopMenu(): Promise<ShopMenuDept[]> {
  const [taxonomy, ranges] = await Promise.all([getTaxonomy(), listRanges()]);
  const byDept = new Map<string, WebsiteRange[]>();
  for (const r of ranges) {
    const key = r.department || "other";
    const list = byDept.get(key);
    if (list) list.push(r);
    else byDept.set(key, [r]);
  }
  return taxonomy
    .map((d) => {
      const list = byDept.get(d.slug) ?? [];
      const image =
        list.map((r) => r.heroImage || r.swatches.find((s) => s.image)?.image || null).find(Boolean) ?? null;
      // "In focus" features a real product using ONLY its secondary ("see it
      // installed") photo, linking straight to that product. Pick the first
      // product in the department that has an installed photo.
      const focus =
        list
          .map((r) => {
            const installed = r.swatches[0]?.installedImage || r.swatches.find((s) => s.installedImage)?.installedImage || null;
            return installed ? { image: installed, slug: r.slug, name: r.name } : null;
          })
          .find(Boolean) ?? null;
      const categories = d.categories
        .map((c) => ({ slug: c.slug, label: c.label, count: list.filter((r) => r.categories.includes(c.slug)).length }))
        .filter((c) => c.count > 0);
      return {
        slug: d.slug,
        label: d.label,
        count: list.length,
        image,
        focusImage: focus?.image ?? null,
        focusSlug: focus?.slug ?? null,
        focusName: focus?.name ?? null,
        categories,
      };
    })
    .filter((d) => d.count > 0);
}

// ── Business info + structured opening hours ─────────────────────────────────
export type DayHours = { day: string; closed: boolean; open: string; close: string };
export type Business = {
  businessName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  openHours: DayHours[];
  openHoursSummary: string;
};

/** Business name/contact/address + structured opening hours (drives the footer,
 *  showroom panels and the Book-a-Visit page's available times). */
export function getBusiness(): Promise<Business | null> {
  return onbaseGet<Business | null>("/api/v1/business", { revalidate: TTL_CATALOGUE, tags: ["business"] }, null);
}
