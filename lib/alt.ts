import type { WebsiteRange, Swatch } from "./onbase/client";

// Descriptive, keyword-rich alt text for a product image - built AUTOMATICALLY
// from the product's own data (name, colour, finish, material, department). Every
// image, primary or "see it installed" secondary, gets good alt with zero data
// entry: add a photo in OnBase and its alt text writes itself here. This is the
// single source of truth for image alt across the whole storefront.

// Department slug -> the noun that reads naturally in alt text ("... floor tile").
const DEPT_NOUN: Record<string, string> = {
  tiles: "tile",
  flooring: "flooring",
  carpet: "carpet",
  tapware: "tapware",
  basins: "basin",
  trims: "trim tile",
  adhesives: "adhesive",
  tools: "tool",
  accessories: "",
};

function spec(range: WebsiteRange, re: RegExp): string | null {
  const s = (range.specs ?? []).find((x) => re.test(x.label));
  return s?.value?.trim() || null;
}

export function imageAlt(
  range: WebsiteRange,
  opts?: { swatch?: Swatch | null; kind?: "primary" | "installed" | "swatch" },
): string {
  const kind = opts?.kind ?? "primary";
  const colour = opts?.swatch?.colour?.trim() || "";
  const finish = spec(range, /finish/i);
  const material = spec(range, /material|construction/i);
  const noun = (range.department && DEPT_NOUN[range.department]) || "";
  // e.g. "gloss ceramic tile" - degrades gracefully to "" when specs are absent.
  const descriptor = [finish, material, noun].filter(Boolean).join(" ").toLowerCase();

  // Small swatch-selector thumbnail: the colour is the useful label.
  if (kind === "swatch") return [range.name, colour].filter(Boolean).join(" ") || range.name;

  const base = [range.name, colour, descriptor].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (kind === "installed") return `${base}, installed in a room`;
  return base || range.name;
}
