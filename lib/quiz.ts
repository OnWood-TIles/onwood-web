// "Selection by personality" tile quiz — engine.
//
// Design notes (see the chat with Reagan):
// - Scores PER COLOURWAY, not per product. Each colourway competes on its own,
//   so a product's Beige and Grey variants can land for different customers, and
//   the result is a SPECIFIC variant + that variant's own "see it installed" shot.
// - "Style" is DERIVED, never tagged: a colourway's vibe comes from its COLOUR
//   (per-colourway) refined by the product's material/format/name (shared). So
//   beige-encaustic reads Mediterranean while beige-large-porcelain reads modern.
// - Fully data-driven off the live feed: new tiles (tagged + with a room shot)
//   join automatically; nothing to maintain.
import type { WebsiteRange } from "./onbase/client";

// ── colour → vibe ────────────────────────────────────────────────────────────
const COLOUR_VIBE: Record<string, string[]> = {
  white: ["coastal", "light", "minimal"],
  cream: ["coastal", "warm", "classic", "light"],
  grey: ["modern", "minimal"],
  "cool-grey": ["modern", "minimal"],
  silver: ["modern", "minimal"],
  charcoal: ["modern", "moody"],
  black: ["modern", "moody", "bold"],
  "matte-black": ["modern", "moody", "bold"],
  beige: ["warm", "natural", "mediterranean"],
  taupe: ["warm", "natural"],
  brown: ["natural", "warm", "rustic"],
  green: ["mediterranean", "botanical", "bold"],
  blue: ["coastal", "mediterranean", "bold"],
  navy: ["coastal", "moody", "bold"],
  red: ["mediterranean", "warm", "bold"],
  terracotta: ["mediterranean", "warm", "bold"],
  orange: ["mediterranean", "warm", "bold"],
  pink: ["bold", "playful", "warm"],
  yellow: ["bold", "playful", "warm"],
};

// ── look/format, derived from name + material + size ─────────────────────────
export function deriveLook(name: string, material: string | null, size: string | null): string[] {
  const n = (name || "").toLowerCase();
  const l = new Set<string>();
  if (/encaustic|antico|zellige|zellij|moroccan|pattern|d[eé]cor|feature|mosaic/.test(n)) l.add("pattern");
  if (/mosaic/.test(n) || size === "mosaic") l.add("mosaic"), l.add("pattern");
  if (/terrazzo/.test(n) || material === "terrazzo") l.add("terrazzo"), l.add("pattern");
  if (/timber|wood|oak|walnut|spotted.?gum|blackbutt|ash|hickory/.test(n)) l.add("timber"), l.add("natural");
  if (/subway|brick|metro/.test(n)) l.add("subway"), l.add("classic");
  if (/marble|calacatta|carrara|statuario/.test(n) || material === "marble") l.add("marble"), l.add("classic"), l.add("luxe");
  if (/travertine|limestone|slate|stone|granite/.test(n) || material === "natural-stone" || material === "stone-veneer") l.add("stone"), l.add("natural");
  if (size === "large-format" || size === "600-x-1200" || size === "oversized") l.add("large-format"), l.add("modern");
  return [...l];
}

const LOOK_VIBE: Record<string, string[]> = {
  pattern: ["mediterranean", "bold"],
  mosaic: ["mediterranean", "bold"],
  terrazzo: ["mediterranean", "playful", "bold"],
  timber: ["natural", "warm"],
  subway: ["classic", "coastal"],
  marble: ["classic", "luxe"],
  stone: ["natural", "rustic"],
  "large-format": ["modern", "minimal"],
};
const MATERIAL_VIBE: Record<string, string[]> = {
  porcelain: ["modern", "minimal"],
  ceramic: ["warm", "classic"],
  "natural-stone": ["natural", "rustic", "classic"],
  "stone-veneer": ["natural", "rustic"],
  marble: ["classic", "luxe"],
  terrazzo: ["playful", "bold"],
  glass: ["modern", "bold"],
};

