// SSRF guard for server-side image fetches.
//
// Several endpoints fetch an image URL that ultimately comes from the request
// body (the AI room visualiser references, the Flux swatch colours, the mood-
// board share). Without a check, an attacker could POST an internal URL
// (169.254.x, localhost:<other-port>, a private service) and make OUR server
// fetch it. This central allowlist mirrors the /api/tile allowlist: only the
// known catalogue image hosts (plus our own origin, so relative URLs resolved
// against this deployment still work in dev + prod) may be fetched.
//
// Blob storage is pinned to OUR two stores (OnBase uploads + this site's own
// image cache / review photos) - "any *.public.blob.vercel-storage.com" would
// let anyone point the resizer at files in their own Vercel account.

const ALLOWED_HOST =
  /^(([a-z0-9-]+\.)*(onwoodtiles\.com\.au|onbasehq\.com\.au|abiinteriors\.com\.au|marquis\.com\.au)|jwxkc2x6hmfp0lqp\.public\.blob\.vercel-storage\.com|tzfi4dlc6lrdan9a\.public\.blob\.vercel-storage\.com)$/i;

/** This site's own blob store (image cache + review photo uploads). */
export const OWN_BLOB_HOST = "tzfi4dlc6lrdan9a.public.blob.vercel-storage.com";

/**
 * True if `url` is safe to fetch server-side.
 * @param url        the (already absolute) URL to fetch
 * @param selfOrigin this deployment's origin (e.g. request URL origin) — its own
 *                   assets are always allowed, which covers relative URLs
 *                   resolved to the app itself, including localhost in dev.
 */
export function isAllowedImageHost(url: string, selfOrigin?: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.username || u.password) return false;
  // Our own origin (covers "/relative" paths resolved against this deployment).
  if (selfOrigin && u.origin === selfOrigin) return true;
  // Everything else must be https to a known catalogue image host.
  return u.protocol === "https:" && ALLOWED_HOST.test(u.hostname);
}
