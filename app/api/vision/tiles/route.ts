import { NextResponse } from "next/server";
import { listRanges } from "../../../../lib/onbase/client";

// Live tile + stone-veneer list for the Vision Board picker, built from the real
// OnBase catalogue (was a hardcoded public/data/tiles.json of old Shopify tiles).
// Every published tile variation + stone-veneer colourway becomes one pickable
// swatch. Cached (revalidate) so the board loads fast; listRanges is itself cached.
export const revalidate = 600;

type TileItem = { id: string; name: string; type: string; url: string };

// Structural stone pieces (corners, capping, pier caps) are not surfaces - keep
// them out of the mood-board picker.
const STRUCTURAL = /\b(corners?|capping|pier\s*caps?)\b/i;

const colourSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET() {
  const [tiles, stone] = await Promise.all([
    listRanges({ department: "tiles" }),
    listRanges({ department: "stone-cladding" }),
  ]);

  const out: TileItem[] = [];
  const add = (ranges: typeof tiles, type: string, skipStructural: boolean) => {
    for (const r of ranges) {
      if (skipStructural && STRUCTURAL.test(r.name)) continue;
      r.swatches.forEach((s, i) => {
        if (!s.image) return;
        const colour = (s.colour || "").trim();
        const name = colour && colour.toLowerCase() !== r.name.toLowerCase() ? `${r.name} ${colour}` : r.name;
        out.push({ id: `${r.slug}-${colourSlug(colour) || i}`, name, type, url: s.image });
      });
    }
  };
  add(tiles, "Tiles", false);
  add(stone, "Stone Veneer", true);

  return NextResponse.json(out);
}
