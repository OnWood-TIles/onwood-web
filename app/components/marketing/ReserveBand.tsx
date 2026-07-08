import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// "Seen one you like?" reserve CTA + legal disclaimer, matching the reference.
export default function ReserveBand() {
  const r = SPECIALS_PAGE.reserve;
  return (
    <section
      style={{
        padding: "80px 40px",
        maxWidth: 900,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Reveal>
        <h2
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 800,
            fontSize: "clamp(28px,3.6vw,44px)",
            letterSpacing: "-0.02em",
            margin: "0 0 14px",
            color: "var(--ink)",
          }}
        >
          {r.title}
        </h2>
      </Reveal>
      <Reveal delay={0.06}>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: "0 0 26px",
          }}
        >
          {r.sub}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <a
          href="/#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            background: "var(--ink)",
            color: "#fff",
            fontWeight: 800,
            padding: "16px 30px",
            borderRadius: 100,
            fontSize: 15,
          }}
        >
          {r.cta} →
        </a>
      </Reveal>
      <Reveal delay={0.14}>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 12.5,
            lineHeight: 1.6,
            margin: "34px auto 0",
            maxWidth: 660,
          }}
        >
          {SPECIALS_PAGE.disclaimer}
        </p>
      </Reveal>
    </section>
  );
}
