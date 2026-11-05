// Resized-image URLs. Next's own optimizer is off (see next.config.ts), so without this every
// photo ships at full size (installed shots are ~3MB each). `rs()` points an image at /api/rs,
// which shrinks it to a fixed width step as WebP and is cached at the edge for a year.
// Used by the next/image loader (lib/imageLoader.ts) and directly on plain <img> tags.

import { isAllowedImageHost } from "./imageHosts";

const STEPS = [160, 320, 480, 640, 828, 1080, 1280, 1600, 1920];

/** Snap a requested width up to the next step, so each photo only ever has a handful of sizes. */
export function snapWidth(w: number) {
  return STEPS.find((s) => s >= w) ?? STEPS[STEPS.length - 1];
}

/** URL of `src` resized to (about) `w` CSS-pixel-ready width. Leaves SVG / GIF / data URLs and
 *  our own image API routes (already sized) as they are. */
export function rs(src: string | null | undefined, w: number, q?: number): string {
  if (!src) return "";
  if (/^(data:|blob:)/.test(src) || /^\/api\//.test(src) || /^https:\/\/onwoodtiles\.com\.au\/api\//.test(src)) return src;
  if (/\.(svg|gif)(\?|$)/i.test(src)) return src;
  if (!(src.startsWith("/") && !src.startsWith("//")) && !isAllowedImageHost(src)) return src; // the resizer would refuse it
  return `/api/rs?u=${encodeURIComponent(src)}&w=${snapWidth(w)}${q ? `&q=${q}` : ""}`;
}
