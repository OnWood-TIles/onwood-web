// Shared data for the floor-covering comparison: the public table on the flooring
// guide (app/blog/FloorScores.tsx) and the interactive editor (/floor-scores-editor)
// both read from here, so they never drift apart. Scores are 1-5, 5 = best for the
// buyer. Overall = average x20 (out of 100). Honest editorial defaults; adjust here.
//
// Criteria meaning (5 = best): Value = cheap to buy + lay. Water = wet areas /
// outdoors. Comfort = warmth + softness underfoot. Upkeep = easy to clean.
// Expansion = dimensional stability (5 = barely moves, no big expansion gaps).
// Trims = how cleanly it finishes at walls + doorways (5 = tight, flush, few trims).
// Acoustics = how quiet underfoot / sound absorption (5 = quietest).

export const CRITERIA = ["Value", "Looks", "Durability", "Water", "Repair", "Style range", "Comfort", "Upkeep", "Expansion", "Trims", "Acoustics"] as const;

export type Floor = { name: string; tag: string; scores: number[] };

// scores in CRITERIA order: [value, looks, durability, water, repair, style, comfort, upkeep, expansion, trims, acoustics]
// Scores set by Reagan via /floor-scores-editor; rows ordered by overall (highest first).
export const FLOORS: Floor[] = [
  { name: "Porcelain tile", tag: "stone, marble & concrete look", scores: [3, 5, 5, 5, 2, 5, 1, 5, 5, 5, 2] },
  { name: "Luxury vinyl plank", tag: "LVP, flexible", scores: [4, 3, 3, 4, 4, 4, 4, 5, 4, 5, 3] },
  { name: "Hybrid flooring", tag: "SPC, rigid core", scores: [4, 4, 3, 4, 4, 4, 4, 5, 3, 3, 4] },
  { name: "Laminate", tag: "click-together boards", scores: [4, 5, 4, 2, 4, 4, 4, 5, 3, 1, 4] },
  { name: "Timber-look porcelain", tag: "wood look, tile tough", scores: [3, 4, 5, 5, 2, 2, 1, 5, 5, 5, 2] },
  { name: "Polished concrete", tag: "ground & sealed slab", scores: [3, 4, 5, 5, 2, 3, 1, 4, 5, 5, 1] },
  { name: "Carpet", tag: "wool or synthetic pile", scores: [5, 3, 2, 2, 2, 3, 5, 2, 5, 3, 5] },
  { name: "Natural stone", tag: "marble, travertine, slate", scores: [1, 5, 5, 4, 2, 4, 1, 2, 5, 5, 2] },
  { name: "Engineered / solid timber", tag: "real hardwood", scores: [3, 5, 2, 1, 4, 4, 4, 4, 3, 3, 3] },
];

export const overall = (s: number[]) => Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 20);
export const band = (v: number) => (v >= 80 ? "a" : v >= 70 ? "b" : v >= 60 ? "c" : "d");
