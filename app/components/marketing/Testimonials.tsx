import { TESTIMONIALS_HEAD, TESTIMONIALS } from "../../../lib/content";
import Reveal from "../ui/Reveal";
import styles from "./Testimonials.module.css";

// Section 09 - Testimonials. Centred head (eyebrow accent2 + h2) over a 3-up
// grid of quote cards, each a <figure> with a five-star row, a Newsreader
// italic blockquote and a name / place figcaption. Cards stagger in on scroll.
// Server component (no interactivity of its own).

const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--accent2)",
};

export default function Testimonials() {
  return (
    <section style={{ padding: "110px 40px", maxWidth: 1240, margin: "0 auto" }}>
      {/* Head */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <Reveal>
          <div style={EYEBROW_STYLE}>{TESTIMONIALS_HEAD.eyebrow}</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,4vw,52px)",
              letterSpacing: "-.02em",
              margin: "12px 0 0",
            }}
          >
            {TESTIMONIALS_HEAD.title}
          </h2>
        </Reveal>
      </div>

      {/* Quote cards */}
      <div className={styles.grid}>
        {TESTIMONIALS.map((q, i) => (
          <Reveal key={q.name} delay={i * 0.08}>
            <figure
              style={{
                margin: 0,
                padding: 28,
                borderRadius: 18,
                background: "var(--surface)",
                border: "1px solid var(--line)",
              }}
            >
              <div
                aria-label="Five out of five stars"
                style={{
                  color: "var(--accent)",
                  fontSize: 22,
                  letterSpacing: "2px",
                }}
              >
                <span aria-hidden>★★★★★</span>
              </div>
              <blockquote
                style={{
                  fontFamily: "var(--font-newsreader)",
                  fontStyle: "italic",
                  fontSize: 19,
                  lineHeight: 1.5,
                  margin: "14px 0 18px",
                  color: "var(--ink)",
                }}
              >
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption style={{ fontSize: 13.5, color: "var(--muted)" }}>
                <strong style={{ color: "var(--ink)" }}>{q.name}</strong> ·{" "}
                {q.place}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
