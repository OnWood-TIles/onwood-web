// "Imagine my room" - turns the vision board's contents into an art-directed
// interior-design prompt for an image model. Kept dependency-free so both the API
// route and the client can import the room/style lists.
//
// Text-to-image models don't understand hex codes or brand names, so we translate
// each paint colour into plain descriptive language ("deep charcoal grey") and add
// per-style cues, then lead the prompt with the palette so it steers the render.

export type ImagineItem = {
  kind: string;
  name: string;
  color?: string; // hex - for paint from the chip, for materials read from the swatch
  sub?: string;
  url?: string; // swatch image (the API reads its dominant colour into `color`)
};
export type ImagineRequest = {
  items: ImagineItem[];
  benchtop?: string | null;
  benchtopColor?: string; // read from the stone image by the API
  benchtopUrl?: string;
  room: string;
  style: string;
  note?: string; // optional free-text nudge from the customer
  count?: number; // how many variations to generate
};

export const IMAGINE_ROOMS = [
  "Kitchen",
  "Living room",
  "Bedroom",
  "Bathroom",
  "Ensuite",
  "Dining room",
  "Study / home office",
  "Laundry",
  "Entry / hallway",
  "Alfresco / outdoor",
  "Pool area",
];

export const IMAGINE_STYLES = [
  "Coastal",
  "Mediterranean",
  "Contemporary",
  "Classic",
  "Hamptons",
  "Scandinavian",
  "Modern farmhouse",
  "Japandi",
  "Industrial",
  "Minimalist",
  "Mid-century modern",
  "Art Deco",
  "Boho",
  "Rustic",
  "Traditional",
];

// Strong, distinct visual cues per style so the picker actually changes the render.
const STYLE_CUES: Record<string, string> = {
  coastal:
    "light, airy and breezy beach-house feel, crisp whites with soft sea-blue accents, natural linen, rattan and pale timber, relaxed",
  mediterranean:
    "warm sun-drenched feel, textured lime-plaster walls, terracotta and cream tones, arched openings, rustic timber and wrought iron, earthy",
  contemporary:
    "clean minimal lines, refined neutral palette, sleek uncluttered surfaces, sophisticated and modern",
  classic:
    "timeless and elegant, symmetrical layout, refined mouldings and panelling, considered and sophisticated",
  hamptons:
    "coastal-classic elegance, crisp white with soft blue-grey, shaker-profile joinery, elegant yet relaxed",
  scandinavian:
    "bright and minimal, pale blonde timber, white walls, cosy hygge simplicity, functional and light-filled",
  "modern farmhouse":
    "warm rustic-modern, white and natural timber, shaker cabinetry, black accents, cosy and characterful",
  japandi:
    "calm Japanese-Scandinavian minimalism, warm neutral tones, natural wood and stone, uncluttered and serene",
  industrial:
    "raw urban warehouse feel, exposed brick and concrete, black steel, aged timber, utilitarian",
  minimalist:
    "pared-back and serene, very few objects, clean flat surfaces, generous negative space, restrained",
  "mid-century modern":
    "1950s-60s modern, warm timber, tapered legs, organic curves, retro accents, functional and stylish",
  "art deco":
    "glamorous 1920s deco, bold geometric patterns, brass and gold, rich contrasts, symmetry and luxe",
  boho:
    "eclectic bohemian, layered textures, rattan and trailing plants, warm earthy tones, relaxed and collected",
  rustic:
    "rustic and natural, rough-sawn timber and stone, aged and characterful, cosy country warmth",
  traditional:
    "classic traditional elegance, refined furnishings and detailing, warm and formal, timeless",
};

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255,
    g = ((int >> 8) & 255) / 255,
    b = (int & 255) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2,
    d = max - min;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (d !== 0) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

