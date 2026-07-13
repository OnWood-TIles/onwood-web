// Rectangular flooring "plank sample" swatch for the vision board Flooring tab.
// The Quick-Step floor texture fills a rounded rectangle (cover + a slight zoom so
// it reads like a focused material sample, not a wide floor shot), with a floating
// name/range pill and a brand badge in the corner. Fills its parent.
import { BrandBadge } from "./CarpetSwatch";

export function floorNameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 12) return 12.5;
  if (n <= 18) return 11.5;
  if (n <= 26) return 10.5;
  return 9.5;
}

export function FloorSwatchFace({
  name,
  range,
  url,
  brandLogo,
  showLabel = true,
  radius = 12,
}: {
  name: string;
  range: string;
  url: string;
  brandLogo?: string;
  showLabel?: boolean;
  radius?: number; // corner radius - tiles pass a small value to square them off
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: radius,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,.16)",
        boxShadow:
          "0 14px 30px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.18)",
        background: "#e7ddcd",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.14)", // slight zoom into the plank for a sample feel
          display: "block",
        }}
      />
      {brandLogo && showLabel ? <BrandBadge logo={brandLogo} h={12} /> : null}
      {showLabel ? (
        <div
          style={{
            position: "absolute",
            left: 9,
            right: 9,
            bottom: 9,
            background: "#fff",
            borderRadius: 9,
            padding: "7px 8px",
            boxShadow: "0 5px 14px rgba(0,0,0,.22)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: floorNameSize(name),
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
          {range ? (
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 500,
                color: "#8a8578",
                marginTop: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {range}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
