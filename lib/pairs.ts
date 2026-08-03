import type { WebsiteRange, Swatch } from "./onbase/client";

// "Pairs well with" - pick complementary products for the one being viewed.
// Rule-based (no AI, no invented content). It reads each product's REAL tags from
// the feed (colour tags, metal/finish tags, department, name) and scores candidates
// across four tiers, most relevant first:
//   1. Same family    - the same product in another size/finish (siblings).
//   2. Cross-department harmony - a matching-tone product from ANOTHER department
//                        (e.g. beige tiles -> antique-brass tapware; black tiles ->
//                        matte-black grates/trims). Colour<->finish harmony table.
//   3. Same-department tone - a tile that shares your colour tone, or a feature to match.
//   4. Fallbacks       - complementary neutral, same look, shared spaces.
// The colour/finish rules are generic, so any NEW department that carries colour or
// finish tags (grates, trims, handles, basins...) is paired automatically - no per-
// department code.

// ── palette detection ────────────────────────────────────────────────────
type ColourFamily = "warm-neutral" | "white" | "black" | "grey" | "green" | "blue" | "warm-accent" | "brown";
type MetalFamily = "brass" | "gold" | "bronze" | "rose" | "black" | "gunmetal" | "chrome" | "nickel";

export function colourFamily(slug: string): ColourFamily | null {
  const s = slug.toLowerCase();
  if (/white|chalk|snow|alabaster|bianco/.test(s)) return "white";
  if (/black|charcoal|nero|onyx|graphite|grafite|midnight/.test(s)) return "black";
  if (/grey|gray|silver|\bash\b|smoke|concrete|cement|gunmetal|pewter|grigio|mist/.test(s)) return "grey";
  if (/green|celadon|jade|sage|olive|mint|verde|eucalyptus/.test(s)) return "green";
  if (/blue|navy|teal|denim|azure|indigo/.test(s)) return "blue";
  if (/pink|blush|\brose\b|terracotta|clay|cotto|rust|coral|salmon|rosso|\bred\b|burgundy|muralla/.test(s)) return "warm-accent";
  if (/brown|mocha|coffee|walnut|chocolate|tobacco|caramel|khaki/.test(s)) return "brown";
  if (/beige|cream|ivory|sand|oat|\btan\b|taupe|almond|linen|stone|natural|greige|bone|biscuit|dune|champagne|honey|wheat|pearl|shell|oyster/.test(s)) return "warm-neutral";
  return null;
}

// Metal/finish keywords -> family. Scanned against BOTH tags AND product names, so a
// department that tags its finish (tapware: "brushed-brass") and one that only names it
// (wastes: "Harper Waste - Brass/Copper/Gunmetal") both work - and so does any future
// department, with no per-department config.
const METAL_KW: [RegExp, MetalFamily][] = [
  [/rose[-\s]?gold/, "rose"],
  [/brass/, "brass"],
  [/\bgold\b/, "gold"],
  [/bronze|copper/, "bronze"],
  [/gun[-\s]?metal/, "gunmetal"],
  [/nickel|stainless|\bsteel\b/, "nickel"],
  [/chrome/, "chrome"],
  [/matte?[-\s]?black|black[-\s]?matte?|brushed[-\s]?black|satin[-\s]?black/, "black"],
];
function metalsIn(s: string): MetalFamily[] {
  const t = s.toLowerCase();
  const out: MetalFamily[] = [];
  for (const [re, fam] of METAL_KW) if (re.test(t)) out.push(fam);
  return out;
}

// Which metal finishes complement each tile colour (and vice-versa).
const HARMONY: Record<ColourFamily, MetalFamily[]> = {
  "warm-neutral": ["brass", "gold", "bronze"],
  white: ["chrome", "nickel", "black", "brass"],
  black: ["black", "gunmetal", "chrome"],
  grey: ["gunmetal", "chrome", "nickel"],
  green: ["brass", "gold", "black"],
  blue: ["brass", "chrome", "gunmetal"],
  "warm-accent": ["brass", "bronze", "rose"],
  brown: ["brass", "bronze", "gold"],
};
const METAL_LABEL: Record<MetalFamily, string> = {
  brass: "brass", gold: "warm gold", bronze: "bronze", rose: "rose gold",
  black: "matte black", gunmetal: "gunmetal", chrome: "chrome", nickel: "brushed nickel",
};
const COLOUR_LABEL: Record<ColourFamily, string> = {
  "warm-neutral": "warm neutral", white: "white", black: "black", grey: "grey",
  green: "green", blue: "blue", "warm-accent": "warm", brown: "earthy",
};

