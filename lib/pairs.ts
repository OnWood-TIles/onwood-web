import type { WebsiteRange } from "./onbase/client";

// "Pairs well with" - pick complementary products for the one being viewed.
// Rule-based (no AI, no invented content): it reads each range's real category,
// colour and use tags from the feed and scores candidates by how well they
// actually go together. Reagan's brief: opposite surface (a wall tile suggests a
// floor tile and vice versa), similar/complementary tone, and use-aware (a
// bathroom tile suggests a matching-tone mosaic).

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

function surfaceOf(r: WebsiteRange): "wall" | "floor" | "both" | "other" {
  const f = r.categories.includes("floor");
  const w = r.categories.includes("wall");
  if (f && w) return "both";
  if (f) return "floor";
  if (w) return "wall";
  return "other";
}

const isMosaic = (r: WebsiteRange): boolean => /mosaic/i.test(r.name) || r.categories.includes("feature");
const hasImage = (r: WebsiteRange): boolean => !!(r.heroImage || r.swatches.some((s) => s.image));
const cap = (n: number, max: number) => Math.min(n, max);
const title = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export type Pair = { range: WebsiteRange; reason: string; score: number };

export function pickPairs(current: WebsiteRange, candidates: WebsiteRange[], deptLabel?: string, limit = 4): Pair[] {
  const cSurf = surfaceOf(current);
  const cCols = coloursOf(current);
  const cUses = usesOf(current);
  const bathroom = cUses.includes("bathroom");

  const scored: Pair[] = [];
  for (const x of candidates) {
    if (x.id === current.id || x.slug === current.slug) continue;

    let s = 0;
    const xSurf = surfaceOf(x);
    const oppFloor = cSurf === "wall" && (xSurf === "floor" || xSurf === "both");
    const oppWall = cSurf === "floor" && (xSurf === "wall" || xSurf === "both");
    if (oppFloor || oppWall) s += 30;

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
    else if (oppFloor) reason = "Pairs on the floor";
    else if (oppWall) reason = "Pairs on the wall";
    else if (shared.length) reason = `Shares your ${title(shared[0])} tone`;
    else if (neutralPair) reason = "A neutral that grounds the colour";
    else if (sharedUse.length) reason = "Suits the same spaces";
    else if (sameDept) reason = deptLabel ? `Also in ${deptLabel}` : "From the same range";
    else continue;

    scored.push({ range: x, reason, score: s });
  }

  scored.sort((a, b) => b.score - a.score);

  // Light diversity: don't return four of the same primary category.
  const out: Pair[] = [];
  const catCount = new Map<string, number>();
  for (const p of scored) {
    const cat = p.range.categories[0] ?? "_";
    if ((catCount.get(cat) ?? 0) >= 2) continue;
    catCount.set(cat, (catCount.get(cat) ?? 0) + 1);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
