import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ];
  },
  // Baseline security headers on every response. (No CSP here yet — a strict
  // Content-Security-Policy needs per-route testing against Next's inline
  // bootstrap + JSON-LD + data: images before it can go live safely.)
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
        ],
      },
    ];
  },
};

export default nextConfig;
