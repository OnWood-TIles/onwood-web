import type { WebsiteRange } from "./onbase/client";

// "Pairs well with" - pick complementary products for the one being viewed.
// Rule-based (no AI, no invented content): reads each range's real colour/use
// tags from the feed and scores candidates by how well they actually go
// together - similar/complementary tone, use-aware (a bathroom tile suggests a
// matching-tone mosaic), shared spaces and same department. (Wall vs floor was
// dropped: most floor tiles double as wall tiles, so it's not a useful axis.)

const NEUTRALS = new Set([
  "white", "cream", "ivory", "beige", "grey", "gray", "charcoal", "black",
  "stone", "natural", "oatmeal", "sand", "tan", "silver",
]);

// Location/use values worth pairing on (the tenant's Colour/Material/Size
// values never collide with these, so we can scan all filter groups).
const USE_WORDS = new Set([
  "bathroom", "kitchen", "outdoor", "indoor", "pool", "splashback", "living",
  "laundry", "ensuite", "shower", "wet-area", "wetarea", "alfresco", "hallway", "entryway",
]);

const coloursOf = (r: WebsiteRange): string[] => r.filters?.["colour"] ?? [];

function usesOf(r: WebsiteRange): string[] {
  const out = new Set<string>();
  for (const vals of Object.values(r.filters ?? {})) for (const v of vals) if (USE_WORDS.has(v)) out.add(v);
  return [...out];
}

const isMosaic = (r: WebsiteRange): boolean => /mosaic/i.test(r.name) || (r.filters?.["size"] ?? []).includes("mosaic");
const hasImage = (r: WebsiteRange): boolean => !!(r.heroImage || r.swatches.some((s) => s.image));
const cap = (n: number, max: number) => Math.min(n, max);
const title = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export type Pair = { range: WebsiteRange; reason: string; score: number };

export function pickPairs(current: WebsiteRange, candidates: WebsiteRange[], deptLabel?: string, limit = 4): Pair[] {
  const cCols = coloursOf(current);
  const cUses = usesOf(current);
  const bathroom = cUses.includes("bathroom");

  const scored: Pair[] = [];
  for (const x of candidates) {
    if (x.id === current.id || x.slug === current.slug) continue;

    let s = 0;
    const shared = coloursOf(x).filter((c) => cCols.includes(c));
    if (shared.length) s += cap(shared.length * 20, 40);
    const neutralPair =
      !shared.length && coloursOf(x).some((c) => NEUTRALS.has(c)) && cCols.some((c) => !NEUTRALS.has(c));
    if (neutralPair) s += 12;

    const mosaicBath = bathroom && isMosaic(x);
    if (mosaicBath) s += 28 + (shared.length ? 10 : 0);

    const sharedUse = usesOf(x).filter((u) => cUses.includes(u));
    if (sharedUse.length) s += cap(sharedUse.length * 6, 12);

    const sameDept = !!x.department && x.department === current.department;
    if (sameDept) s += 8;
    if (hasImage(x)) s += 4;

    if (s <= 0) continue;

    // Reason = the strongest signal that fired (most specific first).
    let reason: string;
    if (mosaicBath) reason = "Mosaic feature, matching tone";
    else if (shared.length) reason = `Shares your ${title(shared[0])} tone`;
    else if (neutralPair) reason = "A neutral that grounds the colour";
    else if (sharedUse.length) reason = "Suits the same spaces";
    else if (sameDept) reason = deptLabel ? `Also in ${deptLabel}` : "From the same range";
    else continue;

    scored.push({ range: x, reason, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
