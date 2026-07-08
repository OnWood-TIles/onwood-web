import type { Metadata } from "next";
import PageShell from "../components/site/PageShell";
import Eyebrow from "../components/ui/Eyebrow";
import ShineHeading from "../components/ui/ShineHeading";
import Niche from "../components/ui/Niche";
import Reveal from "../components/ui/Reveal";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Showroom",
  description:
    "Visit the OnWood Tiles showroom in Baringa on the Sunshine Coast - see and feel the finishes in person.",
};

// Arched-niche gallery. Images come from the CMS gallery later; placeholder
// niches for now.
export default function ShowroomPage() {
  return (
    <PageShell>
      <section className={styles.section}>
        <div className={styles.bandHead}>
          <Eyebrow>Baringa, Sunshine Coast</Eyebrow>
          <ShineHeading as="h1" text="Step into the" accent="showroom." />
          <p
            className={styles.heroSub}
            style={{ textAlign: "center", maxWidth: "52ch" }}
          >
            The best way to choose a tile is to see it in the light and feel the
            finish. Come and explore our ranges in person.
          </p>
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Niche ratio={i % 2 === 0 ? "3 / 4" : "1 / 1"} />
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
