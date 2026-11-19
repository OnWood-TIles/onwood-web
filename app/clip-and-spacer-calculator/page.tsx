import type { Metadata } from "next";
import CalcPage from "../components/calc/CalcPage";
import ClipSpacerCalculator, { type PackProduct } from "../components/calc/ClipSpacerCalculator";
import { CLIP_SLUG, JOINTS, packSize, type Joint } from "../../lib/clipSpacerCalc";
import { listRanges } from "../../lib/onbase/client";
import { laticreteLinkOk } from "../../lib/flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Tile Levelling Clip & Spacer Calculator | How Many Do I Need? | OnWood Tiles" },
  description: "Work out how many tile levelling clips, wedges and spacers you need from your tile size and area, in the packs we sell, and add them to your quote.",
  alternates: { canonical: "https://onwoodtiles.com.au/clip-and-spacer-calculator" },
  openGraph: { title: "Clip and spacer calculator | OnWood Tiles", url: "https://onwoodtiles.com.au/clip-and-spacer-calculator", type: "website" },
};

const FAQS = [
  { q: "Where do the clips and spacers go?", a: "A spacer goes at every corner where tiles meet. On a brick or offset layout that is a T-joint, so snap one arm off the cross or stand it upright. Levelling clips go under the edges of the tiles, about 50 mm in from each corner and no more than about 300 mm apart. Without clips, stand extra spacers upright along the longer edges instead." },
  { q: "How many clips per tile?", a: "As a guide: 4 for a 300 x 300, 300 x 600 or 600 x 600 tile, 6 for a 600 x 1200 and 8 for a 1200 x 1200. That is 2 per tile side, plus 1 more for every extra 300 mm on longer sides. The calculator does this for any tile size." },
  { q: "Do I need levelling clips?", a: "They are worth it for floor tiles 600 mm and longer, for planks, and anywhere an uneven edge between two tiles (lippage) would show. Small wall tiles and mosaics usually do not need them." },
  { q: "Can I re-use the wedges?", a: "Yes. The clips are single use: you snap them off once the adhesive has set. The wedges come off and go again, so you only need enough for one day's tiling. Enter how much you will lay in a day and the calculator works it out." },
  { q: "Which joint width should I use?", a: "2 mm is the everyday joint for most rectified floor and wall tiles, and 1.5 mm suits fine joints on wall tiles and splashbacks. 3 mm suits floor tiles and tiles with a slightly uneven edge, and 5 mm suits rustic, handmade and outdoor tiles. Check what your tile maker recommends." },
  { q: "Which clips suit my tile?", a: "Our levelling clips suit tiles 3 to 12 mm thick, in 1, 1.5, 2 and 3 mm joints. For a 5 mm joint, the calculator uses the 3 mm clips with 5 mm spacers at the corners. For thicker tiles and 20 mm pavers, ask us." },
];

export default async function ClipSpacerCalculatorPage({ searchParams }: { searchParams: Promise<{ joint?: string }> }) {
  const { joint } = await searchParams;
  const initialJoint = JOINTS.find((j) => String(j) === joint) ?? null;
  // Live products and pack prices so each result can go straight onto the quote list.
  const products: Record<string, PackProduct> = {};
  try {
    for (const r of await listRanges({ department: "accessories", category: "spacers-levelling" })) {
      const s = r.swatches[0];
      products[r.slug] = {
        rangeId: r.id, name: r.name, image: r.heroImage ?? s?.image ?? null, unit: s?.unit ?? r.unit ?? "each",
        packs: r.swatches.map((x) => ({ label: x.colour, size: r.slug === CLIP_SLUG ? 500 : packSize(x.colour), price: x.price ?? null })),
      };
    }
  } catch { /* the calculator still works without prices and add buttons */ }
  return (
    <CalcPage
      title="How many clips and spacers do I" italic="need?"
      intro="Enter your tile size and area. We work out how many levelling clips, wedges and spacers you need, in the cheapest mix of the packs we sell, and you can add them to your quote in one click."
      tool={<ClipSpacerCalculator products={products} initialJoint={initialJoint as Joint | null} />} faqs={FAQS}
      other={{ href: "/calculator", label: "Tile calculator" }}
      eyebrow="Free tool · Tiling"
      note="Estimates only, based on a spacer at every corner and a levelling clip about every 300 mm along each tile edge, plus your spare. Cuts, borders and how you lay change the real numbers. Add the products to your quote and we will check the quantities for you."
      links={[
        { href: "/calculator", label: "Tile calculator" },
        { href: "/adhesive-calculator", label: "Adhesive calculator" },
        { href: "/grout-calculator", label: "Grout calculator" },
        { href: "/shop/accessories?c=spacers-levelling", label: "Shop spacers & levelling", dark: true },
      ].filter((l) => laticreteLinkOk(l.href))}
    />
  );
}
