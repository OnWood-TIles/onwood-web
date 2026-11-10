"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ADHESIVES, GROUTS, adhesiveCoverage, groutCoverage, suggestedNotch, unitsNeeded } from "../../../lib/laticreteCalc";
import { addQuote } from "../../../lib/quoteCart";
import Picker from "../../adhesive-and-grout-guide/Picker";

/** What the quote list needs for a product, from the live feed (passed in by the page). */
export type QuoteProduct = { rangeId: string; name: string; image: string | null; unit: string; price: number | null; colour: string | null; coverageM2: number | null };
type Row = { slug: string; name: string; unit: string; per: number; units: number; note?: string; warn?: string };

// Grout + adhesive calculators (LATICRETE's own coverage formulas, lib/laticreteCalc.ts).
// Enter the job once and every product we sell shows its coverage and how many units you need.

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: "clamp(18px,3vw,28px)" };
const lab: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 6px" };
const inp: React.CSSProperties = { width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 16, fontFamily: "inherit", background: "#fbfaf6", color: "var(--ink)", boxSizing: "border-box" };
const pill = (on: boolean): React.CSSProperties => ({ padding: "8px 12px", borderRadius: 99, border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`, background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--ink)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" });
const num = (s: string) => { const n = parseFloat(s); return Number.isFinite(n) ? n : 0; };
const fmt = (n: number) => (n >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

function Field({ label, value, onChange, suffix, width }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; width?: number }) {
  return (
    <label style={{ display: "block", minWidth: 0, width }}>
      <span style={lab}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))} style={inp} />
        {suffix && <span style={{ fontSize: 14, color: "#6b746f", whiteSpace: "nowrap" }}>{suffix}</span>}
      </span>
    </label>
  );
}

function Results({ rows, unitWord, highlight, action }: { rows: Row[]; unitWord: string; highlight?: string | null; action?: (r: Row) => React.ReactNode }) {
  return (
    <div className="lc-table-wrap">
      <table className="lc-table">
        <thead><tr><th>Product</th><th>Pack</th><th>Covers per pack</th><th>{unitWord}</th>{action && <th aria-label="Add to quote" />}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className={r.slug === highlight ? "lc-hl" : undefined}>
              <th scope="row">
                {r.slug === highlight && <span className="lc-badge">Recommended for your job</span>}
                <Link href={`/product/${r.slug}`} style={{ color: "var(--ink)" }}>{r.name}</Link>
                {r.note && <span className="lc-note">{r.note}</span>}
                {r.warn && <span className="lc-warn">{r.warn}</span>}
              </th>
              <td>{r.unit}</td>
              <td>{r.per > 0 ? `${fmt(r.per)} m²` : "-"}</td>
              <td><strong style={{ fontFamily: "var(--font-archivo)", fontSize: 20 }}>{r.units > 0 ? r.units : "-"}</strong></td>
              {action && <td>{action(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TILE_PRESETS: [string, number, number, number][] = [
  ["600 x 600", 600, 600, 9], ["300 x 600", 300, 600, 9], ["600 x 1200", 600, 1200, 9], ["200 x 1200 plank", 200, 1200, 9],
  ["75 x 300 subway", 75, 300, 8], ["100 x 100", 100, 100, 8], ["50 x 50 mosaic", 50, 50, 6], ["300 x 300", 300, 300, 9],
];

export function GroutCalculator() {
  const [w, setW] = useState("600"), [l, setL] = useState("600"), [t, setT] = useState("9"), [j, setJ] = useState("3");
  const [area, setArea] = useState("20"), [waste, setWaste] = useState(10);
  const W = num(w), L = num(l), T = num(t), J = num(j), A = num(area);
  const rows = GROUTS.map((g) => {
    const per = groutCoverage(g.volumeCm3, W, L, T, J);
    return { slug: g.slug, name: g.name, unit: g.unit, per, units: unitsNeeded(A, per, waste), note: g.note, warn: J && (J < g.minJoint || J > g.maxJoint) ? `Joints ${g.minJoint} to ${g.maxJoint} mm only` : undefined };
  });
  return (
    <div className="lc-grid">
      <div style={card}>
        <p style={lab}>Common tiles</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "0 0 18px" }}>
          {TILE_PRESETS.map(([n, pw, pl, pt]) => (
            <button key={n} type="button" style={pill(W === pw && L === pl && T === pt)} onClick={() => { setW(String(pw)); setL(String(pl)); setT(String(pt)); }}>{n}</button>
          ))}
        </div>
        <div className="lc-fields">
          <Field label="Tile width" value={w} onChange={setW} suffix="mm" />
          <Field label="Tile length" value={l} onChange={setL} suffix="mm" />
          <Field label="Tile thickness" value={t} onChange={setT} suffix="mm" />
          <Field label="Joint width" value={j} onChange={setJ} suffix="mm" />
          <Field label="Area to grout" value={area} onChange={setArea} suffix="m²" />
          <div>
            <span style={lab}>Waste</span>
            <div style={{ display: "flex", gap: 6 }}>{[10, 15].map((p) => <button key={p} type="button" style={pill(waste === p)} onClick={() => setWaste(p)}>{p}%</button>)}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#6b746f", margin: "16px 0 0", lineHeight: 1.55 }}>
          Measure your actual tile: the thickness is the grout depth, so it matters. Add 10% for spills and clean-up, 15% for unglazed or textured tiles.
        </p>
      </div>
      <div style={card}>
        <p style={lab}>You will need</p>
        <Results rows={rows} unitWord="Packs needed" />
        <p style={{ fontSize: 13, color: "#6b746f", margin: "14px 0 0", lineHeight: 1.55 }}>
          PERMACOLOR Select: each pack is one 5 kg base plus one colour kit. SPECTRALOCK PRO: each unit includes the liquids and colour powder; mix a whole unit at a time.
        </p>
      </div>
    </div>
  );
}

function AddButton({ product, slug, units, unitWord, spec }: { product?: QuoteProduct; slug: string; units: number; unitWord: string; spec: string }) {
  const [added, setAdded] = useState<number | null>(null);
  if (!product || units <= 0) return null;
  if (added === units) return <Link href="/quote" className="lc-add lc-added">Added ✓ View quote</Link>;
  return (
    <button type="button" className="lc-add" onClick={() => {
      addQuote({
        kind: "standard", href: `/product/${slug}`, name: product.name, colour: product.colour, image: product.image, rangeId: product.rangeId,
        unit: product.unit, boxQuantity: 1, coverageM2: product.coverageM2, unitPrice: product.price, quantity: units, areaM2: null, wastePct: null, spec: [spec],
      });
      setAdded(units);
    }}>
      Add {units} {unitWord}{units === 1 ? "" : "s"}
    </button>
  );
}

export function AdhesiveCalculator({ products, preset }: { products?: Record<string, QuoteProduct>; preset?: { adhesive: string; notch: number } | null } = {}) {
  const [area, setArea] = useState("20"), [notch, setNotch] = useState(10), [waste, setWaste] = useState(10), [tile, setTile] = useState("600");
  // Follow the picker: switch to its trowel and put its adhesive first.
  useEffect(() => { if (preset) setNotch(preset.notch); }, [preset]);
  const A = num(area);
  const suggested = suggestedNotch(num(tile));
  const rows: Row[] = ADHESIVES.map((a) => {
    const per = adhesiveCoverage(a.mortarLitres, notch);
    const ok = a.notches.includes(notch);
    return { slug: a.slug, name: a.name, unit: a.unit, per: ok ? per : 0, units: ok ? unitsNeeded(A, per, waste) : 0, note: a.note, warn: ok ? undefined : `Use a ${a.notches.join(" or ")} mm notch` };
  });
  const hl = preset?.adhesive ?? null;
  if (hl) rows.sort((a, b) => (b.slug === hl ? 1 : 0) - (a.slug === hl ? 1 : 0));
  const word = (r: Row) => (r.unit.includes("pail") ? "pail" : "bag");
  return (
    <div className="lc-grid">
      <div style={card}>
        <div className="lc-fields">
          <Field label="Area to tile" value={area} onChange={setArea} suffix="m²" />
          <Field label="Longest tile side" value={tile} onChange={setTile} suffix="mm" />
        </div>
        <p style={{ ...lab, marginTop: 18 }}>Square notch trowel</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[6, 8, 10, 12, 15].map((n) => <button key={n} type="button" style={pill(notch === n)} onClick={() => setNotch(n)}>{n} x {n} mm</button>)}
        </div>
        <p style={{ fontSize: 13.5, color: "#3a444a", margin: "10px 0 0" }}>
          A typical notch for that tile is <button type="button" onClick={() => setNotch(suggested)} style={{ border: "none", background: "none", padding: 0, color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5 }}>{suggested} mm</button>{num(tile) > 600 ? ", and back-butter every tile" : ""}.
        </p>
        <p style={{ ...lab, marginTop: 18 }}>Waste</p>
        <div style={{ display: "flex", gap: 6 }}>{[10, 15].map((p) => <button key={p} type="button" style={pill(waste === p)} onClick={() => setWaste(p)}>{p}%</button>)}</div>
        <p style={{ fontSize: 13, color: "#6b746f", margin: "16px 0 0", lineHeight: 1.55 }}>
          Based on a trowel held at 45°. Back-buttering, uneven floors and rough surfaces use more, so allow extra. Lift a tile to check the back is fully covered.
        </p>
      </div>
      <div style={card}>
        <p style={lab}>You will need</p>
        <Results rows={rows} unitWord="Bags / pails" highlight={hl} action={products ? (r) => (
          <AddButton product={products[r.slug]} slug={r.slug} units={r.units} unitWord={word(r)} spec={`For ${A} m² with a ${notch} x ${notch} mm notch + ${waste}% waste (adhesive calculator)`} />
        ) : undefined} />
        <p style={{ fontSize: 13, color: "#6b746f", margin: "14px 0 0", lineHeight: 1.55 }}>
          Add to quote puts that number of bags on your quote list, where you can still change it before you send it.
        </p>
      </div>
    </div>
  );
}

/** The adhesive calculator page: the picker on top drives the calculator below. */
export function AdhesiveCalcWithPicker({ products }: { products: Record<string, QuoteProduct> }) {
  const [preset, setPreset] = useState<{ adhesive: string; notch: number } | null>(null);
  return (
    <>
      <section className="ag-dark lc-picker">
        <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, margin: "0 0 6px", color: "#fff" }}>
          1. Which adhesive? <span style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "#cfe3e1" }}>Answer three questions</span>
        </h2>
        <p style={{ margin: "0 0 20px", color: "#cfe3e1", fontSize: 15 }}>Already know? Skip straight to the calculator below.</p>
        <Picker onResult={setPreset} hideQuantity />
      </section>
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, margin: "36px 0 14px" }}>2. How much, and add it to your quote</h2>
      <AdhesiveCalculator products={products} preset={preset} />
    </>
  );
}
