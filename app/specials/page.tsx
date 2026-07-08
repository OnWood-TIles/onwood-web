import type { Metadata } from "next";
import PageShell from "../components/site/PageShell";
import Countdown from "../components/site/Countdown";
import Eyebrow from "../components/ui/Eyebrow";
import ShineHeading from "../components/ui/ShineHeading";
import GlassCard from "../components/ui/GlassCard";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Specials",
  description:
    "This month's tile specials at OnWood Tiles - limited-time offers on selected floor, wall and outdoor ranges.",
};

// Specials frame is marketing (constants/Payload later); live was/now pricing
// is pulled from OnBase per the "prices on specials only" decision - wired in
// once the Website Catalogue endpoints are live.
export default function SpecialsPage() {
  return (
    <PageShell>
      <section className={styles.section} style={{ textAlign: "center" }}>
        <div className={styles.bandHead}>
          <Eyebrow>This month only</Eyebrow>
          <ShineHeading as="h1" text="Specials worth" accent="grabbing." />
        </div>
        <div style={{ margin: "8px 0 40px" }}>
          <Countdown />
          <p style={{ color: "var(--color-muted)", marginTop: 14, fontSize: 14 }}>
            Offers end when the month does.
          </p>
        </div>

        <GlassCard
          style={{
            maxWidth: 620,
            margin: "0 auto",
            padding: "40px 28px",
          }}
        >
          <ShineHeading text="Fresh deals are" accent="on the way." size="24px" />
          <p style={{ color: "var(--color-muted)", margin: "12px 0 0" }}>
            We are lining up this month's specials now. Sign up or drop by the
            Baringa showroom to be first to hear about them.
          </p>
        </GlassCard>
      </section>
    </PageShell>
  );
}
