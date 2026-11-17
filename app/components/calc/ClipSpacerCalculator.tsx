"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CLIP_FOR_JOINT, CLIP_SLUG, JOINTS, PLIERS_SLUG, SPACER_SLUG, WEDGE_SLUG, cheapestPacks, clipsPerTile, clipsSuggested,
  spacersPerTile, tilesIn, withSpare, type Joint, type Pack,
} from "../../../lib/clipSpacerCalc";
import { addQuote } from "../../../lib/quoteCart";
import { Field, card, inp, lab, num, pill } from "./LaticreteCalculators";

// Levelling clip, wedge and spacer calculator (lib/clipSpacerCalc.ts). Works out the pieces for the job, then
// the cheapest mix of the packs we sell, and adds them to the quote list in one click.

/** A live product from the feed (passed in by the page), with its packs. Clips: one pack per joint width. */
export type PackProduct = { rangeId: string; name: string; image: string | null; unit: string; packs: Pack[] };
type Line = { slug: string; name: string; note: string; need: number; word: string; buy: { pack: Pack; count: number }[]; optional?: boolean };

// Used when the live feed is unavailable, so the counts still show (no prices, no add buttons).
const FALLBACK: Record<string, Pack[]> = {
  [CLIP_SLUG]: ["1.5 mm", "2 mm", "3 mm"].map((label) => ({ label, size: 500, price: null })),
  [WEDGE_SLUG]: [250, 500].map((size) => ({ label: `Bag of ${size}`, size, price: null })),
  [PLIERS_SLUG]: [{ label: "Standard", size: 1, price: null }],
  spacers: [100, 500, 1000, 5000].map((size) => ({ label: `Bag of ${size.toLocaleString("en-AU")}`, size, price: null })),
};

const TILE_PRESETS: [string, number, number][] = [
  ["600 x 600", 600, 600], ["300 x 600", 300, 600], ["600 x 1200", 600, 1200], ["1200 x 1200", 1200, 1200],
  ["200 x 1200 plank", 200, 1200], ["300 x 300", 300, 300], ["75 x 300 subway", 75, 300], ["100 x 100", 100, 100],
];
const n0 = (n: number) => n.toLocaleString("en-AU");
// "1 bag of 500", "2 bags of 5,000", "1 bucket of 2,000"; clip packs are labelled by joint width, all bags of 500.
function packText(b: { pack: Pack; count: number }, clip: boolean): string {
  if (b.pack.size === 1) return String(b.count);
  const label = clip ? "bag of 500" : b.pack.label.toLowerCase();
  return `${b.count} ${b.count === 1 ? label : label.replace(/^(bag|bucket)/, "$1s")}`;
}

const canAdd = (line: Line, product?: PackProduct) => !!product && line.buy.length > 0 && line.buy.every((b) => b.pack.price != null);
function addLine(line: Line, product: PackProduct, spec: string) {
  for (const b of line.buy) {
    addQuote({
      kind: "standard", href: `/product/${line.slug}`, name: product.name, colour: b.pack.label, image: product.image, rangeId: product.rangeId,
      unit: product.unit, boxQuantity: 1, coverageM2: null, unitPrice: b.pack.price, quantity: b.count, areaM2: null, wastePct: null, spec: [spec],
    });
  }
}

/** Adds the given lines' packs to the quote list; shows "Added" until the numbers change. */
function AddButton({ lines, products, spec, label }: { lines: Line[]; products: Record<string, PackProduct>; spec: string; label: string }) {
  const [added, setAdded] = useState<string | null>(null);
  const ok = lines.filter((x) => canAdd(x, products[x.slug]));
  const sig = ok.map((x) => `${x.slug}:${x.buy.map((b) => `${b.pack.label}x${b.count}`).join("+")}`).join("|");
  if (!ok.length) return null;
  if (added === sig) return <Link href="/quote" className="lc-add lc-added">Added ✓ View quote</Link>;
  return <button type="button" className="lc-add" onClick={() => { for (const x of ok) addLine(x, products[x.slug], spec); setAdded(sig); }}>{label}</button>;
}

