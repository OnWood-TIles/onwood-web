"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { WebsiteRange, Swatch } from "../../../lib/onbase/client";
import { AvailabilityPill, Watermark, ColourwayCard } from "./shared";
import { pairSwatch } from "../../../lib/pairs";
import { familySlug } from "../../../lib/family";
import { imageAlt } from "../../../lib/alt";
import ImageDisclosure from "../legal/ImageDisclosure";

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
  shopBase = "/shop",
  shopLabel = "Shop",
  renderActions,
  showAvailability = false,
  pairs,
  specsSlot,
  productBase = "/product",
}: {
  range: WebsiteRange;
  deptLabel: string | null;
  deptSlug: string | null;
  catLabels: string[];
  /** "Pairs well with" suggestions - rendered colour-aware (each card follows the
   *  selected colour) below the product. */
  pairs?: { range: WebsiteRange; reason: string }[];
  /** Technical specs / data sheet block. Rendered ABOVE "Pairs well with" - the
   *  technical information is more important, so it comes first. */
  specsSlot?: ReactNode;
  /** Base path for pair-card links ("/product" public, trade base for the portal). */
  productBase?: string;
  /** Pre-select this colourway (from ?c= deep links, e.g. colour-filter cards). */
  initialColour?: string | null;
  /** Breadcrumb root - "/shop" (public) or "/trade/catalogue" (trade portal). */
  shopBase?: string;
  shopLabel?: string;
  /** The trade portal supplies its price + add-to-order block here, replacing
   *  the public enquire/showroom CTAs. Called with the currently selected swatch
   *  so the price + order action always reflect the chosen colourway. */
  renderActions?: (ctx: { range: WebsiteRange; swatch: Swatch | undefined; selectedIndex: number }) => ReactNode;
  /** Show the live stock availability pill (In stock / Low / Order in). OFF for the
   *  public storefront - stock is trade-only; the trade portal opts in. */
  showAvailability?: boolean;
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
  // Brand watermark follows the selected colour (falls back to the range flag),
  // and the PRIMARY vs SECONDARY toggle depends on which image is showing.
  const wmPrimary = (swatch?.watermarkPrimary ?? range.watermarkPrimary) ?? false;
  const wmSecondary = (swatch?.watermarkSecondary ?? range.watermarkSecondary) ?? false;
  const watermarked = view === "room" && installed ? wmSecondary : wmPrimary;

  const special = swatch?.special ?? range.special ?? null;

  return (
    <div>
      {/* breadcrumbs */}
      <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 18 }} aria-label="Breadcrumb">
        <Link href={shopBase} style={{ color: "inherit", textDecoration: "none" }}>
          {shopLabel}
        </Link>
        {deptLabel && deptSlug && (
          <>
            <span style={{ margin: "0 8px" }}>/</span>
            <Link href={`${shopBase}/${deptSlug}`} style={{ color: "inherit", textDecoration: "none" }}>
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
              // White so transparent product PNGs (many ABI hardware/tapware
              // finishes) sit on white like in OnBase, not a beige placeholder.
              background: "#fff",
              border: "1px solid var(--line)",
            }}
          >
            {displayMain ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayMain}
                alt={
                  view === "room" && installed
                    ? `${range.name} shown installed - AI-generated illustration, actual product varies`
                    : `${range.name} - colour, scale and finish vary from the image`
                }
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
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
            {watermarked && <Watermark />}
          </div>
          {view === "room" && installed && (
            <p style={{ margin: "10px 2px 0", fontSize: 11.5, lineHeight: 1.5, color: "#8a8577" }}>
              Indicative room visual - some are AI-generated. Always confirm the exact colour, texture and
              finish with a physical sample.
            </p>
          )}
          {/* Imagery disclosure - shown once per product page, adjacent to the main image. */}
          <ImageDisclosure variant="medium" />
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

          {(showAvailability || (special && (special.price != null || special.was != null))) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            {showAvailability && (
              <AvailabilityPill availability={swatch?.availability ?? range.availability} size="md" />
            )}
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
          )}

          {/* Per-sheet goods (mosaics): help the shopper size the job in m². */}
          {range.coverageM2 != null && range.coverageM2 > 0 && (
            <p style={{ marginTop: 12, fontSize: 13.5, color: "#5a6067" }}>
              Sold per sheet · about <strong>{Math.round(1 / range.coverageM2)}</strong> sheets per m² ({range.coverageM2} m² per sheet)
            </p>
          )}

          {range.description && (
            <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.7, color: "#3a4750" }}>{range.description}</p>
          )}

          {/* options / colours — also shown for a SINGLE colour so its name + thumbnail
              still appear (same chip as a multi-variant range, just one of them). */}
          {range.swatches.length >= 1 && (
            <div style={{ marginTop: 26 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 700 }}>
                {swatch ? (
                  <>
                    {range.swatches.length > 1 ? "Option" : "Colour"}: <span style={{ color: "var(--accent)" }}>{swatch.colour}</span>
                  </>
                ) : (
                  range.swatches.length > 1 ? "Options" : "Colour"
                )}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {range.swatches.map((s, i) => (
                  <button
                    key={`${s.colour}-${i}`}
                    type="button"
                    // Keep the Tile / See-it-installed view when switching colours -
                    // so browsing "installed" across the range stays in that view.
                    onClick={() => setSelected(i)}
                    // Stock status is trade-only - never reveal "order in" on the public storefront.
                    title={`${s.colour}${showAvailability && s.availability === "out" ? " (order in)" : ""}`}
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
                        opacity: showAvailability && s.availability === "out" ? 0.55 : 1,
                      }}
                    >
                      {s.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={imageAlt(range, { swatch: s, kind: "swatch" })} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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

          {/* CTAs - the trade portal swaps in its price + add-to-order block. */}
          {renderActions ? (
            renderActions({ range, swatch, selectedIndex: selected })
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
                <Link
                  href={`/contact?product=${encodeURIComponent(range.name)}`}
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
                  href="/book"
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
                <Link
                  href={`/brochure/${familySlug(range)}`}
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
                  Download brochure ↓
                </Link>
              </div>
              <p style={{ marginTop: 14, fontSize: 12.5, color: "#8a8577" }}>
                Call or drop in to the Baringa showroom and we will have it ready to view.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Technical data first - it's the more important information - then pairings. */}
      {specsSlot}

      {pairs && pairs.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", margin: "0 0 4px" }}>
            Pairs well with
          </h2>
          <p style={{ color: "#8a8577", fontSize: 14, margin: "0 0 22px" }}>
            Matched to your {swatch?.colour ?? "selection"} - the same range shows this colour, others a tone or finish that complements it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
            {pairs.map(({ range: pr, reason }) => {
              const ps = pairSwatch(pr, swatch);
              if (!ps) return null;
              return (
                <div key={pr.id}>
                  <div style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        display: "inline-block", fontSize: 11.5, fontWeight: 700, letterSpacing: ".02em",
                        textTransform: "uppercase", padding: "4px 10px", borderRadius: 99,
                        background: "color-mix(in oklab, var(--accent) 13%, transparent)", color: "var(--accent)",
                      }}
                    >
                      {reason}
                    </span>
                  </div>
                  <ColourwayCard range={pr} swatch={ps} productBase={productBase} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .ow-product-grid { grid-template-columns: 1fr !important; }
          .ow-product-gallery { position: static !important; }
        }
      `}</style>
    </div>
  );
}