/** The derived vibe set for a colourway (its colour + the product's look + material). */
export function vibeFor(colourTags: string[], looks: string[], material: string | null): string[] {
  const v = new Set<string>();
  for (const c of colourTags) for (const x of COLOUR_VIBE[c] || []) v.add(x);
  for (const lk of looks) for (const x of LOOK_VIBE[lk] || []) v.add(x);
  for (const x of MATERIAL_VIBE[material || ""] || []) v.add(x);
  return [...v];
}

// ── candidate (one colourway) ────────────────────────────────────────────────
export type Candidate = {
  product: string;
  slug: string;
  colour: string;
  colourTags: string[];
  img: string; // installed room shot (required)
  swatchHex: string | null;
  dept: string;
  use: string[];
  material: string | null;
  size: string | null;
  look: string[];
  vibe: string[];
};

/** Build the scoring pool from the feed: one candidate per colourway that has a
 *  room shot. Tiles + stone only. */
export function makeCandidates(ranges: WebsiteRange[]): Candidate[] {
  const out: Candidate[] = [];
  for (const r of ranges) {
    const f = r.filters || {};
    const use = f["location-use"] || [];
    const material = f["material"]?.[0] || null;
    const size = f["size"]?.[0] || null;
    const look = deriveLook(r.name, material, size);
    for (const s of r.swatches || []) {
      if (!s.installedImage) continue; // must have a room shot for the result
      const colourTags = s.colours || [];
      out.push({
        product: r.name,
        slug: s.slug || r.slug,
        colour: s.colour,
        colourTags,
        img: s.installedImage,
        swatchHex: s.swatchHex ?? null,
        dept: r.department || "",
        use,
        material,
        size,
        look,
        vibe: vibeFor(colourTags, look, material),
      });
    }
  }
  return out;
}

