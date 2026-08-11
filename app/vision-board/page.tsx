import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import VisionBoard from "../components/marketing/VisionBoard";

export const metadata: Metadata = {
  title: "Vision Board — design your space online",
  description:
    "Build your look with OnWood Tiles' free vision board: lay real tiles, natural stone, timber, benchtops and tapware onto a live board and see it come together. A Sunshine Coast tile studio in Baringa.",
};

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
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,15vw,140px) 40px 8px", textAlign: "center" }}>
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
              Lay real tiles, natural stone, timber, benchtops and tapware onto a live board and see the whole look come together. Pick from across the range, arrange your board, then send it to yourself or bring it in to the showroom.
            </p>
          </Reveal>
        </section>

        {/* The interactive builder (renders its own heading) */}
        <VisionBoard />
      </main>
      <MarketingFooter />
    </div>
  );
}
