import type { FilterGroup } from "./onbase/client";

// Shared filter-bar view-model builder for the department pages (public shop AND
// the trade portal), so both present identical filters. Turns the tenant's filter
// groups into the shape FilterBar/DepartmentShop render, adding colour dots and
// tile-size glyphs where relevant.

export type FilterGroupVM = {
  slug: string;
  label: string;
  values: { slug: string; label: string; hex?: string | null; size?: { w: number; h: number } | null }[];
};

// Best-effort colour dots for the Colour filter group. A known colour renders a
// dot; anything else just shows the label.
const COLOUR_HEX: Record<string, string> = {
  white: "#f4f1ea", cream: "#efe7d6", ivory: "#f0e9d8", beige: "#e3d7c0", sand: "#e0cfa8", tan: "#d8c3a0",
  brown: "#8a5a3b", timber: "#b07a4e", terracotta: "#c46a44", rust: "#b0563a", clay: "#c17a53",
  grey: "#9aa0a2", gray: "#9aa0a2", silver: "#c3c6c4", charcoal: "#3f4547", black: "#20282b",
  green: "#7e9678", sage: "#a6b8a0", olive: "#8a8b5c", blue: "#5b7c99", navy: "#2f4356", teal: "#3f6b6b",
  stone: "#c9c1b2", natural: "#d8cdb6", oatmeal: "#e5dcc7", pink: "#e0b8ad", blush: "#e8cfc6",
};
const colourHex = (v: { slug: string; label: string }): string | null =>
  COLOUR_HEX[(v.slug || "").toLowerCase()] ?? COLOUR_HEX[(v.label || "").toLowerCase()] ?? null;

const isSizeGroup = (g: { slug: string; label: string }) => /size/i.test(g.slug) || /size/i.test(g.label);
const parseSize = (label: string): { w: number; h: number } | null => {
  const m = (label || "").match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
};

/** The filter groups that apply to a department (non-empty + scoped), as view
 *  models for FilterBar. */
export function buildFilterGroupVMs(allFilterGroups: FilterGroup[], department: string): FilterGroupVM[] {
  return allFilterGroups
    .filter((g) => g.values.length > 0 && (!g.departments?.length || g.departments.includes(department)))
    .map((g) => ({
      slug: g.slug,
      label: g.label,
      values: g.values.map((v) => ({
        slug: v.slug,
        label: v.label,
        hex: g.slug === "colour" ? colourHex(v) : null,
        size: isSizeGroup(g) ? parseSize(v.label) : null,
      })),
    }));
}

/** Parse ?f=group:value clauses from the URL, keeping only values that exist in
 *  the given groups. */
export function parseActiveFilters(f: string | string[] | undefined, groups: FilterGroupVM[]): Record<string, string[]> {
  const active: Record<string, string[]> = {};
  for (const clause of Array.isArray(f) ? f : f ? [f] : []) {
    const i = clause.indexOf(":");
    if (i <= 0) continue;
    const group = clause.slice(0, i);
    const value = clause.slice(i + 1);
    if (groups.some((g) => g.slug === group && g.values.some((v) => v.slug === value))) (active[group] ??= []).push(value);
  }
  return active;
}