// ── questions ────────────────────────────────────────────────────────────────
export type Pref = { use?: string[]; vibe?: string[]; colour?: string[]; look?: string[]; material?: string[]; size?: string[]; persona?: string };
export type Option = Pref & { id: string; label: string; sub?: string; emoji?: string; palette?: string[] };
export type Question = { id: string; title: string; subtitle?: string; kind: "tap" | "mood"; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    id: "use",
    title: "Where are you tiling?",
    subtitle: "So we only ever suggest a tile that's right for the job.",
    kind: "tap",
    options: [
      { id: "bathroom", label: "Bathroom", emoji: "🛁", use: ["bathroom", "wall", "floor"] },
      { id: "kitchen", label: "Kitchen / splashback", emoji: "🍳", use: ["kitchen", "splashback", "wall"] },
      { id: "floor", label: "Living or bedroom floor", emoji: "🛋️", use: ["floor", "indoor"] },
      { id: "outdoor", label: "Outdoor & alfresco", emoji: "🌿", use: ["outdoor", "facade", "pool"] },
      { id: "feature", label: "A feature wall", emoji: "✨", use: ["feature-wall", "wall", "fireplace"] },
    ],
  },
  {
    id: "space",
    title: "Which space makes you go yes?",
    subtitle: "Go with your gut — the first one you're drawn to.",
    kind: "mood",
    options: [
      { id: "coastal", label: "Light & coastal", sub: "Soft, airy, calm", palette: ["#f3efe7", "#dfe7e6", "#c8d3cf", "#a9b7ad"], vibe: ["coastal", "light", "minimal"], colour: ["white", "cream", "blue"], persona: "coastal" },
      { id: "modern", label: "Dark & modern", sub: "Moody, sleek, bold", palette: ["#2b2f33", "#4a4f54", "#6c7176", "#9aa0a3"], vibe: ["modern", "moody"], colour: ["grey", "charcoal", "black"], persona: "modern" },
      { id: "med", label: "Warm Mediterranean", sub: "Sun-baked, characterful", palette: ["#c56a3f", "#d99b53", "#7d8a5a", "#e9d8b8"], vibe: ["mediterranean", "warm", "bold"], colour: ["red", "orange", "green", "beige"], look: ["pattern"], persona: "mediterranean" },
      { id: "natural", label: "Natural & earthy", sub: "Grounded, organic, honest", palette: ["#8a6f52", "#b39b7d", "#d8c6ab", "#6f6353"], vibe: ["natural", "warm", "rustic"], colour: ["beige", "brown"], material: ["natural-stone"], persona: "natural" },
    ],
  },
  {
    id: "tone",
    title: "This… or this?",
    subtitle: "Which room would you rather walk into?",
    kind: "mood",
    options: [
      { id: "light", label: "Bright & airy", palette: ["#f5f1e9", "#e7e0d3", "#d6cdbb"], vibe: ["light", "coastal", "minimal"], colour: ["white", "cream", "beige"] },
      { id: "dark", label: "Moody & dramatic", palette: ["#26292d", "#3d4247", "#5a6065"], vibe: ["moody", "modern", "bold"], colour: ["black", "charcoal", "grey"] },
    ],
  },
  {
    id: "escape",
    title: "Your dream weekend escape?",
    subtitle: "A little fun — but it tells us a lot.",
    kind: "tap",
    options: [
      { id: "beach", label: "Beach house", emoji: "🏖️", vibe: ["coastal", "light"], colour: ["white", "blue"], persona: "coastal" },
      { id: "city", label: "City penthouse", emoji: "🌆", vibe: ["modern", "moody"], colour: ["grey", "black"], persona: "modern" },
      { id: "villa", label: "Tuscan villa", emoji: "🍇", vibe: ["mediterranean", "warm", "bold"], look: ["pattern"], persona: "mediterranean" },
      { id: "cottage", label: "Country cottage", emoji: "🌾", vibe: ["natural", "rustic", "warm"], look: ["timber", "stone"], persona: "natural" },
    ],
  },
  {
    id: "pattern",
    title: "Pattern… or pared-back?",
    kind: "mood",
    options: [
      { id: "pattern", label: "Bold & patterned", sub: "Encaustic, mosaic, character", palette: ["#3f6f6a", "#c56a3f", "#e6cf9c", "#7d8a5a"], look: ["pattern", "mosaic", "terrazzo"], vibe: ["mediterranean", "bold", "playful"], size: ["mosaic"] },
      { id: "plain", label: "Clean & simple", sub: "Calm, considered, timeless", palette: ["#eceae4", "#dcd8ce", "#c9c4b8"], look: ["large-format", "subway"], vibe: ["minimal", "modern", "classic"] },
    ],
  },
  {
    id: "colour",
    title: "How brave with colour?",
    kind: "tap",
    options: [
      { id: "neutral", label: "Keep it neutral", emoji: "🤍", colour: ["white", "grey", "beige", "cream"], vibe: ["minimal"] },
      { id: "warm", label: "A little warmth", emoji: "🤎", colour: ["beige", "brown", "green"], vibe: ["warm", "natural"] },
      { id: "bold", label: "Go bold", emoji: "🌈", colour: ["green", "blue", "red", "orange", "pink", "black"], vibe: ["bold", "playful"], persona: "bold" },
    ],
  },
  {
    id: "finish",
    title: "The finish that feels right?",
    kind: "tap",
    options: [
      { id: "porcelain", label: "Sleek porcelain", emoji: "✨", material: ["porcelain"], vibe: ["modern", "minimal"] },
      { id: "ceramic", label: "Handmade-look ceramic", emoji: "🏺", material: ["ceramic"], vibe: ["warm", "mediterranean"], look: ["pattern"] },
      { id: "stone", label: "Natural stone", emoji: "🪨", material: ["natural-stone", "marble", "stone-veneer"], vibe: ["natural", "classic"], look: ["stone", "marble"] },
    ],
  },
];

