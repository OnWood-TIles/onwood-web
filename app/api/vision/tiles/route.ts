import { NextResponse } from "next/server";
import { listRanges, getFilterGroups } from "../../../../lib/onbase/client";

// Live tile + stone-veneer list for the Vision Board picker, built from the real
// OnBase catalogue. Every published tile variation + stone-veneer colourway
// becomes one pickable swatch (routed through /api/tile so the white margin is
// trimmed off). Also returns the shop's filter groups (pruned to the values
// present) + a synthetic Tiles / Stone Cladding "Type" group, so the picker can
// filter exactly like the shop. Cached; listRanges is itself cached.
export const revalidate = 600;

type TileItem = { id: string; name: string; type: string; url: string; f: Record<string, string[]> };

// Structural stone pieces (corners, capping, pier caps) are not surfaces.
const STRUCTURAL = /\b(corners?|capping|pier\s*caps?)\b/i;
const colourSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET() {
  const [tiles, stone, groups] = await Promise.all([
    listRanges({ department: "tiles" }),
    listRanges({ department: "stone-cladding" }),
    getFilterGroups(),
  ]);

  const out: TileItem[] = [];
  const add = (ranges: typeof tiles, type: string, dept: string, skipStructural: boolean) => {
    for (const r of ranges) {
      if (skipStructural && STRUCTURAL.test(r.name)) continue;
      const rf = (r.filters || {}) as Record<string, string[]>;
      r.swatches.forEach((s, i) => {
        if (!s.image) return;
        const colour = (s.colour || "").trim();
        const name = colour && colour.toLowerCase() !== r.name.toLowerCase() ? `${r.name} ${colour}` : r.name;
        const f: Record<string, string[]> = { ...rf, "surface-type": [dept] };
        out.push({ id: `${r.slug}-${colourSlug(colour) || i}`, name, type, url: `/api/tile?u=${encodeURIComponent(s.image)}`, f });
      });
    }
  };
  add(tiles, "Tiles", "tiles", false);
  add(stone, "Stone Veneer", "stone", true);

  // Which filter values actually appear on the loaded tiles (so we don't show
  // dead filters), then keep only the shop groups relevant to tiles/stone.
  const present: Record<string, Set<string>> = {};
  for (const t of out) for (const [g, vals] of Object.entries(t.f)) for (const v of vals) (present[g] ??= new Set()).add(v);
  const shopGroups = groups
    .filter((g) => !g.departments?.length || g.departments.some((d) => d === "tiles" || d === "stone-cladding"))
    .map((g) => ({ slug: g.slug, label: g.label, values: g.values.filter((v) => present[g.slug]?.has(v.slug)) }))
    .filter((g) => g.values.length > 1);
  const typeGroup = { slug: "surface-type", label: "Type", values: [{ slug: "tiles", label: "Tiles" }, { slug: "stone", label: "Stone Cladding" }] };

  return NextResponse.json({ tiles: out, groups: [typeGroup, ...shopGroups] });
}
