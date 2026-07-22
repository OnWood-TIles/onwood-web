// Sold-unit quantity maths for the trade cart. Products sell in whole multiples
// of a "box" (Product.boxQuantity, expressed in the sold unit). Mirrors OnBase
// lib/coverage.ts so the quantities a trade customer picks match what staff quote.

const EPS = 1e-9;

export const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/** The increment a product is sold in (its "sold in multiples of"), min a whole unit. */
export function stepFor(boxQuantity: number | null | undefined): number {
  return boxQuantity && boxQuantity > 0 ? boxQuantity : 1;
}

/** Round a target quantity UP to the next whole box (multiple of the step). */
export function roundUpToBox(target: number, boxQuantity: number | null | undefined): number {
  const step = stepFor(boxQuantity);
  if (target <= 0) return step;
  const boxes = Math.max(1, Math.ceil(target / step - EPS));
  return round3(boxes * step);
}

/** How many whole boxes a (box-valid) quantity represents. */
export function boxesFor(qty: number, boxQuantity: number | null | undefined): number {
  return Math.max(1, Math.round(qty / stepFor(boxQuantity)));
}

/** True when the product sells in real multi-unit boxes (worth showing "N boxes"). */
export function hasBoxes(boxQuantity: number | null | undefined): boolean {
  return !!boxQuantity && boxQuantity > 1;
}

/** Step a box-valid quantity up/down by one box; never below a single box. */
export function stepQty(current: number, boxQuantity: number | null | undefined, dir: 1 | -1): number {
  const step = stepFor(boxQuantity);
  return round3(Math.max(step, current + dir * step));
}

const AREA_UNITS = new Set(["m2", "m²", "sqm", "sq.m", "m^2"]);
export function isAreaUnit(unit: string | null | undefined): boolean {
  if (!unit) return false;
  return AREA_UNITS.has(unit.toLowerCase().replace(/\s+/g, ""));
}

/** m² one sold unit covers (1 for area units; the stored coverage otherwise). */
export function coveragePerUnit(unit: string | null | undefined, coverageM2: number | null | undefined): number | null {
  if (isAreaUnit(unit)) return 1;
  return coverageM2 && coverageM2 > 0 ? coverageM2 : null;
}

/** Convert a desired area (m²) into a sold-unit quantity, rounded up to whole
 *  boxes. Null when the product can't be converted from area. */
export function unitsForArea(
  areaM2: number,
  unit: string | null | undefined,
  coverageM2: number | null | undefined,
  boxQuantity: number | null | undefined,
): number | null {
  if (!(areaM2 > 0)) return null;
  const cov = coveragePerUnit(unit, coverageM2);
  if (!cov) return null;
  const rawUnits = isAreaUnit(unit) ? areaM2 : Math.ceil(areaM2 / cov - EPS);
  return roundUpToBox(rawUnits, boxQuantity);
}

/** Friendly unit label, pluralised. "Per Unit" reads as unit/units. */
export function unitLabel(unit: string | null | undefined, qty = 1): string {
  const u = (unit ?? "").trim();
  if (isAreaUnit(u)) return "m²";
  if (/^per\s*unit$/i.test(u)) return qty === 1 ? "unit" : "units";
  return u || "unit";
}
