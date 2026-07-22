"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { PriceDisplayGst, Swatch, WebsiteRange } from "../../../../lib/onbase/client";
import { AvailabilityPill, SpecialBadge, Watermark } from "../../../components/shop/shared";
import { useCart } from "../CartProvider";
import { boxesFor, coveragePerUnit, hasBoxes, isAreaUnit, roundUpToBox, round3, stepFor, stepQty, unitLabel, unitsForArea } from "../../../../lib/boxQty";

// The trade portal renders the SAME shop range/colourway cards, but each carries
// its trade pricing (RRP struck / Your Price) and an "Add to order" action. Adding
// a multi-colour product opens a small dialog to confirm the colour + quantity;
// quantities snap to whole boxes (Product.boxQuantity).

function money(n: number): string {
  return `$${(n ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function gstSuffix(mode: PriceDisplayGst | undefined): string {
  if (mode === "INCLUDE_GST") return " inc GST";
  if (mode === "EXCLUDE_GST") return " ex GST";
  return "";
}

// Swatches that can actually be ordered (carry trade pricing).
const orderableSwatches = (range: WebsiteRange): Swatch[] => range.swatches.filter((s) => s.trade);

type Summary = {
  anyPriced: boolean;
  sameTrade: boolean;
  minTrade: number | null;
  rrp: number | null;
  gst: PriceDisplayGst | undefined;
  unit: string | null;
};

// Reduce a range's swatch prices into what a card shows. A single-product range
// (colour variations) shares one price; a multi-product range shows "from $x".
function summarise(range: WebsiteRange): Summary {
  const swatches = orderableSwatches(range);
  const priced = swatches.filter((s) => s.trade!.tradePrice != null);
  const vals = priced.map((s) => s.trade!.tradePrice!);
  const minTrade = vals.length ? Math.min(...vals) : null;
  const maxTrade = vals.length ? Math.max(...vals) : null;
  const rep = priced.length
    ? priced.reduce((a, b) => (a.trade!.tradePrice! <= b.trade!.tradePrice! ? a : b))
    : swatches[0];
  return {
    anyPriced: priced.length > 0,
    sameTrade: minTrade != null && minTrade === maxTrade,
    minTrade,
    rrp: rep?.trade?.rrpPrice ?? null,
    gst: rep?.trade?.priceDisplayGst,
    unit: rep?.trade?.unit ?? range.unit ?? null,
  };
}

// The price block shown on a card (and re-used, condensed, in the dialog header).
function PriceBlock({ s, singleSwatch }: { s: Summary; singleSwatch?: boolean }) {
  const unitSuffix = s.unit ? ` / ${unitLabel(s.unit)}` : "";
  if (!s.anyPriced) {
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 19, color: "var(--ink)" }}>{s.rrp != null ? money(s.rrp) : "-"}</span>
          {s.rrp != null && <span style={{ fontSize: 12, color: "#8a8577", fontWeight: 600 }}>{unitSuffix}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: "#a86a3c", fontWeight: 700, marginTop: 2 }}>Trade price on request</div>
      </div>
    );
  }
  const saving = s.rrp != null && s.minTrade != null && s.rrp > s.minTrade;
  return (
    <div style={{ marginTop: 8 }}>
      {saving && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ textDecoration: "line-through", color: "#a8a294", fontSize: 13.5, fontWeight: 600 }}>{money(s.rrp!)}</span>
          <span style={{ fontSize: 10, color: "#a8a294", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>RRP</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: saving ? 1 : 0 }}>
        {!s.sameTrade && !singleSwatch && <span style={{ fontSize: 12.5, color: "#8a8577", fontWeight: 700 }}>from</span>}
        <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{money(s.minTrade!)}</span>
        <span style={{ fontSize: 12, color: "#8a8577", fontWeight: 600 }}>{s.unit ? ` / ${unitLabel(s.unit)}` : ""}{gstSuffix(s.gst)}</span>
      </div>
      <div style={{ fontSize: 11, color: "#1f7a54", fontWeight: 700, marginTop: 1 }}>Your Price</div>
    </div>
  );
}

const nameStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-archivo)",
  fontWeight: 800,
  fontSize: 15,
  letterSpacing: "-.01em",
  lineHeight: 1.25,
};
const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  textDecoration: "none",
  color: "inherit",
  borderRadius: 18,
  overflow: "hidden",
  background: "#fff",
  border: "1px solid var(--line)",
  boxShadow: "0 10px 30px -18px rgba(32,48,58,.25)",
};

function AddButton({ onClick, label = "Add to order" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: "auto",
        width: "100%",
        padding: "11px 12px",
        borderRadius: 11,
        border: "none",
        background: "var(--accent)",
        color: "#fff6ee",
        fontWeight: 800,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function AskButton() {
  return (
    <a
      href="/contact"
      style={{ marginTop: "auto", display: "block", textAlign: "center", padding: "11px 12px", borderRadius: 11, border: "1px solid var(--line)", background: "#faf7f1", color: "#5a6067", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}
    >
      Ask us for a price
    </a>
  );
}

// The range card (grid default): shop hero + name + trade price + Add. Opens the
// dialog so the customer confirms colour (if any) and quantity.
export function TradeRangeCard({ range }: { range: WebsiteRange }) {
  const [open, setOpen] = useState(false);
  const image = range.heroImage || range.swatches.find((s) => s.image)?.image || null;
  const roomShot = range.swatches[0]?.installedImage || null;
  const s = summarise(range);
  const colourCount = orderableSwatches(range).length;

  return (
    <div style={cardStyle} className="ow-range-card">
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#fff", overflow: "hidden" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={range.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, colourCount))}, 1fr)` }}>
            {range.swatches.slice(0, 3).map((sw, i) => (
              <div key={i} style={{ background: sw.swatchHex || "#d8d3c7" }} />
            ))}
          </div>
        )}
        {roomShot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={roomShot} alt="" loading="lazy" className="ow-room-shot" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        {range.watermarkPrimary && <Watermark mode={roomShot ? "yield" : "static"} />}
        {range.watermarkSecondary && roomShot && <Watermark mode="room" />}
        {range.special && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <SpecialBadge special={range.special} />
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={nameStyle}>{range.name}</h3>
        <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#8a8577" }}>{colourCount > 1 ? `${colourCount} options` : "1 option"}</p>
        <PriceBlock s={s} />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", flex: 1 }}>
          {s.anyPriced ? <AddButton onClick={() => setOpen(true)} /> : <AskButton />}
        </div>
      </div>
      {open && <AddToOrderModal range={range} onClose={() => setOpen(false)} />}
    </div>
  );
}

