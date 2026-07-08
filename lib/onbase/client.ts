// Server-only client for OnBase's public API. Reads the curated Website
// Catalogue (products/stock/ranges) server-to-server via a Bearer API key.
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

export type Swatch = {
  colour: string;
  code?: string;
  swatchHex?: string;
  image?: string;
  description?: string;
  availability?: "in-stock" | "low" | "out";
};

export type WebsiteRange = {
  slug: string;
  name: string;
  category?: string;
  description?: string;
  specs?: Record<string, string>;
  heroImage?: string;
  swatches: Swatch[];
};

type FetchOpts = { revalidate: number; tags?: string[] };

async function onbaseGet<T>(
  path: string,
  opts: FetchOpts,
  fallback: T,
): Promise<T> {
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
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[onbase] GET ${path} failed:`, err);
    return fallback;
  }
}

// --- Website Catalogue reads (endpoints land with the OnBase-side feature) ---

export function listRanges(): Promise<WebsiteRange[]> {
  return onbaseGet<WebsiteRange[]>(
    "/api/v1/website/ranges",
    { revalidate: TTL_CATALOGUE, tags: ["ranges"] },
    [],
  );
}

export function getRange(slug: string): Promise<WebsiteRange | null> {
  return onbaseGet<WebsiteRange | null>(
    `/api/v1/website/ranges/${encodeURIComponent(slug)}`,
    { revalidate: TTL_STOCK, tags: ["ranges", `range:${slug}`] },
    null,
  );
}
