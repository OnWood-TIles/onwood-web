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
import { unstable_cache } from "next/cache";
import { SPECIALS_ENABLED } from "../flags";

const BASE = process.env.ONBASE_API_URL || "https://onbasehq.com.au";
const KEY = process.env.ONBASE_API_KEY;

// Cache windows (seconds).
const TTL_CATALOGUE = 300;
// Stock-bearing reads (ranges list + single range). 30s was aggressive enough
// that a product page missed the Data Cache every half-minute and re-fetched the
// whole catalogue from OnBase on the click - the main source of "slow to open".
// 3 min keeps a public showroom's availability effectively live while letting the
// vast majority of clicks render straight from cache. (Trade ordering, where stock
// must be exact, uses lib/onbase/trade.ts - unaffected by this.)
const TTL_STOCK = 180;

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
  /** Standard retail price (GST incl.) shown when there is no special. null = hidden / none. */
  price?: number | null;
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
  /** Standard retail price (GST incl.); for a grouped range this is the lowest member ("from"). null = hidden / none. */
  price?: number | null;
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

// Supplier-hosted product photos (e.g. ABI on abiinteriors.com.au) are routed
// through our caching proxy (/api/img) so they are served from our own storage
// and survive the supplier moving/renaming files. Our own images (blob room
// shots, onbase uploads) are already self-hosted and pass through untouched.
const SUPPLIER_HOST = /^https:\/\/([a-z0-9-]+\.)?abiinteriors\.com\.au\//i;
const selfHost = (u?: string | null): string | null | undefined =>
  u && SUPPLIER_HOST.test(u) ? `https://onwoodtiles.com.au/api/img?u=${encodeURIComponent(u)}` : u;
const img = (u?: string | null) => selfHost(abs(u));