export default function ClipSpacerCalculator({ products, initialJoint }: { products: Record<string, PackProduct>; initialJoint?: Joint | null }) {
  const [w, setW] = useState("600"), [l, setL] = useState("600"), [area, setArea] = useState("20"), [perDay, setPerDay] = useState("");
  const [joint, setJoint] = useState<Joint>(initialJoint ?? 2), [offset, setOffset] = useState(false), [spare, setSpare] = useState(10);
  const [clipsChoice, setClipsChoice] = useState<boolean | null>(null);
  const W = num(w), L = num(l), A = num(area);
  const suggested = clipsSuggested(W, L);
  const clips = clipsChoice ?? suggested;
  const day = Math.min(A, num(perDay) || A);

  const tiles = tilesIn(A, W, L, joint);
  const cpt = clipsPerTile(W, L), spt = spacersPerTile(W, L, offset, clips);
  const packsFor = (slug: string, fallback: Pack[]) => products[slug]?.packs?.length ? products[slug].packs : fallback;
  const clipLabel = CLIP_FOR_JOINT[joint];
  const spacerSlug = SPACER_SLUG[joint];

  const lines: Line[] = [];
  if (clips) {
    const needClips = withSpare(tiles * cpt, spare);
    lines.push({ slug: CLIP_SLUG, name: `Levelling clips, ${clipLabel}`, note: joint === 5 ? "3 mm clips with 5 mm spacers at the corners. For tiles 3 to 12 mm thick" : "For tiles 3 to 12 mm thick. Single use", need: needClips, word: "clips", buy: cheapestPacks(needClips, packsFor(CLIP_SLUG, FALLBACK[CLIP_SLUG]).filter((p) => p.label === clipLabel)) });
    const needWedges = withSpare(tilesIn(day, W, L, joint) * cpt, spare);
    lines.push({ slug: WEDGE_SLUG, name: "Levelling wedges", note: day < A ? `Re-usable: enough for ${n0(day)} m² a day` : "Re-usable: enough for the whole job in one go", need: needWedges, word: "wedges", buy: cheapestPacks(needWedges, packsFor(WEDGE_SLUG, FALLBACK[WEDGE_SLUG])) });
    lines.push({ slug: PLIERS_SLUG, name: "Levelling pliers", note: "Optional: pushes the wedges home evenly and saves your hands", need: A > 0 ? 1 : 0, word: "pair", buy: A > 0 ? cheapestPacks(1, packsFor(PLIERS_SLUG, FALLBACK[PLIERS_SLUG])) : [], optional: true });
  }
  const needSpacers = withSpare(tiles * spt, spare);
  lines.push({ slug: spacerSlug, name: `Tile spacers, ${joint} mm`, note: clips ? "One at every corner, with the clips along the edges" : "At every corner, plus upright along the longer edges", need: needSpacers, word: "spacers", buy: cheapestPacks(needSpacers, packsFor(spacerSlug, FALLBACK.spacers)) });

  const spec = `For ${n0(A)} m² of ${W} x ${L} mm tiles, ${joint} mm joints, ${offset ? "brick / offset" : "straight"} layout + ${spare}% spare (clip and spacer calculator)`;
  const total = lines.reduce((s, x) => s + (x.optional ? 0 : x.buy.reduce((t, b) => t + (b.pack.price ?? 0) * b.count, 0)), 0);
  const priced = lines.every((x) => x.buy.every((b) => b.pack.price != null));

  return (
    <div className="lc-grid">
      <div style={card}>
        <p style={lab}>Common tiles</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "0 0 18px" }}>
          {TILE_PRESETS.map(([name, pw, pl]) => (
            <button key={name} type="button" style={pill(W === pw && L === pl)} onClick={() => { setW(String(pw)); setL(String(pl)); }}>{name}</button>
          ))}
        </div>
        <div className="lc-fields">
          <Field label="Tile width" value={w} onChange={setW} suffix="mm" />
          <Field label="Tile length" value={l} onChange={setL} suffix="mm" />
          <Field label="Area to tile" value={area} onChange={setArea} suffix="m²" />
        </div>
        <p style={{ ...lab, marginTop: 18 }}>Joint width</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {JOINTS.map((j) => <button key={j} type="button" style={pill(joint === j)} onClick={() => setJoint(j)}>{j} mm</button>)}
        </div>
        <p style={{ ...lab, marginTop: 18 }}>Layout</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button type="button" style={pill(!offset)} onClick={() => setOffset(false)}>Straight grid</button>
          <button type="button" style={pill(offset)} onClick={() => setOffset(true)}>Brick / offset</button>
        </div>
        <p style={{ ...lab, marginTop: 18 }}>Levelling clips</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button type="button" style={pill(clips)} onClick={() => setClipsChoice(true)}>Yes</button>
          <button type="button" style={pill(!clips)} onClick={() => setClipsChoice(false)}>No</button>
        </div>
        <p style={{ fontSize: 13.5, color: "#3a444a", margin: "10px 0 0" }}>
          {suggested ? "Recommended for this tile: levelling clips keep large tiles flush with each other." : "Usually not needed for tiles this size, unless they are long planks or a very flat finish matters."}
        </p>
        {clips && (
          <div style={{ marginTop: 18, maxWidth: 260 }}>
            <label style={{ display: "block" }}>
              <span style={lab}>Tiled per day</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input inputMode="decimal" value={perDay} placeholder={area || "0"} onChange={(e) => setPerDay(e.target.value.replace(/[^0-9.]/g, ""))}
                  style={inp} />
                <span style={{ fontSize: 14, color: "#6b746f" }}>m²</span>
              </span>
            </label>
          </div>
        )}
        <p style={{ ...lab, marginTop: 18 }}>Spare</p>
        <div style={{ display: "flex", gap: 6 }}>{[10, 15].map((p) => <button key={p} type="button" style={pill(spare === p)} onClick={() => setSpare(p)}>{p}%</button>)}</div>
        <p style={{ fontSize: 13, color: "#6b746f", margin: "16px 0 0", lineHeight: 1.55 }}>
          Wedges come off once the adhesive has set and go again, so you only need enough for one day&apos;s tiling. Add 10% spare for drops and breakages, 15% for lots of cuts.
        </p>
      </div>
      <div style={card}>
        <p style={lab}>You will need</p>
        <p style={{ fontSize: 14.5, color: "#3a444a", margin: "0 0 14px", lineHeight: 1.55 }}>
          {tiles > 0
            ? <>About <strong>{n0(Math.ceil(tiles))} tiles</strong>.{clips && <> {cpt} clips per tile ({Math.round(cpt * tiles / Math.max(A, 1e-9) * 10) / 10} per m²).</>} {spt} {spt === 1 ? "spacer" : "spacers"} per tile.</>
            : "Enter your tile size and area."}
        </p>
        <div className="lc-table-wrap">
          <table className="lc-table cs-table">
            <thead><tr><th>Product</th><th>Pieces</th><th>Buy</th><th aria-label="Add to quote" /></tr></thead>
            <tbody>
              {lines.map((x) => (
                <tr key={x.slug}>
                  <th scope="row">
                    <Link href={`/product/${x.slug}`} style={{ color: "var(--ink)" }}>{x.name}</Link>
                    <span className="lc-note">{x.note}</span>
                  </th>
                  <td>{x.need > 0 ? `${n0(x.need)} ${x.need === 1 ? x.word.replace(/s$/, "") : x.word}` : "-"}</td>
                  <td><strong style={{ fontFamily: "var(--font-archivo)", fontSize: 16 }}>{x.buy.length ? x.buy.map((b) => packText(b, x.slug === CLIP_SLUG)).join(" + ") : "-"}</strong></td>
                  <td><AddButton lines={[x]} products={products} spec={spec} label="Add to quote" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {priced && total > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "16px 0 0" }}>
            <p style={{ fontSize: 14.5, color: "#3a444a", margin: 0 }}>
              About <strong>${total.toFixed(2)}</strong> inc GST{clips ? ", not counting the pliers" : ""}.
            </p>
            <AddButton lines={lines.filter((x) => !x.optional)} products={products} spec={spec} label="Add all to quote" />
          </div>
        )}
        <p style={{ fontSize: 13, color: "#6b746f", margin: "12px 0 0", lineHeight: 1.55 }}>
          We pick the cheapest mix of packs for you. Add to quote puts them on your quote list, where you can still change them before you send it.
        </p>
      </div>
      {/* Phones: each line stacks (product, then pieces and packs, then the button) instead of a wide table. */}
      <style>{`
        @media (max-width: 620px) {
          .lc-table.cs-table { min-width: 0; }
          .lc-table.cs-table thead { display: none; }
          .lc-table.cs-table tr { display: grid; grid-template-columns: 1fr auto; gap: 6px 12px; padding: 14px 0; border-bottom: 1px solid var(--line); }
          .lc-table.cs-table tbody th, .lc-table.cs-table td { border: none; padding: 0; white-space: normal; }
          .lc-table.cs-table tbody th { grid-column: 1 / -1; }
          .lc-table.cs-table td:nth-of-type(2) { text-align: right; }
          .lc-table.cs-table td:nth-of-type(3) { grid-column: 1 / -1; }
          .lc-table.cs-table td:nth-of-type(3):empty { display: none; }
        }
      `}</style>
    </div>
  );
}
