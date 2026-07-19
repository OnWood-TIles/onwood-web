import Link from "next/link";
import type { CSSProperties } from "react";
import type { Availability, Swatch, WebsiteRange } from "../../../lib/onbase/client";

// Shared building blocks for the shop (server-safe, no client hooks).

export function AvailabilityPill({ availability, size = "sm" }: { availability: Availability; size?: "sm" | "md" }) {
  const conf =
    availability === "in_stock"
      ? { label: "In stock", dot: "#1f7a54", bg: "rgba(31,122,84,.1)", ink: "#1f7a54" }
      : availability === "low"
        ? { label: "Low stock", dot: "#b7791f", bg: "rgba(183,121,31,.12)", ink: "#96621a" }
        : { label: "Order in", dot: "#8a8577", bg: "rgba(32,48,58,.07)", ink: "#5a6067" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "md" ? "6px 12px" : "3px 9px",
        borderRadius: 99,
        background: conf.bg,
        color: conf.ink,
        fontSize: size === "md" ? 13 : 11.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: conf.dot }} />
      {conf.label}
    </span>
  );
}

export function SpecialBadge({ special }: { special: { price: number | null; was: number | null } }) {
  // Sits over the thumbnail, so it uses a SOLID accent ground + cream text (not a
  // translucent tint) to stay legible on any image behind it.
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 7,
        padding: "4px 11px",
        borderRadius: 99,
        background: "var(--accent)",
        color: "#fff6ee",
        fontSize: 12,
        fontWeight: 800,
        boxShadow: "0 2px 8px rgba(20,20,20,.25)",
      }}
    >
      SPECIAL
      {special.price != null && <span style={{ fontSize: 13 }}>${special.price.toFixed(2)}</span>}
      {special.was != null && (
        <span style={{ textDecoration: "line-through", opacity: 0.72, fontWeight: 600, fontSize: 11.5 }}>
          ${special.was.toFixed(2)}
        </span>
      )}
    </span>
  );
}

// Brand watermark overlaid on a product photo when the product opts in (OnBase
// Website tab). Deliberately GHOSTLY (low opacity + soft shadow) so it brands
// without dominating. Non-interactive. `mode` handles the card cross-fade:
//   "static" - always visible (product page, or a card with no room shot)
//   "yield"  - visible, fades OUT on card hover (primary WM stepping aside for
//              the installed image)
//   "room"   - hidden, fades IN on card hover (watermarks the installed image)
export function Watermark({ mode = "static" }: { mode?: "static" | "yield" | "room" }) {
  const cls = mode === "yield" ? "ow-wm ow-wm-yield" : mode === "room" ? "ow-wm ow-wm-room" : "ow-wm";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/onwood-logo-white.png"
      alt=""
      aria-hidden
      loading="lazy"
      className={cls}
      style={{
        position: "absolute",
        right: "4%",
        bottom: "4.5%",
        width: "30%",
        maxWidth: 140,
        minWidth: 74,
        // Soft shadow only - just enough to read on light images without a hard edge.
        filter: "drop-shadow(0 1px 4px rgba(0,0,0,.35))",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 2,
      }}
    />
  );
}

// A range card for the shop grids: hero image (or swatch fallback), name,
// colour count + availability. Whole card links to the product page.
// categoryLabels maps category slugs -> display labels (from the taxonomy).
export function RangeCard({ range }: { range: WebsiteRange; categoryLabels?: Record<string, string> }) {
  const image = range.heroImage || range.swatches.find((s) => s.image)?.image || null;
  // Hover reveals the LEAD colour's "see it installed" room shot (swatches are
  // lead-first) so it always matches the hero, never another colour's room.
  const roomShot = range.swatches[0]?.installedImage || null;
  const colourCount = range.swatches.length;
  return (
    <Link
      href={`/product/${range.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 30px -18px rgba(32,48,58,.25)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
      className="ow-range-card"
    >
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#efece5", overflow: "hidden" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={range.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, colourCount))}, 1fr)`,
            }}
          >
            {range.swatches.slice(0, 3).map((s, i) => (
              <div key={i} style={{ background: s.swatchHex || "#d8d3c7" }} />
            ))}
          </div>
        )}
        {roomShot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={roomShot}
            alt=""
            loading="lazy"
            className="ow-room-shot"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {range.watermarkPrimary && <Watermark mode={roomShot ? "yield" : "static"} />}
        {range.watermarkSecondary && roomShot && <Watermark mode="room" />}
        {range.special && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <SpecialBadge special={range.special} />
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Full name shown in full (wraps) at a uniform, slightly smaller size so
            even the longest product name stays readable. No availability pill. */}
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-archivo)",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "-.01em",
            lineHeight: 1.25,
          }}
        >
          {range.name}
        </h3>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#8a8577" }}>
          {colourCount > 1 ? `${colourCount} options` : "1 option"}
        </p>
      </div>
    </Link>
  );
}

