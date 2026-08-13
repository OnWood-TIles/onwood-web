import type { MetadataRoute } from "next";

// Let search engines crawl the public pages and point them at the sitemap.
// Private/internal areas (trade portal, staff /admin, debug tools, APIs) stay out
// of search.
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
