import { TEAM, TEAM_HEAD } from "../../../lib/content";
import Reveal from "../ui/Reveal";
import styles from "./Team.module.css";

// Section 10 - Team. Centred head + a 4-up row of team cards, each an arched
// portrait placeholder (170px 170px 18px 18px) with a name (Archivo 800) and a
// muted role. Names in content are intentional placeholders. Image slots render
// as arched placeholder divs (sea-tinted); real portraits get wired in later.
// Server component (reveals live in their client child).

const EYEBROW_SEA: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 700,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--sea)",
};

export default function Team() {
  return (
    <section
      id="team"
      data-screen-label="Team"
      style={{ padding: "110px 40px", maxWidth: 1240, margin: "0 auto" }}
    >
      {/* Head */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <Reveal>
          <div style={EYEBROW_SEA}>{TEAM_HEAD.eyebrow}</div>
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
            {TEAM_HEAD.title}
          </h2>
        </Reveal>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {TEAM.map((member, i) => (
          <Reveal key={i} delay={0.05 * (i + 1)}>
            <figure style={{ margin: 0, textAlign: "center" }}>
              <div
                role="img"
                aria-label="Team portrait placeholder"
                style={{
                  aspectRatio: "3 / 4",
                  position: "relative",
                  borderRadius: "170px 170px 18px 18px",
                  overflow: "hidden",
                  boxShadow: "0 20px 46px rgba(32,48,58,.12)",
                  background:
                    "color-mix(in oklab, var(--sea) 8%, var(--surface))",
                }}
              />
              <figcaption style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {member.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {member.role}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
