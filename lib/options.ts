// Product options - an exact copy of OnBase lib/configPricing.ts (pure pricing /
// availability / spec logic), so the website builder prices a build exactly like
// OnBase does. Prices arrive GST-INCLUSIVE from the feed. Keep the two in sync.

export type DrawingStyle = "none" | "vanity" | "tallboy" | "shaver" | "mirror";
export const DRAWING_STYLES: { value: DrawingStyle; label: string }[] = [
  { value: "none", label: "None (photo and swatches only)" },
  { value: "vanity", label: "Vanity" },
  { value: "tallboy", label: "Tallboy" },
  { value: "shaver", label: "Shaving cabinet" },
  { value: "mirror", label: "Mirror" },
];

/** What a choice contributes to the generated line drawing. */
export interface DrawMeta {
  width?: number | null; // mm
  basinLayout?: string | null; // centre | off centre | double
  config?: string; // "1 door 4 drawer"
  mount?: "wallmount" | "kick" | "legs" | null;
  basin?: "above" | "under" | "moulded" | "none"; // none = cabinet only (no top or basin)
  shape?: "rect" | "round" | "oval" | "arch" | "capsule" | "hexagon";
  doors?: number;
}

export interface OptionChoice {
  key: string;
  label: string;
  detail?: string; // short line under the label, e.g. "1500mm · double basin"
  section?: string; // sub-heading inside a long list, e.g. "Duragrain"
  code?: string; // supplier model code (e.g. Marquis "Camden 14")
  price?: number; // flat price for this choice (negative = a credit, e.g. customer supplies own basin)
  priceBy?: { group: string; prices: Record<string, number | null> }; // price depends on another group's choice; missing/null = not offered
  onlyWith?: Record<string, string[]>; // only offered when each listed group has one of these choices
  image?: string | null;
  draw?: DrawMeta;
  notInFrom?: boolean; // leave out of the "from" price (e.g. a cabinet-only option)
}

export interface OptionGroup {
  key: string;
  label: string;
  type: "single" | "multi" | "text"; // pick one | tick any | typed in
  required?: boolean;
  help?: string;
  placeholder?: string; // text groups
  websiteHidden?: boolean; // staff-only detail (not asked on the website)
  specDetail?: boolean; // add each choice's detail to the document spec line (e.g. sizes)
  choices: OptionChoice[];
}

/** Price that depends on several choices together. Keys = choice keys joined by "|" in `groups` order. */
export interface PriceTable {
  groups: string[];
  cells: Record<string, number | null>;
  codes?: Record<string, string>; // supplier order code per combination (same keys) - shown on POs, never to customers
}

export interface ProductOptions {
  version: 2;
  drawing: DrawingStyle;
  basePrice: number;
  groups: OptionGroup[];
  table?: PriceTable | null;
  source?: { supplier?: string; document?: string; edition?: string | null };
}

export type OptionSelection = Record<string, string | string[] | undefined>;

export interface PricedLine { label: string; amount: number }
export interface PricedOptions { ok: boolean; errors: string[]; lines: PricedLine[]; total: number; totalIncGst: number }

/** Frozen onto QuoteItem / JobSheetItem / InvoiceItem / PurchaseOrderItem.configJson. */
export interface LineConfig {
  productId: string;
  edition: string | null;
  selection: OptionSelection;
  priced: PricedOptions;
  spec: string[];
  drawing?: { style: DrawingStyle; meta: DrawMeta } | null;
  code?: string | null; // supplier order code of the chosen combination (price table)
}

