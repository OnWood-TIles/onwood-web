import type { Metadata } from "next";
import PageShell from "../components/site/PageShell";
import Eyebrow from "../components/ui/Eyebrow";
import ShineHeading from "../components/ui/ShineHeading";
import Niche from "../components/ui/Niche";
import { getTeam } from "../../lib/content";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "OnWood Tiles is a locally owned, independent tile shop on the Sunshine Coast, built on honest advice and beautiful ranges.",
};

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <PageShell>
      <section className={`${styles.section} ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <Eyebrow>Our story</Eyebrow>
          <ShineHeading as="h1" text="Locally owned," accent="tile-obsessed." />
          <p className={styles.heroSub}>
            OnWood Tiles is an independent Sunshine Coast tile shop. We believe
            choosing tiles should be a pleasure - honest advice, a beautiful
            showroom, and ranges we are genuinely proud of.
          </p>
        </div>
        <div className={styles.heroArt}>
          <Niche ratio="4 / 5" />
        </div>
      </section>

      {team.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.bandHead}>
            <Eyebrow>The team</Eyebrow>
            <ShineHeading text="The people behind" accent="the tiles." />
          </div>
          <div className={styles.grid}>
            {team.map((m) => (
              <div key={m.name} className={styles.card}>
                <Niche ratio="1 / 1" />
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{m.name}</h3>
                  <p className={styles.cardMeta}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
