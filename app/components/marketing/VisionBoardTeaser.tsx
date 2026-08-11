import Link from "next/link";
import Reveal from "../ui/Reveal";
import AmbientDriftBoard from "./AmbientDriftBoard";
import { TEASER_BOARDS } from "../../../lib/heroBoards";

// Homepage teaser for the Vision Board tool. The card is topped with the real
// Antikella (536) benchtop stone; the 4 NEW AI collections fly in over it (room +
// hero images large, plus each look's tiles at true aspect, no benchtop chip),
// exactly like the hero banner. A warm gradient keeps the header readable over the
// dark stone. Centred CTA into the full /vision-board builder.
const eyebrow: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--accent)",
};

export default function VisionBoardTeaser() {
  return (
    <div
      className="vbt-card"
      style={{
        marginTop: 60,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        border: "1px solid var(--line)",
        backgroundColor: "#2b2723",
        backgroundImage: "url(/images/stone/536.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Warm gradient so the header/body read over the Antikella stone, clearing
          to reveal the stone as the board's benchtop below. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(247,240,230,.97) 0%, rgba(247,240,230,.93) 20%, rgba(247,240,230,.5) 36%, rgba(247,240,230,0) 55%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", padding: "clamp(28px,4vw,52px)", textAlign: "center" }}>
        <Reveal>
          <div style={eyebrow}>Vision board</div>
        </Reveal>
        <Reveal delay={0.06}>
          <h3
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(26px,3.4vw,42px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.04,
              margin: "12px 0 12px",
              color: "var(--ink)",
            }}
          >
            Design your whole space, tile by tile.
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ color: "#4a5560", fontSize: 16, lineHeight: 1.7, margin: "0 auto", maxWidth: 600 }}>
            Watch real tiles, natural stone, timber and tapware fly onto a live Antikella-topped board and come together, look by look. Start from a warm Mediterranean or coastal collection, or build your own.
          </p>
        </Reveal>

        <div style={{ position: "relative", marginTop: 10, display: "flex", justifyContent: "center" }}>
          <AmbientDriftBoard boards={TEASER_BOARDS} maxW={560} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <Link
              href="/vision-board"
              className="vbt-cta"
              style={{
                pointerEvents: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "clamp(14px,1.7vw,16px)",
                padding: "15px 26px",
                borderRadius: 100,
                boxShadow: "0 20px 50px rgba(0,0,0,.5), 0 0 0 6px rgba(255,255,255,.5)",
                maxWidth: 260,
                textAlign: "center",
                lineHeight: 1.25,
              }}
            >
              Start Your Vision Board Here <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes vbtPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
        .vbt-cta{animation:vbtPulse 2.8s ease-in-out infinite;transition:transform .2s ease}
        .vbt-cta:hover{transform:scale(1.06)!important;animation:none}
        @media(prefers-reduced-motion:reduce){.vbt-cta{animation:none}}
      `}</style>
    </div>
  );
}