// Plain-language description of a hex colour, e.g. "warm off-white", "deep charcoal".
export function describeColour(hex?: string): string {
  if (!hex) return "";
  const hsl = hexToHsl(hex);
  if (!hsl) return "";
  const { h, s, l } = hsl;
  // Treat low-saturation tones as neutral greys/charcoals (a charcoal-grey oak
  // like #675f56 is barely warm and should read as charcoal, NOT "walnut brown"),
  // and very pale tints as off-white.
  if (s < 0.14 || l > 0.88) {
    return l > 0.86
      ? "warm off-white"
      : l > 0.7
        ? "soft light grey"
        : l > 0.5
          ? "mid grey"
          : l > 0.3
            ? "dark charcoal grey"
            : "near-black charcoal";
  }
  // Muted warm tones are timber / earth browns (oak, walnut, beige) - NOT
  // "terracotta". Describe them as realistic wood/stone tones by lightness.
  if ((h < 68 || h >= 345) && s < 0.4) {
    return l < 0.26
      ? "dark espresso brown"
      : l < 0.42
        ? "warm walnut brown"
        : l < 0.58
          ? "honey oak brown"
          : l < 0.74
            ? "warm tan"
            : "pale greige beige";
  }
  const light =
    l < 0.22 ? "deep" : l < 0.4 ? "dark" : l < 0.62 ? "" : l < 0.8 ? "soft pale" : "pale";
  const sat = s < 0.25 ? "muted" : s < 0.55 ? "warm" : "rich";
  const hue =
    h < 15 || h >= 345
      ? "red"
      : h < 42
        ? "terracotta"
        : h < 68
          ? "golden yellow"
          : h < 95
            ? "olive"
            : h < 165
              ? "green"
              : h < 205
                ? "teal"
                : h < 255
                  ? "blue"
                  : h < 300
                    ? "violet"
                    : "pink";
  return `${light} ${sat} ${hue}`.replace(/\s+/g, " ").trim();
}

// Classify a GlowTile sample by the role it should play in the render, so the
// prompt can place it correctly:
//  - "large-format": porcelain floor tile (600x600, 600x1200, planks) -> the FLOOR
//    (priority 1 - a large-format tile beats a plank "flooring" sample for the floor)
//  - "mosaic" / "feature": mosaic, penny-round, kit-kat, stack-bond, subway, brick
//    or wall tile -> splashback / feature wall ONLY, never the floor
//  - "stone": the loose stacked-stone samples -> natural-stone feature-wall cladding
export function classifyTile(
  name?: string,
  sub?: string,
): "large-format" | "mosaic" | "feature" | "stone" {
  const s = `${name || ""} ${sub || ""}`.toLowerCase();
  if (/clay stone|cloudy grey|crazy pave/.test(s)) return "stone";
  if (/mosaic|kit ?kat|penny ?round|stack ?bond|mini ?arch|cobble|piccolo|riverblend/.test(s))
    return "mosaic";
  if (/subway|hampton|mille|maestro|penny|\bwall\b|22x145|75x225|75x300|76x302|100x100|62\.5x125/.test(s))
    return "feature";
  // Dimension-driven: a largest face under 300mm reads as a small wall/feature tile.
  const m = s.match(/(\d{2,4})\s*[x×]\s*(\d{2,4})/);
  if (m && Math.max(Number(m[1]), Number(m[2])) < 300) return "feature";
  return "large-format";
}

