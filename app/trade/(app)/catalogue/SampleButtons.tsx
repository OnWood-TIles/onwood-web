"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Swatch, WebsiteRange } from "../../../../lib/onbase/client";
import { MAX_SAMPLES, useSamples, type SampleLine } from "../SamplesProvider";

// "Add sample" for the trade catalogue: a free single-tile sample per colour, collected in the
// sample request (/trade/samples), apart from the order cart. Not offered on made-to-order
// ranges (a vanity has no single sample).

const sampleSwatches = (range: WebsiteRange): Swatch[] => (range.priceFrom ? [] : range.swatches.filter((s) => s.trade));

export const sampleLine = (range: WebsiteRange, s: Swatch): SampleLine => ({
  productId: s.trade!.productId,
  colour: s.colour,
  name: range.name,
  image: s.image ?? range.heroImage ?? null,
  href: `/trade/catalogue/product/${s.slug || range.slug}?c=${encodeURIComponent(s.colour)}`,
});

/** One colourway: tap to add, tap again to remove. */
export function SampleToggle({ range, swatch, big }: { range: WebsiteRange; swatch: Swatch | undefined; big?: boolean }) {
  const { has, toggle, count } = useSamples();
  if (!swatch?.trade || range.priceFrom) return null;
  const line = sampleLine(range, swatch);
  const on = has(line.productId, line.colour);
  const full = !on && count >= MAX_SAMPLES;
  return (
    <button type="button" onClick={() => toggle(line)} disabled={full} aria-pressed={on} style={big ? { ...btn(on), ...bigBtn } : btn(on)}>
      {on ? "Sample added ✓" : full ? `Sample request full (${MAX_SAMPLES})` : "Add sample"}
    </button>
  );
}

/** A range card: one colour adds directly, several open a picker to tick the colours wanted. */
export function RangeSampleButton({ range }: { range: WebsiteRange }) {
  const { samples } = useSamples();
  const [open, setOpen] = useState(false);
  const swatches = useMemo(() => sampleSwatches(range), [range]);
  if (!swatches.length) return null;
  if (swatches.length === 1) return <SampleToggle range={range} swatch={swatches[0]} />;
  const picked = swatches.filter((s) => samples.some((x) => x.productId === s.trade!.productId && x.colour === s.colour)).length;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={btn(picked > 0)}>
        {picked ? `Samples: ${picked} picked` : "Add samples"}
      </button>
      {open && <SamplePicker range={range} swatches={swatches} onClose={() => setOpen(false)} />}
    </>
  );
}

function SamplePicker({ range, swatches, onClose }: { range: WebsiteRange; swatches: Swatch[]; onClose: () => void }) {
  const { has, toggle, count } = useSamples();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Samples of ${range.name}`} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(14,20,24,.5)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "min(480px, 100%)", maxHeight: "90dvh", overflowY: "auto", background: "#fff", borderRadius: 18, border: "1px solid var(--line)", boxShadow: "0 30px 70px -30px rgba(32,48,58,.6)" }}>
        <div style={{ display: "flex", gap: 12, padding: "18px 20px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1.25 }}>{range.name}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a8577" }}>Tick the colours you would like a free sample of.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", color: "#8a8577", fontSize: 22, lineHeight: 1, padding: 2, alignSelf: "flex-start" }}>&times;</button>
        </div>
        <div style={{ padding: "14px 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(124px, 1fr))", gap: 10 }}>
            {swatches.map((s) => {
              const line = sampleLine(range, s);
              const on = has(line.productId, line.colour);
              const full = !on && count >= MAX_SAMPLES;
              return (
                <button key={`${line.productId}-${s.colour}`} type="button" onClick={() => toggle(line)} disabled={full} aria-pressed={on}
                  style={{ padding: 0, textAlign: "left", cursor: full ? "not-allowed" : "pointer", borderRadius: 12, overflow: "hidden", background: "#fff", border: on ? "2px solid var(--accent)" : "1px solid var(--line)", opacity: full ? 0.5 : 1, position: "relative" }}>
                  <div style={{ aspectRatio: "1 / 1", background: s.swatchHex || "#e7e2d6" }}>
                    {s.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                  </div>
                  <div style={{ padding: "7px 9px 8px", fontSize: 12.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3 }}>{s.colour}</div>
                  {on && <span aria-hidden style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 99, background: "var(--accent)", color: "#fff6ee", fontSize: 13, fontWeight: 800, display: "grid", placeItems: "center" }}>✓</span>}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#5a6067", fontWeight: 600 }}>{count} sample{count === 1 ? "" : "s"} in your request</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onClose} style={{ padding: "11px 18px", borderRadius: 11, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Done</button>
              <Link href="/trade/samples" style={{ padding: "11px 18px", borderRadius: 11, background: "var(--accent)", color: "#fff6ee", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>View samples</Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const btn = (on: boolean): CSSProperties => ({
  marginTop: 8,
  width: "100%",
  padding: "9px 12px",
  borderRadius: 11,
  border: on ? "1px solid color-mix(in oklab, var(--accent) 45%, var(--line))" : "1px solid var(--line)",
  background: on ? "color-mix(in oklab, var(--accent) 9%, #fff)" : "#fff",
  color: on ? "var(--accent)" : "#3a4750",
  fontWeight: 700,
  fontSize: 13.5,
  cursor: "pointer",
});

const bigBtn: CSSProperties = { marginTop: 0, width: "auto", padding: "14px 26px", borderRadius: 99, fontSize: 15 };
