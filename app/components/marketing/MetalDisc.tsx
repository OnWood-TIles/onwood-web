// Circular metal object for the vision board, rendered by FINISH:
//  - polished: mirror sheen, strong specular highlight + high-contrast spin
//  - brushed:  matte base + fine brush striations, soft even sheen (no mirror)
//  - satin:    smooth, gentle sheen, low-contrast spin (no brush lines)
//  - matte:    flat, no specular shine at all
//  - antique:  weathered/patina, muted, uneven, low sheen (aged, less varnished)
import type { CSSProperties } from "react";
import type { MetalFinish } from "../../../lib/metals";

// Fallback brushed grain (grey, tinted) for any brushed metal without its own
// real texture. Real per-metal textures are provided via each metal's `texture`.
const BRUSHED_GRAIN = "/images/brushed-grain.png";
// Real weathered patina (grayscale, from an aged-copper sample) overlaid on the
// antique metals that don't have their own colour texture.
const PATINA = "/images/metals/patina.png";
// Domed depth for a flat photographic texture (top rim highlight + base shade).
const TEXTURE_SHADOW =
  "0 12px 26px rgba(0,0,0,.3), inset 0 2px 4px rgba(255,255,255,.32), inset 0 -10px 18px rgba(0,0,0,.26)";

// Layered CSS background for the disc, per finish. First layer = topmost.
export function metalBackground(
  finish: MetalFinish,
  light: string,
  mid: string,
  dark: string,
): string {
  switch (finish) {
    case "polished":
      return (
        `radial-gradient(circle at 34% 26%, rgba(255,255,255,.8), rgba(255,255,255,0) 40%), ` +
        `conic-gradient(from 210deg, ${dark}, ${light}, ${mid}, ${light}, ${dark}, ${mid}, ${light}, ${mid}, ${dark})`
      );
    case "brushed":
      // Just the even satin base + gentle vertical centre sheen; the actual
      // brush grain is a real texture overlaid in metalDiscStyle().
      return `linear-gradient(90deg, ${mid} 0%, ${light} 50%, ${mid} 100%)`;
    case "satin":
      return (
        `radial-gradient(circle at 36% 30%, rgba(255,255,255,.32), rgba(255,255,255,0) 55%), ` +
        `conic-gradient(from 215deg, ${mid}, ${light}, ${mid}, ${dark}, ${mid}, ${light}, ${mid}, ${dark}, ${mid})`
      );
    case "matte":
      // flat, no specular hit
      return `radial-gradient(circle at 50% 45%, ${light}, ${mid} 60%, ${dark})`;
    case "antique":
      // uneven patina + weathering patches, muted base, minimal sheen
      return (
        `radial-gradient(circle at 68% 72%, rgba(0,0,0,.24), rgba(0,0,0,0) 42%), ` +
        `radial-gradient(circle at 30% 34%, rgba(255,255,255,.09), rgba(255,255,255,0) 45%), ` +
        `radial-gradient(circle at 44% 60%, ${dark}, rgba(0,0,0,0) 58%), ` +
        `linear-gradient(150deg, ${light}, ${mid} 52%, ${dark})`
      );
  }
}

// Depth shadow per finish - polished has a bright inset highlight; matte/antique
// almost none.
export function metalShadow(finish: MetalFinish): string {
  switch (finish) {
    case "polished":
      return "0 12px 26px rgba(0,0,0,.3), inset 0 2px 4px rgba(255,255,255,.6), inset 0 -8px 16px rgba(0,0,0,.3)";
    case "brushed":
      // bright rim bevel (inset ring) + soft edge shade, matte body
      return "0 10px 22px rgba(0,0,0,.26), inset 0 0 0 1px rgba(255,255,255,.22), inset 0 -7px 14px rgba(0,0,0,.2)";
    case "satin":
      return "0 11px 24px rgba(0,0,0,.28), inset 0 1px 2px rgba(255,255,255,.4), inset 0 -7px 13px rgba(0,0,0,.24)";
    case "matte":
      return "0 9px 20px rgba(0,0,0,.22), inset 0 1px 1px rgba(255,255,255,.14), inset 0 -5px 10px rgba(0,0,0,.16)";
    case "antique":
      return "0 9px 20px rgba(0,0,0,.24), inset 0 1px 1px rgba(255,255,255,.12), inset 0 -6px 12px rgba(0,0,0,.22)";
  }
}

// Full disc styling per finish. Brushed layers the real grain texture over the
// base with an overlay blend (so it tints to the metal's own colour); other
// finishes just use their gradient.
export function metalDiscStyle(
  finish: MetalFinish,
  light: string,
  mid: string,
  dark: string,
  texture?: string,
): CSSProperties {
  const rim: CSSProperties = {
    borderRadius: "50%",
    border: "1px solid rgba(0,0,0,.22)",
  };
  // Real photographic texture (brushed copper/brass/steel/nickel, aged copper).
  if (texture) {
    return {
      ...rim,
      backgroundImage: `url(${texture})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: TEXTURE_SHADOW,
    };
  }
  // Antiques without a colour texture: overlay the real patina for weathering.
  if (finish === "antique") {
    return {
      ...rim,
      backgroundImage: `url(${PATINA}), ${metalBackground(finish, light, mid, dark)}`,
      backgroundSize: "cover, cover",
      backgroundPosition: "center, center",
      backgroundBlendMode: "overlay, normal",
      boxShadow: metalShadow(finish),
    };
  }
  // Brushed without a texture: fall back to the tinted grey grain.
  if (finish === "brushed") {
    return {
      ...rim,
      backgroundImage: `url(${BRUSHED_GRAIN}), ${metalBackground(finish, light, mid, dark)}`,
      backgroundSize: "cover, cover",
      backgroundPosition: "center, center",
      backgroundBlendMode: "overlay, normal",
      boxShadow: metalShadow(finish),
    };
  }
  return {
    ...rim,
    background: metalBackground(finish, light, mid, dark),
    boxShadow: metalShadow(finish),
  };
}

export function metalNameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 10) return 12;
  if (n <= 15) return 11;
  return 10;
}

export function MetalDiscFace({
  name,
  finish,
  light,
  mid,
  dark,
  texture,
  showLabel = true,
}: {
  name: string;
  finish: MetalFinish;
  light: string;
  mid: string;
  dark: string;
  texture?: string;
  showLabel?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: showLabel ? "flex-start" : "center",
        gap: 7,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          ...metalDiscStyle(finish, light, mid, dark, texture),
        }}
      />
      {showLabel ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: "4px 9px",
            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: metalNameSize(name),
              fontWeight: 700,
              color: "#20303a",
              textAlign: "center",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {name}
          </div>
        </div>
      ) : null}
    </div>
  );
}
