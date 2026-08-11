import Link from "next/link";
import Reveal from "../ui/Reveal";

// Homepage teaser for the Vision Board tool. Curated collection shots "fly in"
// (staggered reveals) beside a CTA into the full /vision-board builder — which
// lives on its own page so the homepage stays fast and the tool earns its own SEO.
const BOARDS: { src: string; label: string }[] = [
  { src: "/images/vision/coastal-kitchen-room.webp", label: "Coastal kitchen" },
  { src: "/images/vision/marrakesh-ensuite-room.webp", label: "Mediterranean ensuite" },
  { src: "/images/vision/coastal-powder-hero.webp", label: "Coastal powder room" },
  { src: "/images/vision/stackstone-living-room.webp", label: "Coastal living" },
  { src: "/images/vision/coastal-kitchen-hero.webp", label: "Kitchen detail" },
  { src: "/images/vision/marrakesh-ensuite-hero.webp", label: "Ensuite detail" },
];

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
        display: "grid",
        gridTemplateColumns: "0.92fr 1.08fr",
        gap: "clamp(28px,4vw,52px)",
        alignItems: "center",
        background: "linear-gradient(160deg,#f7f0e6,#efe3d1)",
        border: "1px solid var(--line)",
        borderRadius: 28,
        padding: "clamp(26px,3.5vw,48px)",
        overflow: "hidden",
      }}
    >
      <div>
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
              margin: "12px 0 14px",
              color: "var(--ink)",
            }}
          >
            Design your whole space, tile by tile.
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 440 }}>
            Lay real tiles, stone, timber, benchtops and tapware onto a live board and watch the look come together. Start from a warm Mediterranean or coastal collection, or build your own from scratch.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <Link
            href="/vision-board"
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
            Start your vision board <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>

      <div className="vbt-collage" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {BOARDS.map((b, i) => (
          <Reveal key={b.src} delay={0.05 * i}>
            <div
              style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                aspectRatio: "3 / 4",
                boxShadow: "0 18px 40px rgba(32,48,58,.18)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={`${b.label} vision board`}
                loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </Reveal>
        ))}
      </div>
      <style>{`@media(max-width:860px){.vbt-card{grid-template-columns:1fr!important}.vbt-collage{grid-template-columns:1fr 1fr 1fr!important}}@media(max-width:460px){.vbt-collage{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}