// Build a photographer-grade interior prompt from the placed pieces + benchtop.
export function buildImaginePrompt(req: ImagineRequest): string {
  const items = Array.isArray(req.items) ? req.items : [];
  const namesOf = (kind: string) =>
    [...new Set(items.filter((i) => i.kind === kind).map((i) => (i.name || "").trim()).filter(Boolean))];

  // Palette in room-hierarchy order (walls, floor, joinery, bench, then accents).
  const palette: string[] = [];

  // Colour prefix from a hex, e.g. "warm honey-brown ".
  const cp = (color?: string) => {
    const d = describeColour(color);
    return d ? `${d} ` : "";
  };
  // First item per name for a kind (keeps its read colour).
  const uniq = (kind: string) => {
    const seen = new Set<string>();
    const out: ImagineItem[] = [];
    for (const i of items.filter((x) => x.kind === kind)) {
      const n = (i.name || "").trim();
      if (!n || seen.has(n)) continue;
      seen.add(n);
      out.push(i);
    }
    return out;
  };

  for (const p of uniq("paint"))
    palette.push(`${cp(p.color)}walls${p.name ? ` (${p.name})` : ""}`);

  // Tiles are split by role (see classifyTile). A LARGE-FORMAT tile is the hero
  // floor and takes priority 1 - it beats a plank "flooring" sample for the floor.
  const tiles = uniq("tile");
  const floorTiles = tiles.filter((t) => classifyTile(t.name, t.sub) === "large-format");
  const stoneTiles = tiles.filter((t) => classifyTile(t.name, t.sub) === "stone");
  const wallTiles = [
    ...floorTiles.slice(1), // any extra large-format tiles become the splashback
    ...tiles.filter((t) => {
      const c = classifyTile(t.name, t.sub);
      return c === "mosaic" || c === "feature";
    }),
  ];

  // FLOOR: a large-format tile wins; otherwise fall back to the plank flooring.
  if (floorTiles[0]) {
    const f = floorTiles[0];
    palette.push(
      `${cp(f.color)}large-format ${f.name} porcelain floor tiles across the whole floor`,
    );
  } else {
    for (const f of uniq("flooring")) {
      const meta = `${f.name} ${f.sub || ""}`;
      const pattern = /herringbone/i.test(meta)
        ? " laid in a herringbone pattern"
        : /chevron|chevy/i.test(meta)
          ? " laid in a chevron pattern"
          : "";
      // Lead with the colour + "floor" (not the "oak" name) so a charcoal floor
      // renders charcoal, not warm timber.
      palette.push(`${cp(f.color)}floor${pattern} (${f.name})`);
    }
  }

  for (const t of uniq("timber"))
    palette.push(`${cp(t.color)}${t.name} cabinetry and joinery`);

  if (req.benchtop)
    palette.push(`${cp(req.benchtopColor)}${req.benchtop} natural stone benchtops`);

  for (const c of uniq("carpet")) palette.push(`${cp(c.color)}${c.name} carpet as an area rug`);

  // Splashback / feature-wall tiles - explicitly NEVER on the floor.
  for (const t of wallTiles)
    palette.push(
      `${cp(t.color)}${t.name} tiles used only as a splashback or feature wall, never on the floor`,
    );

  // Stacked natural-stone samples read as a feature-wall cladding.
  for (const t of stoneTiles)
    palette.push(
      `${cp(t.color)}${t.name} stacked natural stone cladding as a feature wall`,
    );

  const metal = namesOf("metal");
  if (metal.length) palette.push(`${metal.join(" and ")} metal tapware and hardware`);

  // Remaining colour-chip rails (Decor) read as decorative accents, not tiles -
  // real tiles now come through the dedicated GlowTile "tile" kind above.
  const decor = namesOf("chip");
  if (decor.length)
    palette.push(`${decor.slice(0, 4).join(", ")} decorative accents`);

  const styling = namesOf("styling");
  if (styling.length) palette.push(`decorated with ${styling.slice(0, 6).join(", ")}`);

  const room = (req.room || "interior").toLowerCase();
  const styleKey = (req.style || "contemporary").toLowerCase();
  const cues = STYLE_CUES[styleKey] || "";
  const paletteStr = palette.length
    ? palette.join("; ")
    : "a warm, natural material palette";

  return [
    `Photorealistic interior design photograph of a ${styleKey} ${room}.`,
    `Strict colour and material palette - build the whole room from ONLY these, as the defining scheme: ${paletteStr}.`,
    `Do not add any colours, timber or warm-wood tones that are not listed above. If the palette is cool, dark or monochrome, keep the entire room cool, dark or monochrome to match.`,
    cues ? `${req.style} style: ${cues}.` : "",
    (req.note || "").trim()
      ? `Also incorporate: ${(req.note || "").trim().slice(0, 200)}.`
      : "",
    `Natural daylight, soft shadows, styled and lived-in, wide-angle architectural interior photography, photorealistic, high detail, interiors magazine quality.`,
  ]
    .filter(Boolean)
    .join(" ");
}
