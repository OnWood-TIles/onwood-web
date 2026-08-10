import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Free-delivery perk, image-forward: the (AI-generated) truck-of-tiles photo fills
// the band with a dark left scrim so the offer + CTA read clearly on top.
export default function FreeDeliveryBand() {
  const d = SPECIALS_PAGE.freeDelivery;
  return (
    <section style={{ padding: "8px 40px 34px", maxWidth: 1080, margin: "0 auto" }}>
      <Reveal>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            minHeight: 340,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 24px 60px rgba(32,48,58,.2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${d.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#b7936a",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(20,30,36,.9) 0%, rgba(20,30,36,.62) 42%, rgba(20,30,36,.05) 78%)",
            }}
          />
          <div style={{ position: "relative", padding: "clamp(28px,5vw,52px)", maxWidth: 520, color: "#fff" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e6a077", marginBottom: 10 }}>
              {d.badge}
            </div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.03, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
              {d.title}
            </h2>
            <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,.82)", fontSize: 15.5, lineHeight: 1.55, maxWidth: 440 }}>
              {d.sub}
            </p>
            <a
              href="/contact"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#fff", color: "var(--ink)", fontWeight: 800, padding: "14px 26px", borderRadius: 100, fontSize: 15 }}
            >
              {d.cta} →
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
