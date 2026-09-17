// Group products into "families" (same base name, size/finish stripped) for the
// per-family product brochure. Reuses the proven familyKey from pairs.ts.
import { familyKey } from "./pairs";
import type { WebsiteRange } from "./onbase/client";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Departments where a collection is "one design sold in several sizes/formats",
// so the FIRST WORD of the name is the range (e.g. "Montalcino Naturale" +
// "Montalcino Rettangolo" = one Montalcino range; "Aspect 100x200" + "Aspect
// Designer" = one Aspect range). Other departments keep strict size/finish
// stripping — brands like Pixi/Harper/Kingsley reuse a name across DIFFERENT
// products, so first-word there would wrongly merge them.
const FIRST_WORD_DEPTS = new Set(["tiles", "pavers"]);

/** URL-safe family key. Tiles/pavers group on the first name word; everything
 *  else strips size/finish tokens ("Colonnade 60" -> "colonnade"). Falls back to
 *  the product's own slug when nothing stable remains. */
export function familySlug(r: Pick<WebsiteRange, "name" | "slug" | "department">): string {
  if (r.department && FIRST_WORD_DEPTS.has(r.department)) {
    const fw = slugify(r.name.trim().split(/\s+/)[0] || "");
    if (fw && !/^\d+$/.test(fw)) return fw; // ignore a leading pure-number token
  }
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
