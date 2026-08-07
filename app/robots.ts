import type { MetadataRoute } from "next";

// Let search engines crawl the public pages and point them at the sitemap.
// Private/internal areas stay out of search. (The still-gated marketing routes
// aren't linked publicly and aren't in the sitemap, so they won't be crawled
// until launch; the coming-soon splash they resolve to is intentionally indexable.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/trade/", "/admin", "/debug", "/kitchen-sink", "/api/"],
      },
    ],
    sitemap: "https://onwoodtiles.com.au/sitemap.xml",
    host: "https://onwoodtiles.com.au",
  };
}
