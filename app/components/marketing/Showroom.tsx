import { SHOWROOM } from "../../../lib/content";
import Reveal from "../ui/Reveal";
import VisionBoard from "./VisionBoard";
import styles from "./Showroom.module.css";

// Section 07 - Showroom. Centred head, a wide arched niche + a 3-up row of
// arched niches, then the vision-board head and the interactive <VisionBoard/>.
// Image slots render as arched placeholder divs (warm gradient) with the exact
// radii from the reference; real photography gets wired in later.
// Server component (the interactive board lives in its client child).

// Subtle warm gradient stand-ins for the photo slots.
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

// Short accessibility labels for the placeholder slots (not marketing copy).
const SMALL_NICHES: { label: string }[] = [
  { label: "Showroom detail placeholder" },
  { label: "Tiled room placeholder" },
  { label: "Display wall placeholder" },
];

export default function Showroom() {
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
            role="img"
            aria-label="Wide showroom photo placeholder"
            style={{
              position: "relative",
              borderRadius: "220px 220px 22px 22px",
              overflow: "hidden",
              height: "clamp(240px,32vw,360px)",
              boxShadow: "0 26px 60px rgba(32,48,58,.13)",
              background: NICHE_BG,
            }}
          />
        </Reveal>
        <div className={styles.row}>
          {SMALL_NICHES.map((n, i) => (
            <Reveal key={n.label} delay={0.05 * (i + 1)}>
              <div
                role="img"
                aria-label={n.label}
                style={{
                  position: "relative",
                  borderRadius: "180px 180px 18px 18px",
                  overflow: "hidden",
                  height: "clamp(260px,26vw,360px)",
                  boxShadow: "0 20px 46px rgba(32,48,58,.1)",
                  background: NICHE_BG,
                }}
              />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Interactive vision board (client) - renders its own heading */}
      <VisionBoard />
    </section>
  );
}
