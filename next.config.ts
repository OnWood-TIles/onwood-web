import type { NextConfig } from "next";
import { cspHeaders } from "./lib/csp";

const nextConfig: NextConfig = {
  images: {
    // Next's built-in optimizer stays off (its per-host allowlist 400'd supplier photos and it has a
    // per-image quota). Instead every <Image> goes through our own resizer: lib/imageLoader.ts ->
    // /api/rs (sharp -> WebP, edge-cached), so pages get properly sized images. Hosts the resizer
    // does not allow are left as the original URL.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    remotePatterns: [
      // OnBase-hosted product imagery (catalogue photos + swatches)
      { protocol: "https", hostname: "onbasehq.com.au" },
      { protocol: "https", hostname: "*.onbasehq.com.au" },
      // Supabase / Vercel Blob storage (OnBase media)
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // OnWood's own domain (logos, static assets served absolutely)
      { protocol: "https", hostname: "onwoodtiles.com.au" },
      // ABI Interiors — many ABI products serve their photos straight from the
      // supplier's own domain (not re-hosted), so next/image MUST allow it or
      // those product images fail with a 400 ("hostname not configured").
      { protocol: "https", hostname: "abiinteriors.com.au" },
      { protocol: "https", hostname: "*.abiinteriors.com.au" },
    ],
  },
  // Canonicalise the host: www.onwoodtiles.com.au serves the same app without
  // redirecting, which splits SEO signal and duplicates every URL. Send the www
  // host to the apex with a permanent 308, preserving the path + query.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.onwoodtiles.com.au" }],
        destination: "https://onwoodtiles.com.au/:path*",
        permanent: true,
      },
      // Only one brand page so far (app/brands/marquis); temporary so a /brands index can replace it.
      { source: "/brands", destination: "/brands/marquis", permanent: false },
    ];
  },
  // Baseline security headers on every response, plus the Content-Security-Policy
  // (lib/csp.ts; report-only while it is tuned, production deploys only).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop the site being framed (clickjacking) — incl. the trade login.
          { key: "X-Frame-Options", value: "DENY" },
          // Don't let browsers MIME-sniff responses into a different type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send only the origin (not the full path) on cross-site navigations.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for a year (site is https-only on Vercel).
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Turn off powerful browser features the site doesn't use.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          ...(process.env.VERCEL_ENV === "production" ? cspHeaders() : []),
        ],
      },
    ];
  },
};

export default nextConfig;
