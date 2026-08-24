import type { MetadataRoute } from "next";
import { getBlog, getTaxonomy, listRanges } from "../lib/onbase/client";
import { SUBURB_LIST, COLLECTION_LIST } from "../lib/content";
import { SPECIALS_ENABLED } from "../lib/flags";

// Sitemap for onwoodtiles.com.au. Now that the site is LIVE this lists the full
// public + indexable storefront: the marketing/utility pages, the blog + each
// published post, the legal pages, every shop department, and every product.
// (Gated/internal areas — /trade, /admin, /debug, /kitchen-sink, /api — are kept
// out; they're disallowed in robots.ts and gated in proxy.ts.)
const BASE = "https://onwoodtiles.com.au";

// Re-read the catalogue + blog periodically so new products/departments/posts
// appear in the sitemap without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Remote reads fail-open: a fetch hiccup degrades to an empty group rather
  // than throwing out of the whole sitemap.
  const [posts, departments, ranges] = await Promise.all([
    getBlog().catch(() => []),
    getTaxonomy().catch(() => []),
    listRanges().catch(() => []),
  ]);

  const blogPosts: MetadataRoute.Sitemap = posts
    .filter((p) => p.published)
    .map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // One page per shop department (/shop/[department]) - only departments that
  // actually have published products. Listing empty departments would submit
  // thin/empty pages to Google (the mega-menu filters the same way).
  const activeDeptSlugs = new Set(ranges.map((r) => r.department).filter(Boolean));
  const departmentPages: MetadataRoute.Sitemap = departments
    .filter((d) => activeDeptSlugs.has(d.slug))
    .map((d) => ({
      url: `${BASE}/shop/${d.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // One page per product/range (/product/[slug]). De-dupe slugs defensively.
  const productPages: MetadataRoute.Sitemap = Array.from(
    new Set(ranges.map((r) => r.slug).filter(Boolean)),
  ).map((slug) => ({
    url: `${BASE}/product/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...(SPECIALS_ENABLED
      ? [{ url: `${BASE}/specials`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    { url: `${BASE}/showroom`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/vision-board`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/gallery`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/tiles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/sunshine-coast`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tile-shops-near-me`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tile-shop`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/magazine`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/why`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/book`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/calculator`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/terms-of-sale`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms-of-use`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // One page per serviced suburb (/tile-shop/[suburb]).
  const suburbPages: MetadataRoute.Sitemap = SUBURB_LIST.map((s) => ({
    url: `${BASE}/tile-shop/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // One page per tile collection (/tiles/[collection]).
  const collectionPages: MetadataRoute.Sitemap = COLLECTION_LIST.map((c) => ({
    url: `${BASE}/tiles/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...departmentPages,
    ...productPages,
    ...suburbPages,
    ...collectionPages,
    ...blogPosts,
  ];
}
