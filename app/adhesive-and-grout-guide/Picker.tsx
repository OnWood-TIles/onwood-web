"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bySlug, SPECTRALOCK_MINI, type Notch } from "./data";

// "Which adhesive and grout?" picker: three questions -> the adhesive, grout and trowel for the
// job, plus an optional bag count. Rules follow LATICRETE's AU data sheets (see data.ts).

type Where = "floor" | "wall" | "splashback" | "shower" | "outdoor" | "pool" | "cladding";
type Tile = "ceramic" | "porcelain" | "large" | "glass" | "stone";

const WHERE: [Where, string][] = [
  ["floor", "Inside floor"], ["wall", "Inside wall"], ["splashback", "Kitchen splashback"], ["shower", "Bathroom or shower"],
  ["outdoor", "Outdoor, alfresco or balcony"], ["pool", "Pool or water feature"], ["cladding", "Stone cladding"],
];
const TILE: [Tile, string][] = [
  ["ceramic", "Ceramic or subway"], ["porcelain", "Porcelain up to 600 mm"], ["large", "Large format, over 600 mm, or thin panels"],
  ["glass", "Glass or glass mosaic"], ["stone", "Natural stone"],
];

const A = {
  s335: "laticrete-335-premium-flexible-adhesive", s254: "laticrete-254-premium-adhesive", tri: "laticrete-tri-lite-lightweight-adhesive",
  mm: "laticrete-multimastic-premium-ready-to-use-adhesive", rapid: "laticrete-335-rapid-adhesive", ti: "laticrete-257-titanium-adhesive",
  mvis: "laticrete-mvis-veneer-mortar", pcs: "laticrete-permacolor-select-grout", pcni: "laticrete-permacolor-grout-new-improved",
  sl: "laticrete-spectralock-pro-epoxy-grout-full",
};

type Result = { adhesive: string; grouts: { slug: string; why: string }[]; notch: Notch; notchText: string; notes: string[] };

