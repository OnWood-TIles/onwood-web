// "Why OnWood" story section. Dark aegean band with a two-line headline, two
// body paragraphs, a three-stat count-up row, and an arched image mosaic on the
// right. Server component (CountUp + Reveal are the client leaves). Transcribed
// faithfully from .refwork/tiles-sections/08-section-why-onwood.html; copy/data
// from lib/content.ts (STORY).
import { STORY } from "../../../lib/content";
import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import styles from "./Story.module.css";

const sectionStyle: React.CSSProperties = {
  padding: "100px 40px",
  background: "linear-gradient(160deg,#1A5563,#123C46)",
  color: "#fff",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontWeight: 800,
  fontSize: "clamp(30px,4vw,50px)",
  letterSpacing: "-.02em",
  margin: "14px 0 20px",
  lineHeight: 1.02,
};

const pStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.72)",
  fontSize: "16px",
  lineHeight: 1.7,
  margin: "0 0 18px",
};

const statNumStyle: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontWeight: 900,
  fontSize: "clamp(34px,4vw,52px)",
  color: "var(--accent)",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,.6)",
  marginTop: "2px",
};

// Warm/tonal placeholder gradients for the three arched niches. Real tile
// photography drops into these slots later.
const mosaicFills = [
  "linear-gradient(160deg,#C8894B,#96632f)",
  "linear-gradient(150deg,#3f97a6,#1c4a54)",
  "linear-gradient(160deg,#d8c8ac,#a89372)",
];

export default function Story() {
  return (
    <section id="story" style={sectionStyle}>
      <div className={styles.wrap}>
        {/* Left: copy + stats */}
        <div>
          <Reveal>
            <div style={eyebrowStyle}>{STORY.eyebrow}</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 style={h2Style}>
              {STORY.headA}
              <br />
              {STORY.headB}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={pStyle}>{STORY.p1}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{ ...pStyle, margin: 0 }}>{STORY.p2}</p>
          </Reveal>

          <div className={styles.stats}>
            {STORY.stats.map((stat, i) => {
              const isPostcode = (stat as { isPostcode?: boolean }).isPostcode;
              return (
                <Reveal key={stat.label} delay={0.2 + i * 0.06}>
                  <div style={statNumStyle}>
                    {isPostcode ? (
                      // Postcode: render as-is (no thousands comma, no count-up
                      // easing that would read like a quantity).
                      <span>
                        {stat.to}
                        {stat.suffix}
                      </span>
                    ) : (
                      <CountUp to={stat.to} suffix={stat.suffix} />
                    )}
                  </div>
                  <div style={statLabelStyle}>{stat.label}</div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Right: arched image mosaic */}
        <div className={styles.mosaic}>
          <Reveal className={styles.cellTall}>
            <div
              className={styles.fill}
              style={{ background: mosaicFills[0] }}
              aria-hidden
            />
          </Reveal>
          <Reveal className={styles.cellSmall} delay={0.08}>
            <div
              className={styles.fill}
              style={{ background: mosaicFills[1] }}
              aria-hidden
            />
          </Reveal>
          <Reveal className={styles.cellSmall} delay={0.16}>
            <div
              className={styles.fill}
              style={{ background: mosaicFills[2] }}
              aria-hidden
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