/** Supplier order code for the chosen combination, when the price table has codes. */
export function comboCode(o: ProductOptions, sel: OptionSelection): string | null {
  if (!o.table?.codes) return null;
  return o.table.codes[o.table.groups.map((g) => one(sel[g]) ?? "").join("|")] ?? null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round4 = (n: number) => Math.round(n * 10000) / 10000;
export const exGst = (inc: number) => round4(inc / 1.1);
export const incGst = (ex: number) => round2(ex * 1.1);

export function asOptions(v: unknown): ProductOptions | null {
  const o = v as ProductOptions | null;
  return o && typeof o === "object" && o.version === 2 && Array.isArray(o.groups) ? o : null;
}

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
export const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const tableKey = (t: PriceTable, sel: OptionSelection) => t.groups.map((g) => one(sel[g]) ?? "").join("|");

/** Price of one choice given the rest of the selection (null = not offered with it). */
export function choicePrice(c: OptionChoice, sel: OptionSelection): number | null {
  if (c.priceBy) {
    const other = one(sel[c.priceBy.group]);
    const vals = Object.values(c.priceBy.prices).filter((x): x is number => x != null);
    if (!other) return vals.length ? Math.min(...vals) : null;
    const p = c.priceBy.prices[other];
    return p == null ? null : p;
  }
  return c.price ?? 0;
}

/**
 * Is this choice offered with the current selection? Only choices made EARLIER (in
 * group order) constrain it, so changing a later pick never rewrites an earlier one -
 * picking a size keeps the size and re-picks the mounting/benchtop if needed.
 */
export function isAvailable(o: ProductOptions, g: OptionGroup, c: OptionChoice, sel: OptionSelection): boolean {
  for (const [gk, keys] of Object.entries(c.onlyWith ?? {})) {
    if (!many(sel[gk]).some((k) => keys.includes(k))) return false;
  }
  if (c.priceBy && one(sel[c.priceBy.group]) && choicePrice(c, sel) == null) return false;
  const t = o.table;
  if (t && t.groups.includes(g.key)) {
    // Offered if any priced cell matches this choice + the earlier table groups' picks.
    const idx = t.groups.indexOf(g.key);
    const order = (k: string) => o.groups.findIndex((x) => x.key === k);
    const fixed = t.groups.map((gk, i) => (i === idx ? c.key : order(gk) < order(g.key) ? one(sel[gk]) : undefined));
    return Object.entries(t.cells).some(([k, v]) => {
      if (v == null) return false;
      const parts = k.split("|");
      return parts[idx] === c.key && fixed.every((f, i) => i === idx || !f || parts[i] === f);
    });
  }
  return true;
}

/**
 * Make a selection valid: walk groups in order, drop choices no longer offered and
 * fill required single groups with their first offered choice. Used after every pick.
 */
export function normalizeSelection(o: ProductOptions, input: OptionSelection): OptionSelection {
  const sel: OptionSelection = { ...input };
  for (let pass = 0; pass < 2; pass++) {
    for (const g of o.groups) {
      if (g.type === "text") continue;
      if (g.type === "multi") {
        sel[g.key] = many(sel[g.key]).filter((k) => { const c = g.choices.find((x) => x.key === k); return !!c && isAvailable(o, g, c, sel); });
        continue;
      }
      const cur = g.choices.find((x) => x.key === one(sel[g.key]));
      if (cur && isAvailable(o, g, cur, sel)) continue;
      if (!g.required) { sel[g.key] = undefined; continue; }
      // Re-pick ignoring this group's own (now invalid) value.
      const probe = { ...sel, [g.key]: undefined };
      sel[g.key] = g.choices.find((c) => isAvailable(o, g, c, probe))?.key;
    }
  }
  return sel;
}

/** The starting build: every required group on its first offered choice. */
export function defaultSelection(o: ProductOptions): OptionSelection {
  return normalizeSelection(o, {});
}

export function priceOptions(o: ProductOptions, sel: OptionSelection): PricedOptions {
  const errors: string[] = [];
  const lines: PricedLine[] = [];
  if (o.basePrice) lines.push({ label: "Base price", amount: o.basePrice });
  for (const g of o.groups) {
    if (g.type === "text") continue;
    const picked = many(sel[g.key]);
    if (g.required && !picked.length) errors.push(`Choose a ${g.label.toLowerCase()}`);
    if (g.type === "single" && picked.length > 1) errors.push(`Choose one ${g.label.toLowerCase()}`);
    for (const k of picked) {
      const c = g.choices.find((x) => x.key === k);
      if (!c) errors.push(`${g.label}: unknown choice`);
      else if (!isAvailable(o, g, c, sel)) errors.push(`${c.label} is not available with this build`);
    }
  }
  if (o.table) {
    const cell = o.table.cells[tableKey(o.table, sel)];
    if (cell == null) { if (!errors.length) errors.push("That combination is not available"); }
    else lines.push({ label: o.table.groups.map((gk) => o.groups.find((g) => g.key === gk)?.choices.find((c) => c.key === one(sel[gk]))?.label).filter(Boolean).join(", "), amount: cell });
  }
  for (const g of o.groups) {
    if (g.type === "text") continue;
    for (const k of many(sel[g.key])) {
      const c = g.choices.find((x) => x.key === k);
      const p = c ? choicePrice(c, sel) : null;
      if (c && p) lines.push({ label: `${g.label}: ${c.label}`, amount: p });
    }
  }
  const total = round4(lines.reduce((a, l) => a + l.amount, 0));
  return { ok: errors.length === 0, errors, lines, total, totalIncGst: incGst(total) };
}

/** Cheapest complete build - the "from" price. */
export function fromPrice(o: ProductOptions): number {
  let best = Infinity;
  const skip = (g: string, k: string) => !!o.groups.find((x) => x.key === g)?.choices.find((c) => c.key === k)?.notInFrom;
  const combos = o.table
    ? Object.entries(o.table.cells).filter(([, v]) => v != null).map(([k]) => Object.fromEntries(o.table!.groups.map((g, i) => [g, k.split("|")[i]])))
      .filter((cmb) => !Object.entries(cmb).some(([g, k]) => skip(g, k as string)))
    : [{}];
  const first = o.groups.find((g) => g.type === "single" && g.required && !o.table?.groups.includes(g.key));
  const starts = first ? first.choices.map((c) => ({ [first.key]: c.key })) : [{}];
  for (const s of starts) for (const cmb of combos) {
    const p = priceOptions(o, normalizeSelection(o, { ...s, ...cmb }));
    if (p.ok && p.total < best) best = p.total;
  }
  return best === Infinity ? o.basePrice : best;
}

/** Spec lines for documents: "Size: Camden 14 (1500mm · double basin)", "Extras: LED, Legs". */
export function describeOptions(o: ProductOptions, sel: OptionSelection): string[] {
  const out: string[] = [];
  for (const g of o.groups) {
    if (g.type === "text") { const v = String(one(sel[g.key]) ?? "").trim(); if (v) out.push(`${g.label}: ${v}`); continue; }
    const cs = many(sel[g.key]).map((k) => g.choices.find((c) => c.key === k)).filter((c): c is OptionChoice => !!c);
    if (!cs.length) continue;
    out.push(`${g.label}: ${cs.map((c) => (g.type === "single" && c.section ? `${c.label} (${c.section})` : c.label) + (g.specDetail && c.detail ? `, ${c.detail}` : "")).join(", ")}`);
  }
  return out;
}

/** Merge the drawing hints of the chosen options (later groups win, e.g. "On legs"). */
export function drawMeta(o: ProductOptions, sel: OptionSelection): DrawMeta {
  const m: DrawMeta = {};
  for (const g of o.groups) for (const k of many(sel[g.key])) Object.assign(m, g.choices.find((c) => c.key === k)?.draw ?? {});
  return m;
}

/** Convert every amount (base, table, choice prices) - e.g. ex GST -> inc GST for the website. */
export function mapPrices(o: ProductOptions, f: (n: number) => number): ProductOptions {
  const m = (v: number | null | undefined) => (v == null ? v : f(v));
  return {
    ...o,
    basePrice: f(o.basePrice),
    table: o.table ? { ...o.table, cells: Object.fromEntries(Object.entries(o.table.cells).map(([k, v]) => [k, m(v) ?? null])) } : o.table,
    groups: o.groups.map((g) => ({ ...g, choices: g.choices.map((c) => ({
      ...c,
      ...(c.price != null ? { price: f(c.price) } : {}),
      ...(c.priceBy ? { priceBy: { ...c.priceBy, prices: Object.fromEntries(Object.entries(c.priceBy.prices).map(([k, v]) => [k, m(v) ?? null])) } } : {}),
    })) })),
  };
}

/** Spec lines frozen on a document line (configJson), or null for an ordinary line. */
export function lineSpec(configJson: unknown): string[] | null {
  const spec = (configJson as LineConfig | null)?.spec;
  return Array.isArray(spec) && spec.length ? spec : null;
}

/** Fit spec lines into a document's description1..3 (the last slot takes any overflow). */
export function specToDescriptions(spec: string[]): { description1: string | null; description2: string | null; description3: string | null } {
  return { description1: spec[0] ?? null, description2: spec[1] ?? null, description3: spec.length > 2 ? spec.slice(2).join(" · ") : null };
}
