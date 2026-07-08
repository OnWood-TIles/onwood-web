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
    ],
  },
};

export default nextConfig;
