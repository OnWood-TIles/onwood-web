import type { Metadata } from "next";
import CalcPage from "../components/calc/CalcPage";
import { GroutCalculator } from "../components/calc/LaticreteCalculators";

export const metadata: Metadata = {
  title: { absolute: "Grout Calculator | How Much Grout Do I Need? | OnWood Tiles" },
  description: "Work out how much LATICRETE grout you need from your tile size, thickness, joint width and area. PERMACOLOR Select, PERMACOLOR New & Improved and SPECTRALOCK PRO epoxy, side by side.",
  alternates: { canonical: "https://onwoodtiles.com.au/grout-calculator" },
  openGraph: { title: "Grout calculator | OnWood Tiles", url: "https://onwoodtiles.com.au/grout-calculator", type: "website" },
};

const FAQS = [
  { q: "Why does tile size change how much grout I need?", a: "Smaller tiles have far more joints per square metre. A square metre of 50 x 50 mosaic has about ten times the joint length of 600 x 600 tile, so it uses far more grout." },
  { q: "Why does tile thickness matter?", a: "The grout fills the joint to the full depth of the tile, so a 9 mm tile uses about half as much again as a 6 mm tile for the same joint width." },
  { q: "What joint width should I use?", a: "These grouts all suit joints from 1.5 to 12 mm. Rectified porcelain is often laid with 1.5 to 3 mm joints; handmade-look and pressed-edge tiles usually need wider joints. Your tile and installer decide." },
  { q: "How much waste should I allow?", a: "LATICRETE suggests 10% for spills and clean-up with glazed tile, and 10 to 15% for unglazed or textured tile." },
  { q: "Is a SPECTRALOCK PRO Mini enough for my splashback?", a: "Usually, with subway or larger tiles. A Mini makes about 0.7 litres: about 2 to 3 m² of 75 x 300 subway tile, about 4 m² of 300 x 300 tile, but only about 1 m² of 50 x 50 mosaic. Put your tile in the calculator to see." },
  { q: "Can I mix half a unit of epoxy grout?", a: "No. Mix the whole unit (Parts A, B and C) as LATICRETE's instructions say, so choose the size that suits your area." },
];

export default function GroutCalculatorPage() {
  return (
    <CalcPage
      title="How much grout do I" italic="need?"
      intro="Enter your tile size, thickness, joint width and area. We will show how far each LATICRETE grout goes and how many packs you need, side by side."
      tool={<GroutCalculator />} faqs={FAQS} other={{ href: "/adhesive-calculator", label: "Adhesive calculator" }}
    />
  );
}
