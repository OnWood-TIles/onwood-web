// Bunnings-style Dulux paint chip (fan-deck hang-tag look): full colour card
// with a punch hole up top and a floating white name pill. The name is centred
// and auto-shrinks by length so even long names stay inside the pill and look
// professional. Fills its parent (parent sets the size).
//
// Reused by the Laminex "Cabinetry" tab: pass `image` (woodgrain photo) for the
// card face and `brandLogo` for a small corner brand tag (like the carpet badge).
import { BrandBadge } from "./CarpetSwatch";

// Font size steps down as the name gets longer so it never runs out of the pill.
export function paintNameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 9) return 13.5;
  if (n <= 14) return 12.5;
  if (n <= 19) return 11.5;
  return 10.5;
}

export function PaintChipFace({
  name,
  hex,
  image,
  brandLogo,
  showLabel = true,
}: {
  name: string;
  hex: string;
  image?: string; // woodgrain/texture fill (Laminex) instead of a solid colour
  brandLogo?: string; // small corner brand tag (e.g. Laminex), like the carpet badge
  showLabel?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 11,
        // Shadow lives on this (unmasked) wrapper so the punched hole below — which
        // masks the colour layer — doesn't clip the drop shadow.
        boxShadow:
          "0 3px 6px rgba(30,22,15,.20), 0 12px 24px rgba(30,22,15,.22), 0 28px 48px rgba(30,22,15,.15)",
      }}
    >
      {/* Colour / texture card with a REAL punched hole (transparent centre, so the
          board shows through like a fan-deck hang tag). A white-on-transparent mask
          reads correctly in BOTH alpha and luminance mask modes. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 11,
          background: hex,
          ...(image
            ? {
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
          border: "1px solid rgba(0,0,0,.16)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.22)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 18px, transparent 7.6px, #fff 8.6px)",
          maskImage:
            "radial-gradient(circle at 50% 18px, transparent 7.6px, #fff 8.6px)",
        }}
      />
      {/* punched-hole depth ring (transparent centre) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 11,
          left: "50%",
          transform: "translateX(-50%)",
          width: 15,
          height: 15,
          borderRadius: "50%",
          boxShadow:
            "inset 0 1.5px 2.5px rgba(0,0,0,.5), 0 1px 0 rgba(255,255,255,.45)",
        }}
      />
      {/* brand tag (e.g. Laminex) - small, so it clears the centre punch hole;
          hides with the labels, like the carpet badge */}
      {brandLogo && showLabel ? <BrandBadge logo={brandLogo} h={8} /> : null}
      {/* floating white name pill (centred, auto-fit, max 2 lines) */}
      {showLabel ? (
        <div
          style={{
            position: "absolute",
            left: 11,
            right: 11,
            bottom: 11,
            background: "#fff",
            borderRadius: 9,
            padding: "8px 8px",
            boxShadow: "0 5px 14px rgba(0,0,0,.22)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: paintNameSize(name),
              fontWeight: 700,
              color: "#20303a",
              lineHeight: 1.12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {name}
          </div>
        </div>
      ) : null}
    </div>
  );
}
