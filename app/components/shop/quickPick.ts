import type { ProductOptions } from "../../../lib/options";

// Shared by the (server) product view and the (client) OptionsQuickPick: a server
// component can't call a function exported from a "use client" file.
/** Few enough choices to pick inline: no typed answers, no price table, short lists. */
export function isQuickPick(o: ProductOptions | null | undefined, department?: string | null): boolean {
  if (!o || department === "vanities" || department === "bathroom-storage" || o.table) return false;
  return o.groups.length <= 3 && o.groups.every((g) => g.type !== "text" && g.choices.length <= 8);
}
