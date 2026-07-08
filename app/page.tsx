import SiteNav from "./components/site/SiteNav";
import SiteFooter from "./components/site/SiteFooter";
import Eyebrow from "./components/ui/Eyebrow";
import Pill from "./components/ui/Pill";
import ShineHeading from "./components/ui/ShineHeading";
import Niche from "./components/ui/Niche";
import Reveal from "./components/ui/Reveal";
import MagneticButton from "./components/ui/MagneticButton";
import { getStats } from "../lib/content";
import { listRanges } from "../lib/onbase/client";
import styles from "./home.module.css";

// Marketing home. Content is placeholder-safe: with no OnBase API key yet,
// listRanges() returns [] and the collections band shows a graceful state.
export default async function Home() {
  const [stats, ranges] = await Promise.all([getStats(), listRanges()]);

  return (
    <div className={styles.page}>
      <SiteNav />

      {/* Hero */}
      <section className={`${styles.section} ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <Eyebrow>Sunshine Coast tile shop</Eyebrow>
          <ShineHeading
            as="h1"
            size="clamp(38px, 6.5vw, 68px)"
            text="Tiles worth"
            accent="lingering over."
          />
          <p className={styles.heroSub}>
            A new home for floor, wall and outdoor tiles in Baringa. Beautiful
            ranges, honest advice, and a showroom built for inspiration.
          </p>
          <div className={styles.heroCtas}>
            <MagneticButton href="/collections">
              Browse collections
            </MagneticButton>
            <MagneticButton href="/contact" variant="ghost">
              Visit the showroom
            </MagneticButton>
          </div>
        </div>
        <div className={styles.heroArt}>
          <Niche ratio="4 / 5" priority />
        </div>
      </section>

      {/* Collections */}
      <section className={styles.section}>
        <div className={styles.bandHead}>
          <Eyebrow>The ranges</Eyebrow>
          <ShineHeading text="Explore by" accent="collection." />
        </div>
        <div className={styles.grid}>
          {ranges.length === 0 ? (
            <div className={styles.empty}>
              Our collections are being curated - check back very soon.
            </div>
          ) : (
            ranges.slice(0, 6).map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.06} className={styles.card}>
                <Niche src={r.heroImage} alt={r.name} ratio="4 / 5" />
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

      {/* Why + stats */}
      <section className={styles.why}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <Pill tone="sea" dot>
              Why OnWood
            </Pill>
            <ShineHeading text="Local, independent," accent="and tile-obsessed." />
          </div>
          <div className={styles.stats}>
            {stats.map((s) => (
              <Reveal key={s.label} className={styles.stat}>
                <div className={styles.statValue}>
                  {s.value}
                  {s.suffix || ""}
                </div>
                <div className={styles.statLabel}>{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit CTA */}
      <section className={`${styles.section} ${styles.cta}`}>
        <ShineHeading text="Come and see them" accent="in person." />
        <p className={styles.heroSub} style={{ textAlign: "center" }}>
          Our Baringa showroom is the best way to feel the finishes. Pop in, or
          get in touch and we will help you plan your space.
        </p>
        <MagneticButton href="/contact">Get in touch</MagneticButton>
      </section>

      <SiteFooter />
    </div>
  );
}
