"use client";
// A customer's build of a product, kept in this browser so it survives leaving the page:
// the 3D builder saves on every change, and the product page's builder picks it up when they
// come back (browser Back, "Save my build", or a later visit). Per-browser only; storage can
// be blocked, so every read and write is best-effort.
const key = (slug: string) => `ow_build_${slug}`;
const MAX_AGE = 30 * 24 * 3600 * 1000;

type Saved = { q: string; t: number; from3d?: boolean };

export function saveBuild(slug: string, q: string, from3d = false) {
  try { localStorage.setItem(key(slug), JSON.stringify({ q, t: Date.now(), from3d } satisfies Saved)); } catch { /* storage blocked */ }
}

export function readBuild(slug: string): Saved | null {
  try {
    const s = JSON.parse(localStorage.getItem(key(slug)) ?? "null") as Saved | null;
    return s && typeof s.q === "string" && Date.now() - s.t < MAX_AGE ? s : null;
  } catch { return null; }
}

export const queryRecord = (q: string): Record<string, string> => Object.fromEntries(new URLSearchParams(q));
