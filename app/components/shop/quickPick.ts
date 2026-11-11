import type { ProductOptions } from "../../../lib/options";

// Shared by the (server) product view and the (client) OptionsQuickPick: a server
// component can't call a function exported from a "use client" file.
/** Supply departments: sold per length/pack, priced on request until the supplier list arrives. */
export const SUPPLY = new Set(["adhesives", "trims", "wastes", "accessories"]);
/** Inline picker beside the photo for every product with options EXCEPT vanities.
 *  Reagan 2026-11-12: the step-by-step builder is ONLY for vanities; anything else (trims with 28
 *  finishes, mirrors, shaving cabinets, wastes, tools) keeps the compact picker however many choices
 *  it has; typed answers (Dulux colour name etc.) are text boxes in the picker. */
export function isQuickPick(o: ProductOptions | null | undefined, department?: string | null): boolean {
  return !!o && department !== "vanities";
}
