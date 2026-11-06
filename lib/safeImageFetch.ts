import "server-only";

// Server-side image fetching for the resizer, trimmer, image cache and AI tools.
// Pair with an allowlist from lib/imageHosts.ts.

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

/**
 * Fetch an image from an allowed address. Redirects are followed by hand (at most 3) and
 * every hop must pass `allow` too, so an allowed site can't bounce the server somewhere
 * else. Only image (or generic binary) responses are read, and never more than 25MB.
 * Returns null on anything unexpected.
 */
export async function fetchAllowedImage(
  url: string,
  allow: (u: string) => boolean,
  opts: { timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<{ buf: Buffer; contentType: string } | null> {
  const signal = AbortSignal.timeout(opts.timeoutMs ?? 9000);
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    if (!allow(current)) return null;
    const r = await fetch(current, { headers: opts.headers, redirect: "manual", signal });
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) return null;
      current = new URL(loc, current).toString();
      continue;
    }
    if (!r.ok || !r.body) return null;
    const contentType = (r.headers.get("content-type") || "").toLowerCase();
    if (contentType && !contentType.startsWith("image/") && !contentType.startsWith("application/octet-stream")) return null;
    if (Number(r.headers.get("content-length") || 0) > MAX_IMAGE_BYTES) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = r.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel().catch(() => {}); return null; }
      chunks.push(value);
    }
    return { buf: Buffer.concat(chunks), contentType };
  }
  return null;
}

/** sharp's input pixel ceiling for fetched images (a 10,000 x 10,000 photo), so a
 *  tiny file that decodes to an enormous canvas can't tie a function up. */
export const SHARP_PIXEL_LIMIT = 100_000_000;
