// LATICRETE coverage formulas, taken from LATICRETE Australia's own "Product Coverage" calculator
// spreadsheet (V5), and checked against the data sheets (e.g. SPECTRALOCK PRO Full on 300x300x9
// tile with a 3 mm joint = 16.7 m², as DS-1192). Estimates only; add waste.

export type GroutProduct = { slug: string; name: string; unit: string; volumeCm3: number; minJoint: number; maxJoint: number; note?: string };

// Unit volumes (cm³) from the spreadsheet. PERMACOLOR New & Improved is not in it yet, so it uses
// the spreadsheet's PERMACOLOR 10 kg volume (slightly under DS-1312's figures, so a little cautious).
export const GROUTS: GroutProduct[] = [
  { slug: "laticrete-permacolor-select-grout", name: "PERMACOLOR Select", unit: "5 kg base + colour kit", volumeCm3: 3116.7, minJoint: 1.5, maxJoint: 12 },
  { slug: "laticrete-permacolor-grout-new-improved", name: "PERMACOLOR New & Improved", unit: "10 kg bag", volumeCm3: 6157.9, minJoint: 1.5, maxJoint: 12 },
  { slug: "laticrete-spectralock-pro-epoxy-grout-mini", name: "SPECTRALOCK PRO Mini", unit: "Mini unit", volumeCm3: 740, minJoint: 1.5, maxJoint: 12, note: "Epoxy" },
  { slug: "laticrete-spectralock-pro-epoxy-grout-full", name: "SPECTRALOCK PRO Full", unit: "Full unit", volumeCm3: 2961, minJoint: 1.5, maxJoint: 12, note: "Epoxy" },
];

/** m² one unit of grout covers, for a tile W x L x T mm with a J mm joint (LATICRETE's formula). */
export function groutCoverage(volumeCm3: number, w: number, l: number, t: number, j: number): number {
  if (!(w > 0 && l > 0 && t > 0 && j > 0)) return 0;
  return volumeCm3 / ((w + l + j) * t * j * (1000 / ((w + j) * (l + j))));
}

export type AdhesiveProduct = { slug: string; name: string; unit: string; mortarLitres: number; notches: number[]; note?: string };

// Mixed mortar per unit (litres) = powder kg x (1 + water ratio) / wet density, per the spreadsheet.
// TRI-LITE is not in it, so its volume is set from its data sheet (DS-1295: 3.9-4.4 m² at 10 mm).
// Multimastic is ready to use, so its volume is simply the pail (matches DS-1055).
const mortar = (kg: number, ratio: number, density: number) => (kg * (1 + ratio)) / density;
export const ADHESIVES: AdhesiveProduct[] = [
  { slug: "laticrete-335-premium-flexible-adhesive", name: "335 Premium Flexible", unit: "20 kg bag", mortarLitres: mortar(20, 0.2625, 1.6), notches: [6, 8, 10, 12, 15] },
  { slug: "laticrete-254-premium-adhesive", name: "254 Premium", unit: "20 kg bag", mortarLitres: mortar(20, 0.245, 1.7), notches: [6, 8, 10, 12, 15] },
  { slug: "laticrete-tri-lite-lightweight-adhesive", name: "TRI-LITE Lightweight", unit: "11 kg bag", mortarLitres: 4.15 * 0.707 * 5, notches: [6, 8, 10, 12, 15] },
  { slug: "laticrete-multimastic-premium-ready-to-use-adhesive", name: "Multimastic Premium", unit: "4 L pail", mortarLitres: 4, notches: [6, 8], note: "Dry interior walls and splashbacks only" },
  { slug: "laticrete-335-rapid-adhesive", name: "335 RAPID", unit: "20 kg bag", mortarLitres: mortar(20, 0.245, 1.8), notches: [6, 8, 10, 12, 15], note: "Ordered in" },
  { slug: "laticrete-257-titanium-adhesive", name: "257 TITANIUM", unit: "11 kg bag", mortarLitres: mortar(11, 0.44, 1.1), notches: [6, 8, 10, 12, 15], note: "Ordered in" },
  { slug: "laticrete-mvis-veneer-mortar", name: "MVIS Veneer Mortar", unit: "20 kg bag", mortarLitres: mortar(20, 0.265, 1.6), notches: [6, 8, 10, 12, 15], note: "Stone cladding. Ordered in" },
];

/** m² one unit covers with a square-notch trowel of n mm, trowel held at 45° (LATICRETE's formula). */
export function adhesiveCoverage(mortarLitres: number, notch: number): number {
  const bedMm = 0.707 * (notch / 2 + notch / 2) / 2;
  return notch > 0 ? mortarLitres / bedMm : 0;
}

export const unitsNeeded = (areaM2: number, perUnit: number, wastePct: number) =>
  perUnit > 0 && areaM2 > 0 ? Math.ceil((areaM2 * (1 + wastePct / 100)) / perUnit) : 0;

/** Typical notch for a tile's longest side (a guide; full coverage under the tile is what matters). */
export function suggestedNotch(longestMm: number): number {
  if (longestMm <= 300) return 6;
  if (longestMm <= 600) return 10;
  return 12;
}

// Shared styles for the calculator pages (kept here so server pages can import them).
export const calcStyles = `
  .lc-grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
  .lc-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .lc-table-wrap { overflow-x: auto; }
  .lc-table { width: 100%; border-collapse: collapse; font-size: 14.5px; min-width: 460px; }
  .lc-table thead th { text-align: left; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #6b746f; padding: 8px 10px 8px 0; border-bottom: 2px solid var(--ink); }
  .lc-table tbody th { text-align: left; font-family: var(--font-archivo); font-weight: 800; padding: 12px 10px 12px 0; border-bottom: 1px solid var(--line); }
  .lc-table td { padding: 12px 10px 12px 0; border-bottom: 1px solid var(--line); color: #3a444a; white-space: nowrap; }
  .lc-note, .lc-warn { display: block; font-family: var(--font-manrope, inherit); font-weight: 600; font-size: 12px; color: #8a8577; margin-top: 2px; }
  .lc-warn { color: #a5543a; }
  @media (min-width: 900px) { .lc-grid { grid-template-columns: 0.9fr 1.1fr; align-items: start; } }
`;
