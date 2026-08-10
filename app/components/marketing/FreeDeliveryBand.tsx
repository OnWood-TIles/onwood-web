import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Store-wide "free delivery across the Sunshine Coast" perk - a filled ink panel so
// it reads as a headline offer rather than just another special card.
export default function FreeDeliveryBand() {
  const d = SPECIALS_PAGE.freeDelivery;
  return (
    <section style={{ padding: "10px 40px 30px", maxWidth: 940, margin: "0 auto" }}>
      <Reveal>
        <div
          style={{
            borderRadius: 24,
            background: "var(--ink)",
            color: "#fff",
            padding: "clamp(26px,4vw,42px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 24,
            boxShadow: "0 24px 60px rgba(32,48,58,.22)",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
              {d.badge}
            </div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              {d.title}
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,.72)", fontSize: 15, lineHeight: 1.55, maxWidth: 520 }}>
              {d.sub}
            </p>
          </div>
          <a
            href="/contact"
            style={{ flexShrink: 0, textDecoration: "none", background: "#fff", color: "var(--ink)", fontWeight: 800, padding: "14px 26px", borderRadius: 100, fontSize: 15 }}
          >
            {d.cta} →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
