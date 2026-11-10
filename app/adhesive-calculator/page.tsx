import type { Metadata } from "next";
import CalcPage from "../components/calc/CalcPage";
import { AdhesiveCalcWithPicker, type QuoteProduct } from "../components/calc/LaticreteCalculators";
import { listRanges } from "../../lib/onbase/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Tile Adhesive Calculator | How Many Bags Do I Need? | OnWood Tiles" },
  description: "Work out how many bags of LATICRETE tile adhesive you need from your area and trowel size: 335, 254, TRI-LITE, Multimastic and more, side by side.",
  alternates: { canonical: "https://onwoodtiles.com.au/adhesive-calculator" },
  openGraph: { title: "Tile adhesive calculator | OnWood Tiles", url: "https://onwoodtiles.com.au/adhesive-calculator", type: "website" },
};

const FAQS = [
  { q: "Which trowel size should I use?", a: "As a guide: 6 mm for mosaics and tiles up to about 300 mm, 10 mm for 300 to 600 mm tiles, and 12 mm plus back-buttering for anything bigger. What matters is full coverage under every tile, so lift one to check." },
  { q: "Why does the trowel size matter so much?", a: "The notch sets how thick the adhesive bed is. A 12 mm notch lays down twice as much adhesive as a 6 mm notch, so a bag covers half the area." },
  { q: "Why does an 11 kg bag cover as much as a 20 kg bag?", a: "TRI-LITE and 257 TITANIUM are lightweight, sand-free adhesives. They mix up to about the same volume as a standard 20 kg bag, so they cover about the same area." },
  { q: "What is back-buttering, and does it use more?", a: "Skimming a thin coat of adhesive onto the back of each tile as well as the floor or wall. It is a must for large format tiles and outdoors, and it uses more adhesive, so allow extra." },
  { q: "Does the surface change how much I need?", a: "Yes. Uneven or rough surfaces fill more of the notch. Level the surface first and allow extra waste on rough or old surfaces." },
  { q: "Which adhesive should I choose?", a: "Use the picker at the top of this page: answer three questions and it picks the adhesive and trowel, then the calculator works out how many bags. Our LATICRETE adhesive and grout guide explains every product in full." },
];

export default async function AdhesiveCalculatorPage() {
  // Live products so each result can go straight onto the quote list.
  const products: Record<string, QuoteProduct> = {};
  try {
    for (const r of await listRanges({ department: "adhesives" })) {
      const s = r.swatches[0];
      products[r.slug] = { rangeId: r.id, name: r.name, image: r.heroImage ?? s?.image ?? null, unit: s?.unit ?? r.unit ?? "bag", price: s?.price ?? r.price ?? null, colour: s?.colour ?? null, coverageM2: s?.coverageM2 ?? r.coverageM2 ?? null };
    }
  } catch { /* calculator still works without the add buttons */ }
  return (
    <CalcPage
      title="How much adhesive do I" italic="need?"
      intro="Not sure which adhesive? Answer three quick questions, then enter your area. We work out how many bags you need and you can add them to your quote in one click."
      tool={<AdhesiveCalcWithPicker products={products} />} faqs={FAQS} other={{ href: "/grout-calculator", label: "Grout calculator" }}
    />
  );
}