function recommend(where: Where, tile: Tile, today: boolean, overTiles: boolean): Result {
  const notes: string[] = [];
  if (where === "cladding") {
    return {
      adhesive: A.mvis, notch: 12, notchText: "12 x 12 mm notch, or back-butter each piece (adhered veneer method)",
      grouts: [], notes: ["Most stacked stone is laid with tight dry joints and needs no grout. If your stone needs pointed joints, ask us.", "MVIS is a special-order product."],
    };
  }
  let adhesive = A.s335;
  if (tile === "glass") { adhesive = A.ti; notes.push("257 TITANIUM can be tinted with a PERMACOLOR Select colour kit so the adhesive behind clear glass matches your grout. It is a special-order product."); }
  else if (where === "splashback") adhesive = tile === "ceramic" || tile === "stone" ? A.mm : A.tri;
  else if (where === "outdoor" || where === "pool") adhesive = A.s254;
  else if (tile === "large") adhesive = where === "wall" ? A.tri : A.s254;
  else if (where === "wall") adhesive = A.tri;

  if (overTiles && ![A.s335, A.s254].includes(adhesive) && adhesive !== A.ti) {
    adhesive = tile === "large" || where === "outdoor" || where === "pool" ? A.s254 : A.s335;
    notes.push("LATICRETE documents tile over tile for 335 and 254, so we have switched to that.");
  }
  if (overTiles) notes.push("Tile over tile: lift any hollow-sounding tiles, scuff shiny glazes, scrub with sugar soap, rinse and dry, then work a 1.5 mm skim coat of adhesive into the old tiles first. No primer needed with 335 or 254.");

  if (today) {
    if (overTiles || tile === "glass") notes.push("Need it finished today? 335 RAPID lets you grout after about 4 hours. Ask us whether it suits your surface.");
    else { adhesive = A.rapid; notes.push("335 RAPID lets you grout and walk on it after about 4 hours. It is a special-order product, so allow a few days."); }
  }

  const notch: Notch = adhesive === A.mm ? 6 : tile === "large" ? (adhesive === A.s254 ? 10 : 12) : tile === "porcelain" ? 10 : 6;
  const notchText = adhesive === A.mm
    ? "6 x 6 mm notch"
    : tile === "large"
    ? "10 mm notch minimum, 12 mm for the biggest tiles, and back-butter every tile"
    : tile === "porcelain" ? "10 x 10 mm notch for 300 to 600 mm tiles, 6 mm for smaller" : "6 x 6 mm notch for small tiles and mosaics";

  const grouts: { slug: string; why: string }[] = [];
  if (where === "splashback" || tile === "glass") {
    grouts.push({ slug: A.sl, why: "Epoxy: stain-proof in the kitchen and never needs sealing. A Mini unit grouts about 2 to 3 m² of 75 x 300 subway tile (about one splashback), about 4 m² of 300 x 300 tile, but only about 1 m² of mosaic. Check yours with the grout calculator." });
    grouts.push({ slug: A.pcs, why: "The easier cement option if you would rather not work with epoxy." });
  } else if (where === "shower") {
    grouts.push({ slug: A.pcs, why: "For the walls and floor: no sealing needed, with mould protection built in." });
    grouts.push({ slug: A.pcni, why: "The pre-coloured 10 kg option, just as suited and good value for a bigger bathroom." });
    grouts.push({ slug: A.sl, why: "Worth it on the shower floor if you want grout that stays clean and never stains." });
  } else if (where === "pool") {
    grouts.push({ slug: A.sl, why: "Epoxy for pools and fountains. Cure 10 days before filling." });
    grouts.push({ slug: A.pcs, why: "Cement option. Cure 14 days before filling." });
  } else if (where === "outdoor") {
    grouts.push({ slug: A.pcs, why: "Fast setting, no sealing needed, inside and out." });
    grouts.push({ slug: A.pcni, why: "Equally suited outdoors, pre-coloured in 10 kg bags and good value for big areas." });
  } else {
    grouts.push({ slug: A.pcs, why: "An everyday choice: 40 colours, 5 kg base plus colour kit, no sealing needed." });
    grouts.push({ slug: A.pcni, why: "Equally good for everyday jobs: pre-coloured 10 kg bags in 20 colours, great value for bigger areas." });
    grouts.push({ slug: A.sl, why: "Choose epoxy where stains matter most." });
  }
  if (tile === "stone") notes.push("Seal natural stone before grouting so the grout colour cannot stain it. Epoxy grout can change the colour of white or porous stone such as Carrara, so test first.");
  if (where === "outdoor" || where === "pool") notes.push("Outdoors, strong sun can darken light epoxy colours and fade dark ones slightly over time.");
  if (where === "splashback") notes.push("Where the splashback meets the benchtop, use a flexible silicone, not grout.");
  return { adhesive, grouts, notch, notchText, notes };
}

const chip = (on: boolean): React.CSSProperties => ({
  padding: "10px 14px", borderRadius: 99, border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
  background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--ink)", fontWeight: 700, fontSize: 14,
  cursor: "pointer", fontFamily: "inherit", lineHeight: 1.2,
});
const q: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 10px" };

/** onResult: lets the adhesive calculator follow the recommendation (it then shows the
 *  quantity itself, so it passes hideQuantity). */