function normalizeRange(r: WebsiteRange): WebsiteRange {
  return {
    ...r,
    // Specials master switch: when off, strip every feed-driven special so no SPECIAL
    // badge/price renders anywhere (shop, product, search, pairs). Restores instantly
    // when SPECIALS_ENABLED flips back to true.
    special: SPECIALS_ENABLED ? r.special : null,
    heroImage: img(r.heroImage) ?? null,
    images: (r.images ?? []).map((i) => img(i) as string),
    swatches: (r.swatches ?? []).map((s) => ({
      ...s,
      special: SPECIALS_ENABLED ? s.special : null,
      image: img(s.image) ?? null,
      installedImage: img(s.installedImage) ?? null,
      images: s.images?.map((i) => img(i) as string),
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

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverCaption: string; // product credit shown on the hero
  coverLink: string; // product page the hero credit links to
  category: string;
  author: string;
  date: string; // ISO (published)
  updatedDate: string; // ISO last-updated (SEO dateModified); "" if never revised
  keywords: string; // comma-separated (SEO)
  body: string; // Markdown
  published: boolean;
  pinned?: boolean; // when true, this is the big featured post on /blog (a "pinned" post) regardless of date
};

/** Blog posts authored on the site's own /admin blog editor. */
export function getBlog(): Promise<BlogPost[]> {
  return onbaseGet<BlogPost[]>(
    "/api/v1/website/blog",
    { revalidate: TTL_CATALOGUE, tags: ["blog"] },
    [],
  ).then((p) => (Array.isArray(p) ? p : []));
}

/** Save all blog posts (server-to-server; called by the /admin API). WRITES fail closed. */
export async function saveBlog(posts: BlogPost[]): Promise<BlogPost[]> {
  if (!KEY) throw new Error("ONBASE_API_KEY not configured");
  const res = await fetch(`${BASE}/api/v1/website/blog`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ posts }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Blog save failed (${res.status})`);
  const json = (await res.json()) as { data?: BlogPost[] };
  return Array.isArray(json?.data) ? json.data : [];
}

// ── Product reviews ─────────────────────────────────────────────────────────
// Customer-facing reviews, moderated in OnBase (submissions land PENDING; only
// approved ones come back on the read). READ fails-open (an empty summary never
// breaks a product render); the WRITE fails closed (the API route needs to know
// whether the review was actually accepted so it can tell the customer).
export type ProductReview = {
  id: string;
  authorName: string;
  rating: number; // 1-5
  title: string | null;
  body: string;
  images: string[];
  verified: boolean;
  reply: string | null; // business reply, when set
  repliedAt: string | null; // ISO
  createdAt: string; // ISO
};

export type ReviewSummary = { reviews: ProductReview[]; average: number; count: number };

/** Approved reviews + aggregate for one product. Fails open to an empty summary. */
export function getReviews(productId: string): Promise<ReviewSummary> {
  const empty: ReviewSummary = { reviews: [], average: 0, count: 0 };
  return onbaseGet<ReviewSummary>(
    `/api/v1/website/reviews?productId=${encodeURIComponent(productId)}`,
    { revalidate: TTL_STOCK, tags: ["reviews", `reviews:${productId}`] },
    empty,
  ).then((r) =>
    r && Array.isArray(r.reviews)
      ? { reviews: r.reviews, average: Number(r.average) || 0, count: Number(r.count) || 0 }
      : empty,
  );
}

export type ReviewSubmission = {
  productId: string;
  authorName: string;
  authorEmail: string;
  rating: number; // 1-5
  title?: string;
  body: string;
  images?: string[]; // https urls
  orderRef?: string;
  ip?: string;
};

/** Submit a new (PENDING, moderated) review server-to-server. WRITES fail closed. */
export async function submitReview(payload: ReviewSubmission): Promise<{ id: string }> {
  if (!KEY) throw new Error("ONBASE_API_KEY not configured");
  const res = await fetch(`${BASE}/api/v1/website/reviews`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Review submit failed (${res.status})`);
  const json = (await res.json()) as { data?: { ok?: boolean; id?: string } };
  const id = json?.data?.id;
  if (!id) throw new Error("Review submit failed (no id returned)");
  return { id };
}

// ── Live presence ("visitors now") ─────────────────────────────────────────────

/** Record one visitor heartbeat in OnBase (server-to-server). Best-effort: a
 *  failed ping must never surface to the visitor, so all errors are swallowed. */
export async function pingPresence(sessionId: string, path?: string): Promise<void> {
  if (!KEY) return;
  try {
    await fetch(`${BASE}/api/v1/website/presence`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path }),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}

export type PresenceNow = { active: number; pages: { path: string; count: number }[] };

/** Live count of visitors on the site right now (last ~30s), for the staff
 *  /admin dashboard. Fails open to an empty snapshot. */
export async function getPresence(): Promise<PresenceNow> {
  const empty: PresenceNow = { active: 0, pages: [] };
  if (!KEY) return empty;
  try {
    const res = await fetch(`${BASE}/api/v1/website/presence`, {
      headers: { Authorization: `Bearer ${KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return empty;
    const json = (await res.json()) as { data?: PresenceNow };
    const d = json?.data;
    if (!d || typeof d.active !== "number") return empty;
    return { active: d.active, pages: Array.isArray(d.pages) ? d.pages : [] };
  } catch {
    return empty;
  }
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
  // Uncapped: the shop grid + mega-menu counts must show EVERY published product in a
  // department (no 100-item truncation - previously hid products past the first 100).
  qs.set("all", "1");
  return onbaseGet<WebsiteRange[]>(
    `/api/v1/website/ranges?${qs.toString()}`,
    { revalidate: TTL_STOCK, tags: ["ranges"] },
    [],
  ).then((ranges) => (Array.isArray(ranges) ? ranges.map(normalizeRange) : []));
}

/** Candidate ranges for the "Pairs well with" section - the whole catalogue, but
 *  cached far longer than the shop (pairing doesn't need live stock, and it's read
 *  on EVERY product open). A distinct cache key (`_ctx=pairs`, ignored by the feed)
 *  keeps it warm ~30min instead of rebuilding every 180s. Still busted by the
 *  "ranges" tag when a product is edited. */
export function listPairCandidates(): Promise<WebsiteRange[]> {
  return onbaseGet<WebsiteRange[]>(
    `/api/v1/website/ranges?limit=500&_ctx=pairs`,
    { revalidate: 1800, tags: ["ranges"] },
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
async function buildShopMenu(): Promise<ShopMenuDept[]> {
  const [taxonomy, ranges] = await Promise.all([getTaxonomy(), listRanges()]);
  // Menu counts reflect total colourways/variations across products (more
  // impressive + closer to the real number of options we sell), counting a
  // single-colour product as one.
  const varCount = (rs: WebsiteRange[]) => rs.reduce((n, r) => n + Math.max(1, r.swatches.length), 0);
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
      const focusCandidates = list
        .map((r) => {
          const installed = r.swatches[0]?.installedImage || r.swatches.find((s) => s.installedImage)?.installedImage || null;
          return installed ? { image: installed, slug: r.slug, name: r.name } : null;
        })
        .filter((x): x is { image: string; slug: string; name: string } => !!x);
      // Rotate the highlighted product daily (by day number) so the mega-menu
      // "in focus" tile varies over time instead of being stuck on one product.
      const focus = focusCandidates.length
        ? focusCandidates[Math.floor(Date.now() / 86_400_000) % focusCandidates.length]
        : null;
      const categories = d.categories
        .map((c) => ({ slug: c.slug, label: c.label, count: varCount(list.filter((r) => r.categories.includes(c.slug))) }))
        .filter((c) => c.count > 0);
      return {
        slug: d.slug,
        label: d.label,
        count: varCount(list),
        image,
        focusImage: focus?.image ?? null,
        focusSlug: focus?.slug ?? null,
        focusName: focus?.name ?? null,
        categories,
      };
    })
    .filter((d) => d.count > 0);
}

// Cached wrapper. The trade portal is `force-dynamic` (it needs the session
// cookie), which Next turns into `cache: no-store` for EVERY fetch in the segment
// - so getShopMenu's ~4.5s full-catalogue query re-ran on every trade navigation.
// unstable_cache is a separate RESULT cache that force-dynamic does NOT override,
// so the mega-menu is built at most once per TTL and shared by the public shop +
// trade portal. Busted on catalogue edits via the "ranges"/"taxonomy" tags
// (app/api/revalidate), so it never goes stale on a real change.
export const getShopMenu = unstable_cache(buildShopMenu, ["shop-menu"], {
  revalidate: TTL_CATALOGUE,
  tags: ["ranges", "taxonomy"],
});

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
// Cached for the same reason as getShopMenu: the trade footer + book page are
// force-dynamic, so without this the business lookup re-ran (~1s) on every load.
export const getBusiness = unstable_cache(
  (): Promise<Business | null> =>
    onbaseGet<Business | null>("/api/v1/business", { revalidate: TTL_CATALOGUE, tags: ["business"] }, null),
  ["business"],
  { revalidate: TTL_CATALOGUE, tags: ["business"] },
);
