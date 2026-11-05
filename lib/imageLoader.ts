"use client";

import { rs } from "./rs";

// next/image loader (next.config.ts images.loaderFile): every <Image> gets a srcset of resized
// WebP copies from /api/rs instead of the full-size original.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return rs(src, width, quality);
}
