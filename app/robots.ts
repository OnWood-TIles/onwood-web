import type { MetadataRoute } from "next";

// Bulk AI-training / scraper crawlers that add crawl cost but no search or referral
// value. Blocking these does NOT affect Google Search: "Google-Extended" only
// controls Gemini/AI training, NOT Googlebot (the search crawler), which stays
// allowed via the "*" rule. Answer engines that can send real visitors
// (PerplexityBot, OAI-SearchBot, ChatGPT-User) are deliberately left allowed.
const AI_SCRAPERS = [
  "GPTBot",              // OpenAI model training
  "CCBot",              // Common Crawl (feeds many AI datasets, high volume)
  "Google-Extended",    // Google AI training only — does NOT affect Google Search
  "Applebot-Extended",  // Apple AI training only — does NOT affect Applebot search
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Bytespider",         // ByteDance — notoriously aggressive
  "Amazonbot",
  "meta-externalagent", // Meta AI (NOT facebookexternalhit — link previews stay allowed)
  "Diffbot",
  "Omgilibot",
  "ImagesiftBot",
  "cohere-ai",
  "Timpibot",
];

// Let search engines crawl the public pages and point them at the sitemap.
// Private/internal areas (trade portal, staff /admin, debug tools, APIs) stay out
// of search. Bulk AI scrapers get a blanket disallow.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/trade/", "/admin", "/debug", "/kitchen-sink", "/api/"],
      },
      {
        userAgent: AI_SCRAPERS,
        disallow: "/",
      },
    ],
    sitemap: "https://onwoodtiles.com.au/sitemap.xml",
    host: "https://onwoodtiles.com.au",
  };
}