// A single-colourway card (grid "explodes" into these when a colour filter is
// active). One swatch, so Add is direct (no colour prompt), just a quantity.
export function TradeColourwayCard({ range, swatch }: { range: WebsiteRange; swatch: Swatch }) {
  const [open, setOpen] = useState(false);
  const image = swatch.image || range.heroImage || null;
  const roomShot = swatch.installedImage || null;
  const special = swatch.special ?? range.special ?? null;
  const priced = swatch.trade?.tradePrice != null;
  const s: Summary = {
    anyPriced: priced,
    sameTrade: true,
    minTrade: swatch.trade?.tradePrice ?? null,
    rrp: swatch.trade?.rrpPrice ?? null,
    gst: swatch.trade?.priceDisplayGst,
    unit: swatch.trade?.unit ?? range.unit ?? null,
  };

  return (
    <div style={cardStyle} className="ow-range-card">
      <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#fff", overflow: "hidden" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${range.name} - ${swatch.colour}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: swatch.swatchHex || "#d8d3c7" }} />
        )}
        {roomShot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={roomShot} alt="" loading="lazy" className="ow-room-shot" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        {(swatch.watermarkPrimary ?? range.watermarkPrimary) && <Watermark mode={roomShot ? "yield" : "static"} />}
        {(swatch.watermarkSecondary ?? range.watermarkSecondary) && roomShot && <Watermark mode="room" />}
        {special && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <SpecialBadge special={special} />
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={nameStyle}>{range.name}</h3>
        <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#8a8577", display: "flex", alignItems: "center", gap: 7 }}>
          {swatch.swatchHex && <span style={{ width: 12, height: 12, borderRadius: "50%", background: swatch.swatchHex, border: "1px solid var(--line)", display: "inline-block" }} />}
          {swatch.colour}
        </p>
        <PriceBlock s={s} singleSwatch />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", flex: 1 }}>
          {priced ? <AddButton onClick={() => setOpen(true)} /> : <AskButton />}
        </div>
      </div>
      {open && <AddToOrderModal range={range} preselectColour={swatch.colour} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ── Add-to-order dialog ───────────────────────────────────────────────────────
function AddToOrderModal({ range, preselectColour, onClose }: { range: WebsiteRange; preselectColour?: string; onClose: () => void }) {
  const { add } = useCart();
  const swatches = useMemo(() => orderableSwatches(range), [range]);

  // A range whose swatches all share ONE product = colour variations of that
  // product -> the swatch colour is a real orderable variation. Otherwise each
  // swatch is its own product (range members) -> order by product, no colour.
  const distinctProducts = useMemo(() => new Set(swatches.map((s) => s.trade!.productId)), [swatches]);

  const initialIdx = useMemo(() => {
    if (preselectColour) {
      const i = swatches.findIndex((s) => s.colour === preselectColour);
      if (i >= 0) return i;
    }
    const firstPriced = swatches.findIndex((s) => s.trade!.tradePrice != null);
    return firstPriced >= 0 ? firstPriced : 0;
  }, [swatches, preselectColour]);

  const [selIdx, setSelIdx] = useState(initialIdx);
  const sel = swatches[selIdx];
  const box = sel?.trade?.boxQuantity ?? 1;
  const unit = sel?.trade?.unit ?? null;
  const cov = coveragePerUnit(unit, sel?.trade?.coverageM2 ?? null);
  const canArea = cov != null && !isAreaUnit(unit); // sold per sheet/piece, but measured by area

  const [qty, setQty] = useState<number>(() => stepFor(box));
  const [areaStr, setAreaStr] = useState("");
  const [added, setAdded] = useState(false);

  // Reset the quantity to one box whenever the chosen option changes.
  useEffect(() => {
    setQty(stepFor(swatches[selIdx]?.trade?.boxQuantity));
    setAreaStr("");
  }, [selIdx, swatches]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!sel) return null;

  const priced = sel.trade!.tradePrice != null;
  const shareCount = swatches.filter((s) => s.trade!.productId === sel.trade!.productId).length;
  const isVariation = shareCount > 1; // multiple colours of the SAME product
  const areaCovered = cov ? round3(qty * cov) : null;
  const lineTotal = priced ? qty * sel.trade!.tradePrice! : 0;

  function applyArea() {
    const area = Number(areaStr);
    const u = unitsForArea(area, unit, sel.trade!.coverageM2, box);
    if (u) setQty(u);
  }

  function confirm() {
    if (!priced) return;
    const orderColour = isVariation ? sel.colour : undefined;
    const lineName = isVariation ? range.name : distinctProducts.size > 1 ? sel.colour : range.name;
    add(
      {
        productId: sel.trade!.productId,
        colour: orderColour,
        name: lineName,
        unit: sel.trade!.unit,
        unitPrice: sel.trade!.tradePrice!,
        image: sel.image ?? range.heroImage ?? null,
        boxQuantity: box,
      },
      qty,
    );
    setAdded(true);
    setTimeout(onClose, 650);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${range.name} to your order`}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(14,20,24,.5)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 18 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(440px, 100%)", maxHeight: "90dvh", overflowY: "auto", background: "#fff", borderRadius: 18, border: "1px solid var(--line)", boxShadow: "0 30px 70px -30px rgba(32,48,58,.6)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", gap: 14, padding: "18px 20px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: sel.swatchHex || "#f3efe6" }}>
            {sel.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sel.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ ...nameStyle, fontSize: 17 }}>{range.name}</h3>
            <div style={{ marginTop: 4 }}>
              <AvailabilityPill availability={sel.availability} />
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: "#8a8577", fontSize: 22, lineHeight: 1, padding: 2, alignSelf: "flex-start" }}>&times;</button>
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          {/* Colour / option picker */}
          {swatches.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#5a6067", marginBottom: 8 }}>
                {isVariation ? "Colour" : "Option"}: <span style={{ color: "var(--ink)" }}>{sel.colour}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {swatches.map((sw, i) => {
                  const on = i === selIdx;
                  const swPriced = sw.trade!.tradePrice != null;
                  return (
                    <button
                      key={`${sw.colour}-${i}`}
                      type="button"
                      onClick={() => setSelIdx(i)}
                      title={sw.colour + (swPriced ? "" : " (price on request)")}
                      aria-label={sw.colour}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        cursor: "pointer",
                        padding: 0,
                        overflow: "hidden",
                        background: sw.swatchHex || "#e7e2d6",
                        border: on ? "2px solid var(--accent)" : "1px solid var(--line)",
                        opacity: swPriced ? 1 : 0.55,
                        position: "relative",
                      }}
                    >
                      {sw.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sw.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price for the selected option */}
          <PriceBlock s={{ anyPriced: priced, sameTrade: true, minTrade: sel.trade!.tradePrice, rrp: sel.trade!.rrpPrice, gst: sel.trade!.priceDisplayGst, unit }} singleSwatch />

          {!priced ? (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "#faf3ec", color: "#8a5a2b", fontSize: 13.5, fontWeight: 600 }}>
              We have not set your price for this option yet.{" "}
              <a href="/contact" style={{ color: "var(--accent)", fontWeight: 700 }}>Ask us for a price</a> and we will add it.
            </div>
          ) : (
            <>
              {/* Quantity (snaps to whole boxes) */}
              <div style={{ marginTop: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5a6067", marginBottom: 8 }}>
                  Quantity{unit ? ` (${unitLabel(unit, 2)})` : ""}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 11, overflow: "hidden" }}>
                    <button type="button" onClick={() => setQty((q) => stepQty(q, box, -1))} aria-label="Decrease quantity" style={stepBtn}>&minus;</button>
                    <input
                      type="number"
                      min={0}
                      step={stepFor(box)}
                      value={qty}
                      onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                      onBlur={() => setQty((q) => roundUpToBox(q, box))}
                      aria-label="Quantity"
                      style={{ width: 70, textAlign: "center", border: "none", fontSize: 15, fontWeight: 800, color: "var(--ink)", background: "transparent" }}
                    />
                    <button type="button" onClick={() => setQty((q) => stepQty(q, box, 1))} aria-label="Increase quantity" style={stepBtn}>+</button>
                  </div>
                  {hasBoxes(box) && (
                    <span style={{ fontSize: 12.5, color: "#8a8577", fontWeight: 600 }}>
                      {boxesFor(qty, box)} box{boxesFor(qty, box) === 1 ? "" : "es"} &middot; {round3(box)} {unitLabel(unit, 2)}/box
                    </span>
                  )}
                </div>

                {/* Type a target area for per-sheet/piece goods measured by area. */}
                {canArea && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, color: "#8a8577", fontWeight: 600 }}>or enter area</span>
                    <input
                      type="number"
                      min={0}
                      value={areaStr}
                      onChange={(e) => setAreaStr(e.target.value)}
                      onBlur={applyArea}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyArea(); } }}
                      placeholder="m²"
                      aria-label="Target area in square metres"
                      style={{ width: 90, padding: "7px 10px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", background: "#fff" }}
                    />
                    <span style={{ fontSize: 12.5, color: "#8a8577" }}>m² &rarr; rounds up to a whole box</span>
                  </div>
                )}

                {areaCovered != null && !isAreaUnit(unit) && (
                  <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#8a8577" }}>Covers about {areaCovered} m².</p>
                )}
              </div>

              {/* Line total + confirm */}
              <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "#8a8577", fontWeight: 700 }}>Line total (indicative)</div>
                  <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 21 }}>{money(lineTotal)}<span style={{ fontSize: 12, color: "#8a8577", fontWeight: 600 }}>{gstSuffix(sel.trade!.priceDisplayGst)}</span></div>
                </div>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={added}
                  style={{ padding: "13px 22px", borderRadius: 12, border: "none", background: added ? "#1f7a54" : "var(--accent)", color: "#fff6ee", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "background .2s ease" }}
                >
                  {added ? "Added ✓" : "Add to order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const stepBtn: CSSProperties = {
  width: 38,
  height: 42,
  border: "none",
  background: "#f6f2ea",
  color: "var(--ink)",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
};
