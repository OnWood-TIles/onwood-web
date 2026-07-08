import type { Metadata } from "next";
import Eyebrow from "../components/ui/Eyebrow";
import Pill from "../components/ui/Pill";
import ShineHeading from "../components/ui/ShineHeading";
import GlassCard from "../components/ui/GlassCard";
import Niche from "../components/ui/Niche";
import Reveal from "../components/ui/Reveal";
import MagneticButton from "../components/ui/MagneticButton";
import ThemeToggle from "../components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Kitchen Sink",
  robots: { index: false, follow: false },
};

// Internal preview of the design kit across themes. Reachable only behind the
// preview gate; noindex.
export default function KitchenSink() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-manrope), sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Eyebrow>Design kit</Eyebrow>
          <ThemeToggle />
        </div>

        <ShineHeading
          as="h1"
          text="Every piece,"
          accent="in every theme."
          size="clamp(30px, 5vw, 48px)"
        />

        <Section title="Pills / badges">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Pill>Neutral</Pill>
            <Pill tone="accent" dot>
              Terracotta
            </Pill>
            <Pill tone="sea" dot>
              Aegean
            </Pill>
          </div>
        </Section>

        <Section title="Buttons">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <MagneticButton href="#">Solid magnetic</MagneticButton>
            <MagneticButton href="#" variant="ghost">
              Ghost magnetic
            </MagneticButton>
          </div>
        </Section>

        <Section title="Glass card">
          <GlassCard style={{ padding: 24, maxWidth: 360 }}>
            <ShineHeading text="A frosted" accent="surface." size="22px" />
            <p style={{ color: "var(--color-muted)", marginBottom: 0 }}>
              Matches the coming-soon language, theme-aware.
            </p>
          </GlassCard>
        </Section>

        <Section title="Niche (arched frame)">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ width: 200 }}>
              <Niche ratio="3 / 4" />
            </div>
            <div style={{ width: 200 }}>
              <Niche ratio="1 / 1" />
            </div>
          </div>
        </Section>

        <Section title="Reveal (scroll in)">
          <Reveal>
            <GlassCard style={{ padding: 20, maxWidth: 360 }}>
              This card faded up on scroll.
            </GlassCard>
          </Reveal>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ margin: "40px 0" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}
