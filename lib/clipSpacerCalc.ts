// Levelling clip, wedge and spacer estimates for /clip-and-spacer-calculator. Estimates only; spare on top.
//  - Clips: 2 per tile side, plus 1 for every extra 300 mm on longer sides (about 300 mm apart, ~50 mm in
//    from each corner). Matches the published charts: LevTec 300x600 = 2 per side, 600x1200 = 4 on the long
//    side; Forever Level 600x600 = 4 per tile (11.1/m²). Each tile owns one long and one short joint, so
//    clips per tile = the count for its width side + its length side.
//  - Spacers: one at every corner (straight grid = 1 per tile, brick/offset = 2 per tile at the T-joints),
//    plus extra upright spacers along sides over 300 mm when no clips hold those edges.
//  - Wedges are re-usable: enough for one day's tiling.

export const JOINTS = [1.5, 2, 3, 5] as const;
export type Joint = (typeof JOINTS)[number];

/** Live product slugs (OnBase feed). The clips are one product; the joint width is the choice. */
export const SPACER_SLUG: Record<Joint, string> = { 1.5: "tile-spacers-1-5mm", 2: "tile-spacers-2mm", 3: "tile-spacers-3mm", 5: "tile-spacers-5mm" };
export const CLIP_SLUG = "tile-levelling-clips";
export const WEDGE_SLUG = "tile-levelling-wedges";
export const PLIERS_SLUG = "tile-levelling-pliers";
/** Clip choice for each joint: there is no 5 mm clip, so a 5 mm joint uses 3 mm clips with 5 mm spacers. */
export const CLIP_FOR_JOINT: Record<Joint, string> = { 1.5: "1.5 mm", 2: "2 mm", 3: "3 mm", 5: "3 mm" };

export const clipsPerSide = (mm: number) => (mm <= 0 ? 0 : mm <= 200 ? 1 : Math.max(2, Math.ceil(mm / 300)));
export const clipsPerTile = (w: number, l: number) => clipsPerSide(w) + clipsPerSide(l);

export function spacersPerTile(w: number, l: number, offset: boolean, clips: boolean): number {
  const corners = offset ? 2 : 1;
  if (clips) return corners;
  const extra = (mm: number) => Math.max(0, Math.ceil(mm / 300) - 1);
  return corners + extra(w) + extra(l);
}

/** Tiles in an area, counting the joint around each tile. */
export const tilesIn = (areaM2: number, w: number, l: number, joint: number) =>
  areaM2 > 0 && w > 0 && l > 0 ? (areaM2 * 1e6) / ((w + joint) * (l + joint)) : 0;

export const withSpare = (n: number, sparePct: number) => (n > 0 ? Math.ceil(n * (1 + sparePct / 100) - 1e-9) : 0);

/** Clips are worth it from 600 mm tiles and planks up. */
export const clipsSuggested = (w: number, l: number) => Math.max(w, l) >= 600;

export type Pack = { label: string; size: number; price: number | null };

/** "Bag of 1,000" -> 1000; a single item ("Standard") -> 1. */
export function packSize(label: string): number {
  const m = label.match(/of\s+([\d,]+)/i);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 1;
}

/** Cheapest mix of packs that gives at least `need` pieces. Unpriced packs fall back to fewest spare pieces;
 *  ties go to fewer packs. */
export function cheapestPacks(need: number, packs: Pack[]): { pack: Pack; count: number }[] {
  const ps = packs.filter((p) => p.size > 0);
  if (need <= 0 || !ps.length) return [];
  const priced = ps.every((p) => p.price != null && p.price > 0);
  const cost = (p: Pack) => (priced ? (p.price as number) : p.size) + 1e-6;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const step = ps.reduce((g, p) => gcd(g, p.size), ps[0].size);
  const n = Math.ceil(need / step);
  const best = new Array<number>(n + 1).fill(Infinity), pick = new Array<number>(n + 1).fill(-1);
  best[0] = 0;
  for (let k = 1; k <= n; k++) {
    ps.forEach((p, i) => {
      const c = cost(p) + best[Math.max(0, k - p.size / step)];
      if (c < best[k]) { best[k] = c; pick[k] = i; }
    });
  }
  const counts = new Map<number, number>();
  for (let k = n; k > 0; k = Math.max(0, k - ps[pick[k]].size / step)) counts.set(pick[k], (counts.get(pick[k]) ?? 0) + 1);
  return [...counts].map(([i, count]) => ({ pack: ps[i], count })).sort((a, b) => b.pack.size - a.pack.size);
}
