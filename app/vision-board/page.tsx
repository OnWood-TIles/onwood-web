import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import VisionBoard from "../components/marketing/VisionBoard";

export const metadata: Metadata = {
  title: "Vision Board — design your space online",
  description:
    "Build your look with OnWood Tiles' free vision board: lay real tiles, natural stone, timber, benchtops and tapware onto a live board and see it come together. Start from a warm Mediterranean or coastal collection, or design your own. A Sunshine Coast tile studio in Baringa.",
};

// Curated starting looks — warm Mediterranean / coastal — shown as inspiration
// above the interactive builder. Images live in /public/images/vision.
const COLLECTIONS: { name: string; room: string; note: string }[] = [
  { name: "Coastal Kitchen", room: "/images/vision/coastal-kitchen-room.webp", note: "Antikella marble, Azzurro gloss subway and a warm terracotta floor." },
  { name: "Mediterranean Ensuite", room: "/images/vision/marrakesh-ensuite-room.webp", note: "Travertine, an aged-terracotta Moroccan mosaic band and aged brass." },
  { name: "Coastal Powder Room", room: "/images/vision/coastal-powder-room.webp", note: "A textured stone-look feature wall over warm ivory terrazzo." },
  { name: "Coastal Living", room: "/images/vision/stackstone-living-room.webp", note: "Dry-stacked ledge stone, driftwood timber and a travertine hearth." },
];

const eyebrow: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--accent2)",
};

export default function VisionBoardPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main>
        {/* Intro */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,15vw,140px) 40px 20px", textAlign: "center" }}>
          <Reveal>
            <div style={eyebrow}>Vision board</div>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(36px,5.4vw,64px)", letterSpacing: "-.025em", lineHeight: 1.02, margin: "16px auto 0", maxWidth: 900 }}>
              Design your space,{" "}
              <span style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>tile by tile.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p style={{ color: "#5a6067", fontSize: 17, lineHeight: 1.7, margin: "20px auto 0", maxWidth: 620 }}>
              Lay real tiles, natural stone, timber, benchtops and tapware onto a live board and see the whole look come together. Start from one of our warm Mediterranean and coastal collections below, or build your own from scratch.
            </p>
          </Reveal>
        </section>

        {/* Curated collections — inspiration */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 40px 20px" }}>
          <div className="vb-collections" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {COLLECTIONS.map((c, i) => (
              <Reveal key={c.name} delay={0.06 * i}>
                <article style={{ borderRadius: 20, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 18px 44px rgba(32,48,58,.10)", height: "100%" }}>
                  <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", background: "#e7ddcd" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.room} alt={`${c.name} — a warm coastal Mediterranean look`} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "16px 18px 20px" }}>
                    <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, margin: "0 0 6px", color: "var(--ink)" }}>{c.name}</h2>
                    <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--muted)", margin: 0 }}>{c.note}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, margin: "22px auto 0", maxWidth: "60ch" }}>
            Room images are AI-generated illustrations to show a look — colour, tone, scale and finish vary; always confirm from a physical sample.
          </p>
        </section>

        {/* The interactive builder (renders its own heading) */}
        <VisionBoard />
      </main>
      <MarketingFooter />
      <style>{`@media(max-width:900px){.vb-collections{grid-template-columns:1fr 1fr!important}}@media(max-width:480px){.vb-collections{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