const allFilterValues = (r: WebsiteRange): string[] => {
  const out = new Set<string>();
  for (const vals of Object.values(r.filters ?? {})) for (const v of vals) out.add(v);
  for (const s of r.swatches ?? []) for (const c of s.colours ?? []) out.add(c);
  return [...out];
};

type Palette = { colours: Set<ColourFamily>; metals: Set<MetalFamily> };
function paletteOf(r: WebsiteRange): Palette {
  const colours = new Set<ColourFamily>();
  const metals = new Set<MetalFamily>();
  // Colours come from colour tags (tiles); metals from tags AND the product name
  // (tapware tags "brushed-brass"; wastes only name "...- Brass/Copper/Gunmetal").
  for (const v of allFilterValues(r)) {
    const c = colourFamily(v);
    if (c) colours.add(c);
    for (const m of metalsIn(v)) metals.add(m);
  }
  for (const m of metalsIn(r.name ?? "")) metals.add(m);
  return { colours, metals };
}

// ── family (sibling) detection ───────────────────────────────────────────
const GENERIC_FAMILY = new Set([
  "white", "black", "grey", "gray", "stone", "natural", "cream", "beige",
  "marble", "timber", "wood", "gloss", "matt", "matte", "tile", "tiles", "the",
]);
// Strip size/finish/format words -> the distinctive family token(s).
export function familyKey(name: string): string {
  let s = ` ${name.toLowerCase()} `;
  s = s.replace(/\b\d{2,4}\s*[x×]\s*\d{2,4}\b/g, " "); // 600 x 600
  s = s.replace(/\b\d{2,4}\b/g, " "); // stray size tokens (60, 612)
  s = s.replace(/\b(matt|matte|grip|gloss|polished|lappato|honed|structured|satin|feature|décor|decor|3d|mosaic|subway|subways|in\/out|in-out|rectified|pressed)\b/g, " ");
  s = s.replace(/[^a-z]+/g, " ").trim();
  return s;
}
function sameFamily(a: string, b: string): boolean {
  const fa = familyKey(a), fb = familyKey(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  const ta = fa.split(" ")[0], tb = fb.split(" ")[0];
  return ta === tb && ta.length >= 4 && !GENERIC_FAMILY.has(ta);
}

const NEUTRALS: ColourFamily[] = ["white", "grey", "black", "warm-neutral"];
const isMosaicOrFeature = (r: WebsiteRange): boolean =>
  /mosaic|feature|décor|decor|penny|herringbone/i.test(r.name) || (r.filters?.["size"] ?? []).includes("mosaic");
const hasImage = (r: WebsiteRange): boolean => !!(r.heroImage || r.swatches.some((s) => s.image));
const lookOf = (r: WebsiteRange): string | null => {
  const s = `${r.name} ${(r.filters?.["material"] ?? []).join(" ")}`.toLowerCase();
  for (const k of ["marble", "stone", "timber", "concrete", "terrazzo", "travertine", "limestone", "cement"]) if (s.includes(k)) return k;
  return null;
};
const title = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export type Pair = { range: WebsiteRange; reason: string; score: number };

export function pickPairs(current: WebsiteRange, candidates: WebsiteRange[], deptLabel?: string, limit = 6): Pair[] {
  const cur = paletteOf(current);
  const curLook = lookOf(current);

  const sibling: Pair[] = [];
  const cross: Pair[] = [];
  const rest: Pair[] = [];

  for (const x of candidates) {
    if (x.id === current.id || x.slug === current.slug) continue;
    const xp = paletteOf(x);
    const sameDept = !!x.department && x.department === current.department;

    // Tier 1 - same family (siblings): the same product in another size/finish.
    if (sameFamily(current.name, x.name)) {
      sibling.push({ range: x, reason: "Completes the range", score: 100 + (hasImage(x) ? 1 : 0) });
      continue;
    }

    // Tier 2 - cross-department colour<->finish harmony.
    if (!sameDept) {
      // current is a tile-like (has colours), candidate is a metal dept (has metals)
      let bestMetal: MetalFamily | null = null;
      for (const c of cur.colours) for (const m of HARMONY[c]) if (xp.metals.has(m)) { bestMetal = m; break; }
      // or the reverse - viewing a metal product, pair with harmonising-colour products
      let bestColour: ColourFamily | null = null;
      if (!bestMetal) {
        for (const m of cur.metals) for (const c of (Object.keys(HARMONY) as ColourFamily[])) if (HARMONY[c].includes(m) && xp.colours.has(c)) { bestColour = c; break; }
      }
      if (bestMetal) { cross.push({ range: x, reason: `Goes with ${METAL_LABEL[bestMetal]}`, score: 60 + (hasImage(x) ? 2 : 0) }); continue; }
      if (bestColour) { cross.push({ range: x, reason: `Suits ${COLOUR_LABEL[bestColour]} tones`, score: 58 + (hasImage(x) ? 2 : 0) }); continue; }
      // cross-department shared colour tone (e.g. a beige rug for a beige tile)
      const sharedC = [...cur.colours].filter((c) => xp.colours.has(c));
      if (sharedC.length) { rest.push({ range: x, reason: `Matching ${COLOUR_LABEL[sharedC[0]]} tone`, score: 30 + (hasImage(x) ? 2 : 0) }); continue; }
      continue;
    }

    // Tier 3/4 - same department: tone, feature companion, look, neutral, space.
    let s = 0;
    let reason = "";
    const sharedC = [...cur.colours].filter((c) => xp.colours.has(c));
    if (sharedC.length) { s += 40; reason = `Shares your ${COLOUR_LABEL[sharedC[0]]} tone`; }
    if (isMosaicOrFeature(x) && (sharedC.length || cur.colours.size === 0)) { s += 35; reason = reason || "A feature to match"; }
    const xLook = lookOf(x);
    if (curLook && xLook === curLook) { s += 14; reason = reason || `Same ${title(curLook)} look`; }
    const neutralGround = !sharedC.length && [...xp.colours].some((c) => NEUTRALS.includes(c)) && [...cur.colours].some((c) => !NEUTRALS.includes(c));
    if (neutralGround) { s += 12; reason = reason || "A neutral that grounds the colour"; }
    if (hasImage(x)) s += 4;
    if (s > 0) rest.push({ range: x, reason: reason || (deptLabel ? `Also in ${deptLabel}` : "From the same range"), score: s });
  }

  const bySc = (a: Pair, b: Pair) => b.score - a.score;
  sibling.sort(bySc); cross.sort(bySc); rest.sort(bySc);

  // Blend so siblings lead, then cross-department complements, then tone - but never
  // let one bucket crowd the others out entirely.
  const out: Pair[] = [];
  const seen = new Set<string>();
  const take = (arr: Pair[], n: number) => { for (const p of arr) { if (out.length >= limit || n <= 0) break; if (seen.has(p.range.id)) continue; seen.add(p.range.id); out.push(p); n--; } };
  take(sibling, 3);
  take(cross, 3);
  take(rest, limit);
  // top up from anything left, best score first
  take([...sibling, ...cross, ...rest].sort(bySc), limit);
  return out.slice(0, limit);
}

// Given the colour the shopper currently has selected, pick which of a paired
// product's swatches to show: (1) the SAME colour (exact name or shared colour
// tag - a sibling in Beige shows its Beige), (2) failing that a same-tone swatch,
// (3) otherwise the product's lead swatch. Pure + client-safe, so the pair cards
// can re-pick instantly as colours are clicked, with no reload.
function familyOf(tags?: string[] | null, name?: string | null): ColourFamily | null {
  for (const v of [...(tags ?? []), name ?? ""]) { const f = colourFamily(v); if (f) return f; }
  return null;
}
export function pairSwatch(pair: WebsiteRange, sel?: { colour?: string | null; colours?: string[] | null } | null): Swatch | undefined {
  const sw = (pair.swatches ?? []).filter((s) => !!(s.image || s.swatchHex));
  const pool = sw.length ? sw : pair.swatches ?? [];
  if (!pool.length) return undefined;
  if (sel) {
    const nm = (sel.colour ?? "").toLowerCase();
    const tags = new Set(sel.colours ?? []);
    const exact = pool.find((s) => (s.colour ?? "").toLowerCase() === nm || (s.colours ?? []).some((c) => tags.has(c)));
    if (exact) return exact;
    const fam = familyOf(sel.colours, sel.colour);
    if (fam) { const tonal = pool.find((s) => familyOf(s.colours, s.colour) === fam); if (tonal) return tonal; }
  }
  return pool[0];
}