export default function Picker({ onResult, hideQuantity }: { onResult?: (r: { adhesive: string; notch: Notch } | null) => void; hideQuantity?: boolean } = {}) {
  const [where, setWhere] = useState<Where | null>(null);
  const [tile, setTile] = useState<Tile | null>(null);
  const [today, setToday] = useState(false);
  const [overTiles, setOverTiles] = useState(false);
  const [area, setArea] = useState("");

  const ready = where === "cladding" ? true : !!(where && tile);
  const r = ready && where ? recommend(where, tile ?? "porcelain", today, overTiles) : null;
  const adh = r ? bySlug(r.adhesive) : null;
  const m2 = parseFloat(area);
  const per = adh?.perNotch?.[r!.notch] ?? (adh?.perNotch ? Object.values(adh.perNotch)[0] : undefined);
  const packs = per && m2 > 0 ? Math.ceil((m2 * 1.1) / per[0]) : null;
  const unit = adh?.pack.includes("pail") ? "pail" : "bag";
  const resultKey = r ? `${r.adhesive}|${r.notch}` : "";
  useEffect(() => {
    if (!onResult) return;
    onResult(r ? { adhesive: r.adhesive, notch: r.notch } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);

  return (
    <div className="ag-picker">
      <div>
        <p style={q}>1. Where are you tiling?</p>
        <div className="ag-chips">{WHERE.map(([k, l]) => <button key={k} type="button" style={chip(where === k)} onClick={() => setWhere(k)}>{l}</button>)}</div>
      </div>
      {where && where !== "cladding" && (
        <div style={{ marginTop: 22 }}>
          <p style={q}>2. What tile?</p>
          <div className="ag-chips">{TILE.map(([k, l]) => <button key={k} type="button" style={chip(tile === k)} onClick={() => setTile(k)}>{l}</button>)}</div>
        </div>
      )}
      {where && where !== "cladding" && (
        <div style={{ marginTop: 22 }}>
          <p style={q}>3. Anything else?</p>
          <div className="ag-chips">
            <button type="button" style={chip(today)} onClick={() => setToday(!today)}>It must be finished today</button>
            <button type="button" style={chip(overTiles)} onClick={() => setOverTiles(!overTiles)}>Tiling over old tiles</button>
          </div>
        </div>
      )}

      {r && adh && (
        <div className="ag-result" aria-live="polite">
          <div className="ag-result-grid">
            <div>
              <p style={{ ...q, color: "#7fc4bd" }}>Your adhesive</p>
              <Link href={`/product/${adh.slug}`} className="ag-res-name">{adh.name}</Link>
              <p className="ag-res-p">{adh.rating} · {adh.pack}{adh.status ? ` · ${adh.status}` : ""}</p>
              <p className="ag-res-p"><strong>Trowel:</strong> {r.notchText}.</p>
              {hideQuantity ? (
                <p className="ag-res-p" style={{ color: "#fff", fontWeight: 700, marginTop: 12 }}>Your quantity is worked out below, ready to add to your quote.</p>
              ) : (<>
              <label className="ag-res-p" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <span>Area to tile</span>
                <input inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 12"
                  style={{ width: 80, padding: "7px 10px", borderRadius: 8, border: "1px solid #3d5560", background: "#0f1c22", color: "#fff", fontSize: 15, fontFamily: "inherit" }} />
                <span>m²</span>
              </label>
              {packs != null && (
                <p className="ag-res-p" style={{ color: "#fff", fontWeight: 700 }}>
                  About {packs} {unit}{packs === 1 ? "" : "s"}, including 10% spare. Back-buttering and uneven floors use more.
                </p>
              )}
              </>)}
            </div>
            <div>
              <p style={{ ...q, color: "#7fc4bd" }}>{r.grouts.length ? "Your grout" : "Grout"}</p>
              {r.grouts.length === 0 && <p className="ag-res-p">See the note below.</p>}
              {r.grouts.map((g, i) => {
                const p = bySlug(g.slug);
                return (
                  <div key={g.slug} style={{ marginBottom: 12 }}>
                    <Link href={`/product/${g.slug === A.sl && where === "splashback" ? SPECTRALOCK_MINI : p.slug}`} className="ag-res-name" style={{ fontSize: i ? 16 : 19 }}>
                      {i ? "Or " : ""}{p.short}
                    </Link>
                    <p className="ag-res-p">{g.why}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {r.notes.length > 0 && (
            <ul style={{ margin: "16px 0 0", paddingLeft: 18, listStyle: "disc", color: "#d7e2e0", fontSize: 14.5, lineHeight: 1.6 }}>
              {r.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          )}
          {!hideQuantity && <p style={{ margin: "16px 0 0", fontSize: 13, color: "#9fb4b2" }}>
            A guide only. For exact quantities use the <Link href="/adhesive-calculator" style={{ color: "#cfe3e1" }}>adhesive</Link> and <Link href="/grout-calculator" style={{ color: "#cfe3e1" }}>grout</Link> calculators, or add the products to your quote and we will check everything for your job.
          </p>}
        </div>
      )}
    </div>
  );
}
