// Marquee ticker of tile finishes. Pure-CSS infinite scroll (keyframe
// `owMarquee` lives in app/globals.css). Server component: no hooks/handlers,
// so it can safely import the server-only content module. Reduced-motion is
// honoured by the globals rule that disables animation on [class*="marquee"];
// with the band's overflow:hidden the row simply sits static.
import type { CSSProperties } from "react";
import { MARQUEE } from "../../../lib/content";

const band: CSSProperties = {
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
  padding: "18px 0",
  overflow: "hidden",
  background: "var(--surface)",
};

const track: CSSProperties = {
  display: "flex",
  width: "max-content",
  alignItems: "center",
  whiteSpace: "nowrap",
  animation: "owMarquee 30s linear infinite",
  fontFamily: "var(--font-archivo)",
  fontWeight: 600,
  letterSpacing: ".05em",
  fontSize: 18,
  textTransform: "uppercase",
  color: "var(--ink)",
};

const bullet: CSSProperties = { margin: "0 22px", color: "var(--accent)" };

// One run of the finishes: each label followed by an accent bullet. Two
// identical runs are laid side by side and translated 0 -> -50% for a seamless
// loop (spacing is carried by the bullet margins, not flex gap, so the wrap
// point matches the internal rhythm exactly). The duplicate run is hidden from
// assistive tech so the finishes are announced only once.
function run(copy: number) {
  return MARQUEE.flatMap((label, i) => [
    <span key={`w-${copy}-${i}`} aria-hidden={copy === 1 ? true : undefined}>
      {label}
    </span>,
    <span key={`b-${copy}-${i}`} aria-hidden="true" style={bullet}>
      &bull;
    </span>,
  ]);
}

export default function Marquee() {
  return (
    <div style={band} aria-label="OnWood Tiles finishes">
      <div className="ow-marquee" style={track}>
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
