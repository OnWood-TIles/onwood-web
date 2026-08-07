import type { MetadataRoute } from "next";
import { getBlog } from "../lib/onbase/client";

// Sitemap for onwoodtiles.com.au. During the coming-soon phase this lists only
// the publicly reachable + indexable pages (the ones allowlisted in proxy.ts):
// the home/splash, the blog + each published post, and the legal pages. When the
// full site goes live, add the shop/product/marketing routes here.
const BASE = "https://onwoodtiles.com.au";

// Re-read the blog periodically so new posts appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getBlog().catch(() => [])).filter((p) => p.published);

  const blogPosts: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/terms-of-sale`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms-of-use`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...blogPosts];
}
