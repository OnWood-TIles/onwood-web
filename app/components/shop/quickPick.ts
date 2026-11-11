import type { ProductOptions } from "../../../lib/options";

// Shared by the (server) product view and the (client) OptionsQuickPick: a server
// component can't call a function exported from a "use client" file.
/** Supply departments: sold per length/pack, priced on request until the supplier list arrives. */
export const SUPPLY = new Set(["adhesives", "trims", "wastes", "accessories"]);
/** Few enough choices to pick inline: no typed answers, no price table, short lists. */
export function isQuickPick(o: ProductOptions | null | undefined, department?: string | null): boolean {
  if (!o || department === "vanities" || department === "bathroom-storage") return false;
  // Supply lines (e.g. trims: size x finish) use a small price table but still pick inline.
  if (o.table && !SUPPLY.has(department ?? "")) return false;
  return o.groups.length <= 3 && o.groups.every((g) => g.type !== "text" && g.choices.length <= (SUPPLY.has(department ?? "") ? 12 : 8));
}
