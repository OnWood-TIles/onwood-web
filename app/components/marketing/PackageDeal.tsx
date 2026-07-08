import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Dark teal "whole-home package" band, matching the reference.
export default function PackageDeal() {
  const p = SPECIALS_PAGE.package;
  return (
    <section
      style={{
        padding: "90px 40px",
        background: "linear-gradient(160deg,#1A5563,#123C46)",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
        }}
        className="pkg-grid"
      >
        <div>
          <Reveal>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#7FD0DE",
              }}
            >
              {p.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(30px,4vw,50px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.02,
                margin: "14px 0 16px",
              }}
            >
              {p.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              style={{
                color: "rgba(255,255,255,.8)",
                fontSize: 16,
                lineHeight: 1.7,
                margin: "0 0 24px",
              }}
            >
              {p.sub}
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <ul
              style={{
                listStyle: "none",
                margin: "0 0 28px",
                padding: 0,
                display: "grid",
                gap: 10,
                fontSize: 15,
                color: "rgba(255,255,255,.9)",
              }}
            >
              {p.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.18}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 26,
              }}
            >
              <span style={{ fontSize: 15, color: "rgba(255,255,255,.7)" }}>from</span>
              <span
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontWeight: 900,
                  fontSize: "clamp(38px,5vw,58px)",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {p.from}
              </span>
              <span style={{ fontSize: 16, color: "rgba(255,255,255,.7)" }}>{p.fromNote}</span>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <a
              href="/#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 800,
                padding: "16px 28px",
                borderRadius: 100,
                fontSize: 15,
                boxShadow: "0 16px 40px rgba(208,106,69,.34)",
              }}
            >
              {p.cta} →
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div
            style={{
              position: "relative",
              borderRadius: "200px 200px 22px 22px",
              overflow: "hidden",
              height: "clamp(320px,38vw,480px)",
              boxShadow: "0 30px 70px rgba(0,0,0,.35)",
              background: "linear-gradient(160deg,#d8c8ac,#a89372)",
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}
