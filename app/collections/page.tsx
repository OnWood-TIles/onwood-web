import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../components/site/PageShell";
import Eyebrow from "../components/ui/Eyebrow";
import ShineHeading from "../components/ui/ShineHeading";
import Niche from "../components/ui/Niche";
import Reveal from "../components/ui/Reveal";
import { listRanges } from "../../lib/onbase/client";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse OnWood Tiles collections - floor, wall, splashback and outdoor tiles in a range of colours and finishes.",
};

export default async function CollectionsPage() {
  const ranges = await listRanges();

  return (
    <PageShell>
      <section className={styles.section}>
        <div className={styles.bandHead}>
          <Eyebrow>The ranges</Eyebrow>
          <ShineHeading as="h1" text="Our tile" accent="collections." />
        </div>
        <div className={styles.grid}>
          {ranges.length === 0 ? (
            <div className={styles.empty}>
              Our collections are being curated - check back very soon, or get
              in touch and we will help you find the perfect tile.
            </div>
          ) : (
            ranges.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.05} className={styles.card}>
                <Link href={`/collections/${r.slug}`} aria-label={r.name}>
                  <Niche src={r.heroImage} alt={r.name} ratio="4 / 5" />
                </Link>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{r.name}</h3>
                  <p className={styles.cardMeta}>
                    {r.category ? `${r.category} - ` : ""}
                    {r.swatches?.length ?? 0} colour
                    {(r.swatches?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
