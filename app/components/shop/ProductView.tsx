"use client";

import { useState } from "react";
import Link from "next/link";
import type { WebsiteRange, Swatch } from "../../../lib/onbase/client";
import { AvailabilityPill } from "./shared";

// ABI-inspired product page: sticky gallery on the left, identity + option
// selector + specs on the right. "Options" are the range's swatches - colours
// for a standalone product, member products (sizes/formats) for a grouped
// range - selecting one drives the gallery and availability.
export default function ProductView({
  range,
  deptLabel,
  deptSlug,
  catLabels,
  initialColour,
}: {
  range: WebsiteRange;
  deptLabel: string | null;
  deptSlug: string | null;
  catLabels: string[];
  /** Pre-select this colourway (from ?c= deep links, e.g. colour-filter cards). */
  initialColour?: string | null;
}) {
  const initialIdx = initialColour
    ? Math.max(0, range.swatches.findIndex((s) => s.colour.toLowerCase() === initialColour.toLowerCase()))
    : 0;
  const [selected, setSelected] = useState(initialIdx);
  const [view, setView] = useState<"tile" | "room">("tile");
  const swatch: Swatch | undefined = range.swatches[selected];

  // Single main image = the selected colour's photo, falling back to the range
  // hero. No thumbnail strip: colours switch via the swatch selector below and
  // tile/room via the "See it installed" toggle.
  const main = swatch?.image ?? swatch?.images?.[0] ?? range.heroImage ?? range.images[0] ?? null;
  const installed = swatch?.installedImage ?? null;
  const displayMain = view === "room" && installed ? installed : main;

  const special = swatch?.special ?? range.special ?? null;

  return (
    <div>
      {/* breadcrumbs */}
      <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 18 }} aria-label="Breadcrumb">
        <Link href="/shop" style={{ color: "inherit", textDecoration: "none" }}>
          Shop
        </Link>
        {deptLabel && deptSlug && (
          <>
            <span style={{ margin: "0 8px" }}>/</span>
            <Link href={`/shop/${deptSlug}`} style={{ color: "inherit", textDecoration: "none" }}>
              {deptLabel}
            </Link>
          </>
        )}
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{range.name}</span>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)",
          gap: 44,
          alignItems: "start",
        }}
        className="ow-product-grid"
      >
        {/* gallery */}
        <div style={{ position: "sticky", top: 110 }} className="ow-product-gallery">
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 3",
              borderRadius: 22,
              overflow: "hidden",
              background: "#efece5",
              border: "1px solid var(--line)",
            }}
          >
            {displayMain ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayMain} alt={`${range.name}${swatch ? ` - ${swatch.colour}` : ""}${view === "room" ? " installed" : ""}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  background: swatch?.swatchHex || "#e7e2d6",
                  color: "rgba(32,48,58,.45)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Photos coming soon
              </div>
            )}
            {installed && (
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  bottom: 12,
                  display: "flex",
                  gap: 4,
                  padding: 4,
                  borderRadius: 999,
                  background: "rgba(20,38,42,.72)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                {(["tile", "room"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    style={{
                      appearance: "none",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 999,
                      padding: "6px 13px",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      color: view === mode ? "var(--ink)" : "#fff",
                      background: view === mode ? "#fff" : "transparent",
                      transition: "all .2s ease",
                    }}
                  >
                    {mode === "tile" ? "Tile" : "See it installed"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* identity + options */}
        <div>
          {catLabels.length > 0 && (
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--accent2)",
              }}
            >
              {catLabels.join(" · ")}
            </p>
          )}
          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(28px,3.4vw,42px)",
              letterSpacing: "-.02em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {range.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <AvailabilityPill availability={swatch?.availability ?? range.availability} size="md" />
            {special && (special.price != null || special.was != null) && (
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
                {special.price != null && (
                  <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, color: "var(--accent)" }}>
                    ${special.price.toFixed(2)}
                  </span>
                )}
                {special.was != null && (
                  <span style={{ textDecoration: "line-through", color: "#8a8577", fontWeight: 600, fontSize: 16 }}>
                    ${special.was.toFixed(2)}
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", color: "var(--accent)" }}>SPECIAL</span>
              </span>
            )}
          </div>

          {/* Per-sheet goods (mosaics): help the shopper size the job in m². */}
          {range.coverageM2 != null && range.coverageM2 > 0 && (
            <p style={{ marginTop: 12, fontSize: 13.5, color: "#5a6067" }}>
              Sold per sheet · about <strong>{Math.round(1 / range.coverageM2)}</strong> sheets per m² ({range.coverageM2} m² per sheet)
            </p>
          )}

          {range.description && (
            <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.7, color: "#3a4750" }}>{range.description}</p>
          )}

          {/* options / colours */}
          {range.swatches.length > 1 && (
            <div style={{ marginTop: 26 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 700 }}>
                {swatch ? (
                  <>
                    Option: <span style={{ color: "var(--accent)" }}>{swatch.colour}</span>
                  </>
                ) : (
                  "Options"
                )}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {range.swatches.map((s, i) => (
                  <button
                    key={`${s.colour}-${i}`}
                    type="button"
                    onClick={() => {
                      setSelected(i);
                      setView("tile");
                    }}
                    title={`${s.colour}${s.availability === "out" ? " (order in)" : ""}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: 6,
                      borderRadius: 12,
                      cursor: "pointer",
                      background: "#fff",
                      border: i === selected ? "2px solid var(--accent)" : "1px solid var(--line)",
                      width: 84,
                    }}
                  >
                    <span
                      style={{
                        width: 68,
                        height: 52,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: s.swatchHex || "#e7e2d6",
                        display: "block",
                        opacity: s.availability === "out" ? 0.55 : 1,
                      }}
                    >
                      {s.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={s.colour} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#3a4750",
                        maxWidth: 72,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.colour}
                    </span>
                  </button>
                ))}
              </div>
              {swatch?.description && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "#5a6067", lineHeight: 1.6 }}>{swatch.description}</p>
              )}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Link
              href="/#contact"
              style={{
                textDecoration: "none",
                background: "var(--accent)",
                color: "#fff6ee",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 26px",
                borderRadius: 99,
              }}
            >
              Enquire about {range.swatches.length > 1 ? "this range" : "this product"} →
            </Link>
            <Link
              href="/#showroom"
              style={{
                textDecoration: "none",
                background: "#fff",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 26px",
                borderRadius: 99,
                border: "1px solid var(--line)",
              }}
            >
              See it in the showroom
            </Link>
          </div>
          <p style={{ marginTop: 14, fontSize: 12.5, color: "#8a8577" }}>
            Stock levels are live from our system. Call or drop in to the Baringa showroom and we will have it ready
            to view.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ow-product-grid { grid-template-columns: 1fr !important; }
          .ow-product-gallery { position: static !important; }
        }
      `}</style>
    </div>
  );
}