// ── personas (the result label) ──────────────────────────────────────────────
export type Persona = { key: string; label: string; emoji: string; vibes: string[]; blurb: string };
export const PERSONAS: Persona[] = [
  { key: "coastal", label: "The Coastal Minimalist", emoji: "☀️", vibes: ["coastal", "light", "minimal"], blurb: "Calm, breezy and effortless — you love a space that feels like a deep breath." },
  { key: "modern", label: "Modern & Moody", emoji: "🖤", vibes: ["modern", "moody"], blurb: "Sleek, confident and a little dramatic — you're drawn to depth and clean lines." },
  { key: "mediterranean", label: "The Mediterranean Maximalist", emoji: "🎨", vibes: ["mediterranean", "bold", "playful", "botanical"], blurb: "Sun-soaked and full of character — pattern and warmth are your love language." },
  { key: "natural", label: "Natural & Grounded", emoji: "🌿", vibes: ["natural", "warm", "rustic", "stone"], blurb: "Honest, organic and tactile — you want materials that feel real underfoot." },
  { key: "classic", label: "Timeless & Refined", emoji: "🤍", vibes: ["classic", "luxe"], blurb: "Understated and elegant — you choose pieces that never date." },
  { key: "bold", label: "Bold & Playful", emoji: "🌈", vibes: ["bold", "playful"], blurb: "Unafraid of a statement — you want a space with personality and joy." },
];

// ── scoring ──────────────────────────────────────────────────────────────────
export type QuizResult = { persona: Persona; hero: Candidate | null; runnersUp: Candidate[] };
const inc = (m: Record<string, number>, keys: string[] | undefined, w: number) => { for (const k of keys || []) m[k] = (m[k] || 0) + w; };
const sum = (m: Record<string, number>, keys: string[]) => keys.reduce((a, k) => a + (m[k] || 0), 0);

/** Pure scorer — runs client-side. `answers` = the chosen Option per question. */
export function scoreQuiz(candidates: Candidate[], answers: Option[]): QuizResult {
  const pUse: Record<string, number> = {}, pVibe: Record<string, number> = {}, pColour: Record<string, number> = {}, pLook: Record<string, number> = {}, pMat: Record<string, number> = {}, pSize: Record<string, number> = {}, pPersona: Record<string, number> = {};
  for (const a of answers) {
    inc(pUse, a.use, 1); inc(pVibe, a.vibe, 1); inc(pColour, a.colour, 1);
    inc(pLook, a.look, 1); inc(pMat, a.material, 1); inc(pSize, a.size, 1);
    if (a.persona) pPersona[a.persona] = (pPersona[a.persona] || 0) + 1;
  }
  const wantUse = Object.keys(pUse);

  const scored = candidates.map((c) => {
    let s = 0;
    // Suitability: strongly prefer tiles that suit the chosen use; penalise misfits.
    if (wantUse.length) {
      const hit = c.use.some((u) => pUse[u]);
      s += hit ? 6 * sum(pUse, c.use) : -10;
    }
    s += 3.0 * sum(pColour, c.colourTags);
    s += 2.0 * sum(pVibe, c.vibe);
    s += 1.6 * sum(pLook, c.look);
    s += 1.4 * (c.material ? pMat[c.material] || 0 : 0);
    s += 1.0 * (c.size ? pSize[c.size] || 0 : 0);
    return { c, s };
  }).sort((a, b) => b.s - a.s);

  // Persona = the vibe blend the customer leaned into (personas' explicit picks
  // break ties), scored against the accumulated vibe preferences.
  const persona = [...PERSONAS].map((p) => ({ p, s: sum(pVibe, p.vibes) + 3 * (pPersona[p.key] || 0) }))
    .sort((a, b) => b.s - a.s)[0].p;

  const positive = scored.filter((x) => x.s > 0);
  const pool = (positive.length ? positive : scored).map((x) => x.c);
  return { persona, hero: pool[0] ?? null, runnersUp: pool.slice(1, 4) };
}
