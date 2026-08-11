import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Dark teal "whole-home package" band. The title spans the top; below it the room
// image sits beside the price + inclusions. On mobile it stacks — title, then a
// LARGE image, then the details — so the hero never shrinks to a silly sliver.
export default function PackageDeal() {
  const p = SPECIALS_PAGE.package;
  return (
    <section
      style={{
        padding: "clamp(56px,8vw,90px) clamp(20px,5vw,40px)",
        background: "linear-gradient(160deg,#1A5563,#123C46)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Header — spans the full width across the top */}
        <Reveal>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7FD0DE" }}>
            {p.eyebrow}
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,5vw,50px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.02,
              margin: "12px 0 14px",
              maxWidth: 820,
            }}
          >
            {p.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 16, lineHeight: 1.7, margin: "0 0 clamp(26px,4vw,40px)", maxWidth: 620 }}>
            {p.sub}
          </p>
        </Reveal>

        {/* Body — the room image beside the price + inclusions */}
        <div
          className="pkg-grid"
          style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: "clamp(28px,4vw,52px)", alignItems: "center" }}
        >
          <Reveal delay={0.08}>
            <div
              role="img"
              aria-label={p.imageAlt}
              className="pkg-img"
              style={{
                position: "relative",
                borderRadius: 22,
                overflow: "hidden",
                height: "clamp(300px,42vw,460px)",
                boxShadow: "0 30px 70px rgba(0,0,0,.35)",
                backgroundImage: `url(${p.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#d8c8ac",
              }}
            />
          </Reveal>
          <div>
            <Reveal delay={0.12}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "0 0 22px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontWeight: 900,
                    fontSize: "clamp(38px,6vw,58px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7FD0DE" }}>
                  {p.priceNote}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "grid", gap: 10, fontSize: 15, color: "rgba(255,255,255,.9)" }}>
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
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
        </div>
      </div>
      {/* On mobile: stack, and let the image go large (not a sliver). */}
      <style>{`@media(max-width:820px){.pkg-grid{grid-template-columns:1fr!important}.pkg-img{height:clamp(260px,64vw,420px)!important}}`}</style>
    </section>
  );
}
