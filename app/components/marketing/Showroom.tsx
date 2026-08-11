import { SHOWROOM } from "../../../lib/content";
import { listRanges, type WebsiteRange } from "../../../lib/onbase/client";
import { imageAlt } from "../../../lib/alt";
import Reveal from "../ui/Reveal";
import VisionBoardTeaser from "./VisionBoardTeaser";
import styles from "./Showroom.module.css";

// Section 07 - Showroom. Centred head, a wide arched niche + a 3-up row of
// arched niches, then the vision-board head and the interactive <VisionBoard/>.
// The four niches show real "see it installed" room photos pulled from the
// catalogue feed (same source the /gallery uses); a warm gradient stands in only
// when the feed returns nothing.
// Server component (the interactive board lives in its client child).

// Subtle warm gradient stand-in for a photo slot (used only when the feed is empty).
const NICHE_BG =
  "linear-gradient(160deg, color-mix(in srgb, var(--accent) 12%, var(--surface)), color-mix(in srgb, var(--accent2) 9%, var(--surface)))";

const EYEBROW_SEA: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--sea)",
};

const EYEBROW_ACCENT: React.CSSProperties = {
  ...EYEBROW_SEA,
  color: "var(--accent)",
};

const SUB_STYLE: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 15,
  maxWidth: 560,
  margin: "0 auto",
};

type Niche = { src: string; alt: string } | null;

// Gather "see it installed" room shots from the catalogue feed (tiles + stone),
// spread across the pool so the niches feel varied rather than near-identical
// colourways of one range. Returns up to `count` niches; missing slots are null
// (the caller renders a tasteful gradient there).
async function pickNiches(count: number): Promise<Niche[]> {
  const ranges: WebsiteRange[] = await listRanges().catch(() => []);
  const shots: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  for (const r of ranges) {
    for (const sw of r.swatches ?? []) {
      if (!sw.installedImage || seen.has(sw.installedImage)) continue;
      seen.add(sw.installedImage);
      shots.push({ src: sw.installedImage, alt: imageAlt(r, { swatch: sw, kind: "installed" }) });
    }
  }
  if (!shots.length) return Array.from({ length: count }, () => null);
  // Even spread across the whole pool so consecutive niches don't repeat a range.
  return Array.from({ length: count }, (_, i) => shots[Math.floor((i / count) * shots.length)] ?? null);
}

// Shared arched-niche <img> / gradient fill (preserves the reference aesthetic).
function nicheFill(niche: Niche) {
  if (niche) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={niche.src}
        alt={niche.alt}
        loading="lazy"
        decoding="async"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return <div aria-hidden style={{ position: "absolute", inset: 0, background: NICHE_BG }} />;
}

export default async function Showroom() {
  // Four niches: one wide hero + a 3-up row.
  const [wide, ...small] = await pickNiches(4);
  return (
    <section
      id="showroom"
      data-screen-label="Showroom"
      style={{ padding: "110px 40px", maxWidth: 1240, margin: "0 auto" }}
    >
      {/* Head */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Reveal>
          <div style={EYEBROW_SEA}>{SHOWROOM.eyebrow}</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,4vw,52px)",
              letterSpacing: "-.02em",
              margin: "12px 0 8px",
            }}
          >
            {SHOWROOM.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={SUB_STYLE}>{SHOWROOM.sub}</p>
        </Reveal>
      </div>

      {/* Niches */}
      <div style={{ display: "grid", gap: 20, marginBottom: 56 }}>
        <Reveal>
          <div
            style={{
              position: "relative",
              borderRadius: "220px 220px 22px 22px",
              overflow: "hidden",
              height: "clamp(240px,32vw,360px)",
              boxShadow: "0 26px 60px rgba(32,48,58,.13)",
              background: NICHE_BG,
            }}
          >
            {nicheFill(wide)}
          </div>
        </Reveal>
        <div className={styles.row}>
          {small.map((niche, i) => (
            <Reveal key={niche?.src ?? i} delay={0.05 * (i + 1)}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "180px 180px 18px 18px",
                  overflow: "hidden",
                  height: "clamp(260px,26vw,360px)",
                  boxShadow: "0 20px 46px rgba(32,48,58,.1)",
                  background: NICHE_BG,
                }}
              >
                {nicheFill(niche)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Vision-board teaser — the full builder lives on /vision-board */}
      <VisionBoardTeaser />
    </section>
  );
}
