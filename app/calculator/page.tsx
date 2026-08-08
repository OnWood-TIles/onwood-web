import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Tile Calculator | How Much Tile Do I Need? | OnWood Tiles",
  description:
    "Work out how many square metres and boxes of tile you need, with wastage, in seconds. A free tile calculator from OnWood Tiles, your Sunshine Coast tile showroom.",
  keywords:
    "tile calculator, how much tile do I need, tiles per square metre, tile wastage, how many boxes of tiles, m2 calculator, Sunshine Coast tiles, OnWood Tiles",
  alternates: { canonical: "https://onwoodtiles.com.au/calculator" },
  openGraph: {
    title: "Tile Calculator | How much tile do I need?",
    description: "Square metres, wastage and boxes in seconds - a free tool from OnWood Tiles.",
    url: "https://onwoodtiles.com.au/calculator",
    type: "website",
  },
};

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" };
const serif = (t: string) => <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" }}>{t}</em>;

export default function CalculatorPage() {
  // HowTo-ish structured data helps this surface for "how much tile do I need".
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to work out how much tile you need",
    description: "Measure each area, add a wastage allowance for cuts, then divide by your tile's box coverage to get the number of boxes.",
    step: [
      { "@type": "HowToStep", name: "Measure", text: "Measure the length and width of each area in metres and multiply for the square metres." },
      { "@type": "HowToStep", name: "Add wastage", text: "Add 10 to 20 percent for cuts, offcuts, breakages and pattern matching." },
      { "@type": "HowToStep", name: "Convert to boxes", text: "Divide the total by the square metres one box of your chosen tile covers, and round up." },
    ],
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main>
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(96px,16vw,150px) 24px 8px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 480px at 80% -10%, color-mix(in srgb, var(--sea) 12%, transparent), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
            <Reveal>
              <p style={eyebrow}>Free tool</p>
              <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(34px,5.4vw,60px)", lineHeight: 1.03, margin: "14px 0 0" }}>
                How much tile do I {serif("need")}?
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "56ch", margin: "18px 0 0" }}>
                Add your room sizes, choose a wastage allowance, and get your square metres and boxes in seconds. Bring the numbers in and we will match them to the right tile.
              </p>
            </Reveal>
          </div>
        </section>

        <section style={{ padding: "34px 24px 90px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <CalculatorClient />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
