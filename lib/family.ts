// Group products into "families" (same base name, size/finish stripped) for the
// per-family product brochure. Reuses the proven familyKey from pairs.ts.
import { familyKey } from "./pairs";
import type { WebsiteRange } from "./onbase/client";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** URL-safe family key, e.g. "Colonnade 60" -> "colonnade". Falls back to the
 *  product's own slug when the name has no stable base (all size/finish tokens). */
export function familySlug(r: Pick<WebsiteRange, "name" | "slug">): string {
  return slugify(familyKey(r.name)) || r.slug;
}

/** Group a flat range list into families keyed by familySlug. */
export function groupFamilies(ranges: WebsiteRange[]): Map<string, WebsiteRange[]> {
  const m = new Map<string, WebsiteRange[]>();
  for (const r of ranges) {
    const k = familySlug(r);
    const list = m.get(k);
    if (list) list.push(r);
    else m.set(k, [r]);
  }
  return m;
}
