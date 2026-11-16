"use client";
// A customer's build of a product, kept in this browser so it survives leaving the page:
// the 3D builder saves on every change, and the product page's builder picks it up when they
// come back (browser Back, "Save my build", or a later visit). Per-browser only; storage can
// be blocked, so every read and write is best-effort.
const key = (slug: string) => `ow_build_${slug}`;
// The 3D builder is back at its start (reset, or nothing picked): the product page in this tab
// starts from scratch too when they return, even by the browser Back button to an address that
// still carries the old build. Per tab, so it never touches a build opened in another tab.
const startKey = (slug: string) => `ow_build_start_${slug}`;
const MAX_AGE = 30 * 24 * 3600 * 1000;

type Saved = { q: string; t: number; from3d?: boolean };

export function saveBuild(slug: string, q: string, from3d = false) {
  try { localStorage.setItem(key(slug), JSON.stringify({ q, t: Date.now(), from3d } satisfies Saved)); } catch { /* storage blocked */ }
  try { sessionStorage.removeItem(startKey(slug)); } catch { /* storage blocked */ }
}

/** Forget the saved build: it is back at its start ("Reset build", or the starting picks).
 *  From the 3D builder, the product page follows it back to the start (see startKey). */
export function clearBuild(slug: string, from3d = false) {
  try { localStorage.removeItem(key(slug)); } catch { /* storage blocked */ }
  try { if (from3d) sessionStorage.setItem(startKey(slug), "1"); else sessionStorage.removeItem(startKey(slug)); } catch { /* storage blocked */ }
}

export function readBuild(slug: string): Saved | null {
  try { if (sessionStorage.getItem(startKey(slug))) return { q: "", t: Date.now(), from3d: true }; } catch { /* storage blocked */ }
  try {
    const s = JSON.parse(localStorage.getItem(key(slug)) ?? "null") as Saved | null;
    return s && typeof s.q === "string" && Date.now() - s.t < MAX_AGE ? s : null;
  } catch { return null; }
}

export const queryRecord = (q: string): Record<string, string> => Object.fromEntries(new URLSearchParams(q));

/** This page's address without the build (the o_ options), keeping anything else and the #hash. */
export function addressWithoutBuild(): string {
  const u = new URL(window.location.href);
  for (const k of [...u.searchParams.keys()]) if (k.startsWith("o_")) u.searchParams.delete(k);
  return u.pathname + u.search + u.hash;
}
