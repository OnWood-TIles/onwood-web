// Soft textured carpet swatch for the vision board - a rounded square of the
// real Feltex swatch photo with the colour name + range labelled below.

export function carpetNameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 11) return 12.5;
  if (n <= 16) return 11.5;
  return 10.5;
}

// Small white brand badge (logo) for the corner of a swatch.
export function BrandBadge({
  logo,
  h = 11,
}: {
  logo: string;
  h?: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        background: "rgba(255,255,255,.92)",
        borderRadius: 6,
        padding: `${Math.round(h * 0.35)}px ${Math.round(h * 0.5)}px`,
        boxShadow: "0 2px 6px rgba(0,0,0,.2)",
        display: "grid",
        placeItems: "center",
        lineHeight: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" style={{ height: h, width: "auto", display: "block" }} />
    </span>
  );
}

export function CarpetSwatchFace({
  colour,
  range,
  url,
  brandLogo,
  showLabel = true,
}: {
  colour: string;
  range: string;
  url: string;
  brandLogo?: string;
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
        gap: 8,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 10,
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(0,0,0,.16)",
          boxShadow:
            "0 12px 26px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.15), inset 0 -8px 14px rgba(0,0,0,.14)",
        }}
      >
        {brandLogo && showLabel ? <BrandBadge logo={brandLogo} h={13} /> : null}
      </div>
      {showLabel ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: "5px 9px",
            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
            maxWidth: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: carpetNameSize(colour),
              fontWeight: 700,
              color: "#20303a",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {colour}
          </div>
          <div
            style={{
              fontSize: 9.5,
              color: "#8a8578",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {range}
          </div>
        </div>
      ) : null}
    </div>
  );
}