// One card per COLOURWAY - the grid "explodes" into these when a colour
// filter is active, so a shopper filtering Beige sees every beige colourway
// as its own card (never hidden inside a range). Links straight to the
// product page with the colour pre-selected.
export function ColourwayCard({ range, swatch }: { range: WebsiteRange; swatch: Swatch }) {
  const image = swatch.image || range.heroImage || null;
  const roomShot = swatch.installedImage || null;
  const special = swatch.special ?? range.special ?? null;
  const href = `/product/${swatch.slug || range.slug}?c=${encodeURIComponent(swatch.colour)}`;
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 30px -18px rgba(32,48,58,.25)",
        transition: "transform .25s ease, box-shadow .25s ease",
      }}
      className="ow-range-card"
    >
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#efece5", overflow: "hidden" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${range.name} - ${swatch.colour}`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: swatch.swatchHex || "#d8d3c7" }} />
        )}
        {roomShot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={roomShot}
            alt=""
            loading="lazy"
            className="ow-room-shot"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {(swatch.watermarkPrimary ?? range.watermarkPrimary) && <Watermark mode={roomShot ? "yield" : "static"} />}
        {(swatch.watermarkSecondary ?? range.watermarkSecondary) && roomShot && <Watermark mode="room" />}
        {special && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <SpecialBadge special={special} />
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Full name shown in full (wraps) at a uniform, slightly smaller size. No availability pill. */}
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-archivo)",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "-.01em",
            lineHeight: 1.25,
          }}
        >
          {range.name}
        </h3>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#8a8577", display: "flex", alignItems: "center", gap: 7 }}>
          {swatch.swatchHex && (
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: swatch.swatchHex, border: "1px solid var(--line)", display: "inline-block" }} />
          )}
          {swatch.colour}
        </p>
      </div>
    </Link>
  );
}

// "Pairs well with" - complementary products chosen by surface, tone and use
// (see lib/pairs.ts). Each card carries a short reason chip so the shopper can
// see WHY it was suggested. Renders nothing when there is nothing worth showing.
export function PairsWellWith({
  pairs,
  categoryLabels,
}: {
  pairs: { range: WebsiteRange; reason: string }[];
  categoryLabels?: Record<string, string>;
}) {
  if (!pairs.length) return null;
  return (
    <section style={{ marginTop: 66 }}>
      <h2
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 820,
          fontSize: "clamp(24px,3vw,30px)",
          letterSpacing: "-.015em",
          margin: "0 0 4px",
        }}
      >
        Pairs well with<span style={{ color: "var(--accent)" }}>.</span>
      </h2>
      <p style={{ color: "#8a8577", fontSize: 14, margin: "0 0 22px" }}>
        Chosen to complement what you are looking at - by surface, tone and where it is used.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
        {pairs.map(({ range, reason }) => (
          <div key={range.id}>
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 11px",
                  borderRadius: 99,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: "color-mix(in oklab, var(--accent) 13%, transparent)",
                  color: "var(--accent)",
                }}
              >
                {reason}
              </span>
            </div>
            <RangeCard range={range} categoryLabels={categoryLabels} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Full-width "Technical" spec panel (adapted from the Claude Design), on a
// terracotta ground instead of dark. Three hero stats pulled from the real
// specs, then the full spec list. No invented content (no PDF buttons/origin).
export function TechnicalSpecs({
  specs,
  material,
  documents,
}: {
  specs: { label: string; value: string }[];
  material?: string | null;
  documents?: { name: string; type: string | null; url: string; isExternal: boolean }[];
}) {
  if (!specs?.length && !documents?.length) return null;
  // Top 3 listed specs lead as hero stats; the rest sit below - no duplication.
  const hero = specs.slice(0, 3);
  const rest = specs.slice(3);

  const cream = "#fff6ee";
  const muted = "rgba(255,246,238,.6)";
  const line = "rgba(255,246,238,.18)";
  const eyebrow: CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: muted };

  return (
    <section style={{ marginTop: 64 }}>
      <div
        style={{
          borderRadius: 24,
          padding: "clamp(26px,4vw,44px)",
          background: "color-mix(in oklab, var(--accent) 88%, #1a0d07)",
          color: cream,
        }}
      >
        <div style={eyebrow}>Technical{material ? ` — ${material}` : ""}</div>

        {hero.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginTop: 26 }}>
            {hero.map((s, i) => (
              <div key={`hero-${i}`}>
                <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(23px,2.9vw,37px)", letterSpacing: "-.02em", lineHeight: 1.08 }}>
                  {s.value}
                </div>
                <div style={{ ...eyebrow, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <>
            <div style={{ height: 1, background: line, margin: "30px 0 26px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2px 40px" }}>
              {rest.map((s, i) => (
                <div
                  key={`${s.label}-${i}`}
                  style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, padding: "11px 0", borderBottom: `1px solid ${line}` }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: muted, flexShrink: 0 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cream, textAlign: "right" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {documents && documents.length > 0 && (
          <>
            <div style={{ height: 1, background: line, margin: hero.length || rest.length ? "28px 0 22px" : "0 0 22px" }} />
            <div style={{ ...eyebrow, marginBottom: 14 }}>Downloads</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {documents.map((d, i) => (
                <a
                  key={i}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", color: cream, border: `1px solid ${line}`, borderRadius: 12, padding: "11px 15px", background: "rgba(255,246,238,.06)" }}
                >
                  <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: "rgba(255,246,238,.12)", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v5h5" />
                      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </svg>
                  </span>
                  <span>
                    <span style={{ display: "block", fontWeight: 700, fontSize: 13.5 }}>{d.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: muted }}>
                      {d.type || "Document"} {d.isExternal ? "· Supplier ↗" : "· Download ↓"}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function EmptyCatalogue({ note }: { note?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "72px 24px",
        borderRadius: 22,
        border: "1px dashed var(--line)",
        background: "color-mix(in oklab, var(--bg) 60%, #fff)",
      }}
    >
      <p style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, margin: 0 }}>
        The full range is landing soon
      </p>
      <p style={{ color: "#5a6067", fontSize: 14.5, maxWidth: 460, margin: "10px auto 0", lineHeight: 1.6 }}>
        {note ||
          "We are stocking the online catalogue right now. Visit the Baringa showroom to see everything in person, or check back shortly."}
      </p>
    </div>
  );
}
