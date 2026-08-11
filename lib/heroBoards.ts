// Curated hero vision boards for the Ambient Drift showcase. Each board = a
// pre-generated AI room render (built from the EXACT product photos via Gemini
// image-to-image, see _gen-scenes / scripts) + the REAL product samples, rendered
// with the same components as the Vision Board tool (PaintChipFace fan-deck chips
// with punch hole + name pill, FloorSwatchFace tiles, ABI metal discs) at the
// tool's real design sizes, as per-board piece lists in board-local coordinates
// (BOARD_W x BOARD_H).
//
// Products are the tenant's REAL catalogue (tile + stone-veneer swatch photos +
// the AI decor cutouts). Composition rules (Reagan, LOCKED):
//  - the HERO tile is the biggest piece, centred, FRONT, never hidden
//  - ONLY the hero tile + feature slot keep the same position on every board
//  - samples look exactly like the Vision Board tool's; florals may render LARGER
//  - dense collage - minimal white space; the ABI logo stays on the metal disc
export type BoardPiece = {
  id: string;
  kind: "photo" | "tile" | "timber" | "paint" | "metal" | "carpet" | "stone" | "styling";
  name: string;
  sub?: string;       // range / type line under the name
  src?: string;       // texture / swatch / cutout image
  color?: string;     // paint hex
  brandLogo?: string; // corner brand badge (Laminex / ABI)
  x: number;          // board-local px
  y: number;
  w: number;
  h: number;
  rot: number;        // resting rotation (deg)
  z: number;
  radius?: number;    // FloorSwatchFace corner radius (tiles 2, stone 10)
};

export type HeroBoard = { id: string; pieces: BoardPiece[] };

export const BOARD_W = 520;
export const BOARD_H = 600;

const LAMINEX = "/images/timber/laminex-logo.svg";
const ABI = "/images/metals/abi/abi-logo.svg";
// Route tile/feature photos through the trimmer so ONLY the tile shows (the source
// catalogue photos sit on a white canvas). See app/api/tile.
const tp = (u: string) => `/api/tile?u=${encodeURIComponent(u)}`;

// ---- shared anchor slots (identical on every board) -------------------------
const photo = (id: string, rot: number): BoardPiece => ({
  id: "photo", kind: "photo", name: "Room", src: `/images/hero-boards/${id}.jpg`,
  x: 14, y: 14, w: 300, h: 212, rot, z: 2,
});
// Hero tile - biggest, centred, FRONT (tool tile face scaled up).
const hero = (name: string, sub: string, src: string): BoardPiece => ({
  id: "hero", kind: "tile", name, sub, src: tp(src),
  x: 120, y: 224, w: 280, h: 280, rot: -2, z: 6, radius: 2,
});
// Feature slot - the board's secondary material (mosaic / subway / stone veneer),
// top-right, fixed position.
const feature = (p: Omit<BoardPiece, "id" | "x" | "y" | "rot" | "z">): BoardPiece => ({
  id: "feature", x: 324, y: 16, rot: 3, z: 3, ...p, w: 196, h: 196, src: p.src ? tp(p.src) : p.src,
});

// ---- piece factories at the tool's real design sizes ------------------------
const stone = (name: string, x: number, y: number, rot: number, z: number): BoardPiece =>
  ({ id: "stone", kind: "stone", name, sub: "Caesarstone", x, y, w: 176, h: 176, rot, z, radius: 10 });
const timber = (name: string, code: string, x: number, y: number, rot: number, z: number): BoardPiece =>
  ({ id: "timber", kind: "timber", name, src: `/images/timber/${code}.webp`, brandLogo: LAMINEX, x, y, w: 120, h: 168, rot, z });
const paint = (id: string, name: string, hex: string, x: number, y: number, rot: number, z: number): BoardPiece =>
  ({ id, kind: "paint", name, color: hex, x, y, w: 120, h: 168, rot, z });
const metal = (name: string, file: string, x: number, y: number, rot: number, z: number): BoardPiece =>
  ({ id: "metal", kind: "metal", name, src: `/images/metals/abi/${file}.webp`, brandLogo: ABI, x, y, w: 112, h: 112, rot, z });
const styling = (id: string, name: string, file: string, x: number, y: number, w: number, h: number, z: number): BoardPiece =>
  ({ id, kind: "styling", name, src: `/images/styling/${file}.webp`, x, y, w, h, rot: 0, z });

// Real catalogue swatch photos (tile + stone-veneer) for the hero + feature slots.
const T = "https://onwoodtiles.com.au/images/tileone";
const ABI_MOSAIC = "https://www.abiinteriors.com.au/wp-content/uploads";
const VENEER = "https://onwoodtiles.com.au/images/veneerstone";

// A rectangle (plank / long-format) hero tile - keeps the tile's real plank
// shape instead of being cropped square. Horizontal plank, centred.
const plankHero = (name: string, sub: string, src: string): BoardPiece => ({
  id: "hero", kind: "tile", name, sub, src: tp(src),
  x: 104, y: 286, w: 312, h: 158, rot: -2, z: 6, radius: 2,
});

// Layout note: the hero tile is big + central (x120-400, y224-504), so the
// material chips sit in clear LEFT / RIGHT columns + a bottom-centre peek that
// stay visible around it - paints, metals + timber are no longer hidden under
// the tile. Florals are kept slim so they frame rather than smother.
export const HERO_BOARDS: HeroBoard[] = [
  {
    id: "bath-coastal-white",
    pieces: [
      photo("bath-coastal-white", -1),
      hero("Alba 45 Statuario", "Marble-look porcelain", `${T}/1668640604.webp?v=3`),
      // Subway is a ~2.85:1 tile - a subway-shaped box so it reads like a subway.
      { id: "feature", kind: "tile", name: "Aspect White Subway", sub: "Gloss subway", src: tp(`${T}/1599661909.webp?v=3`), x: 314, y: 44, w: 204, h: 96, rot: 3, z: 3, radius: 2 },
      styling("plant", "Native Gum", "ai-floral-native-gum", -24, 10, 110, 214, 8),
      paint("paintA", "Natural White", "#EFE9DB", 0, 248, -4, 5),
      { ...stone("Calacatta Nuvo", -20, 430, -6, 3), src: "/images/stone/5131.webp?v=2" },
      timber("Whitewashed Oak", "AU1007480", 402, 214, -5, 4),
      paint("paintB", "Tranquil Retreat", "#D8D3C7", 404, 392, 3, 5),
      metal("Brushed Nickel", "brushed-nickel", 182, 488, 4, 5),
    ],
  },
  {
    id: "bath-warm-stone",
    pieces: [
      photo("bath-warm-stone", 1),
      hero("Colonnade 60 Classico", "Travertine-look porcelain", `${T}/1718244731.webp?v=3`),
      feature({ kind: "tile", name: "Atami Mosaic Oat", sub: "Feature mosaic", src: `${ABI_MOSAIC}/Atami_Large_Square_Mosaic_Tile_300x300_Latte-scaled.jpg`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Antique White U.S.A.", "#E6DECC", 0, 248, -3, 5),
      { ...stone("Taj Whisper", -20, 430, -4, 3), src: "/images/stone/8251.webp?v=2" },
      timber("Golden Oak", "AU1006823", 402, 214, -6, 4),
      paint("paintB", "Raw Umber", "#D9D0B8", 404, 392, 5, 5),
      metal("Tumbled Aged Brass", "tumbled-aged-brass", 182, 488, 4, 5),
    ],
  },
  {
    id: "kitchen-hamptons-white",
    pieces: [
      photo("kitchen-hamptons-white", -1),
      hero("Cottesloe 60 Limestone", "Limestone-look porcelain", `${T}/1665021475.webp?v=3`),
      feature({ kind: "tile", name: "Aspect White Subway", sub: "Matt subway", src: `${T}/1599661634.webp?v=3`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Hydrangea", "ai-floral-hydrangea-blue", -24, 10, 112, 214, 8),
      paint("paintA", "Natural White", "#EFE9DB", 0, 248, -5, 5),
      { ...stone("Calacatta Nuvo", -20, 430, -8, 3), src: "/images/stone/5131.webp?v=2" },
      timber("White Painted Wood", "AU1003791", 402, 214, 4, 4),
      paint("paintB", "Coastal Fringe", "#C9D2D4", 404, 392, 4, 5),
      metal("Brushed Brass", "brushed-brass", 182, 488, 0, 5),
    ],
  },
  {
    id: "kitchen-industrial-charcoal",
    pieces: [
      photo("kitchen-industrial-charcoal", 1),
      hero("Foundry 60 Cast Iron", "Concrete-look porcelain", `${T}/1599714485.webp?v=3`),
      feature({ kind: "tile", name: "Ironclad Corten", sub: "Metal-look feature", src: `${T}/1771887418-612v3.webp?v=1`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Pampas", "ai-floral-pampas-cream", -30, 8, 128, 220, 8),
      paint("paintA", "Milton Moon", "#A19D91", 0, 248, -3, 5),
      { ...stone("Raw Concrete", -20, 430, 5, 3), src: "/images/stone/4004.webp?v=2" },
      timber("Charred Oak", "AU1004571", 402, 214, -6, 4),
      paint("paintB", "Domino", "#3D4247", 404, 392, 4, 5),
      metal("Matte Black", "matte-black", 182, 488, 0, 5),
    ],
  },
  {
    id: "living-japandi-warm",
    pieces: [
      photo("living-japandi-warm", -1),
      plankHero("Heartwood 212 Oak", "Timber-look porcelain", `${T}/1760406822.webp?v=3`),
      feature({ kind: "tile", name: "Atami Mosaic Sage", sub: "Feature mosaic", src: `${ABI_MOSAIC}/Atami-Small-Square-Mosaic-Tile-Sage-Green-306x306mm-SKU-19125_1-1-scaled.jpg`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Hog Bristle", "#E4DDC8", 0, 248, -4, 5),
      styling("bowl", "Wooden Bowl", "ai-decor-wooden-bowl", -12, 440, 150, 140, 3),
      metal("Brushed Brass", "brushed-brass", 404, 216, 0, 4),
      paint("paintB", "Timeless Grey", "#B6B3AA", 404, 396, 3, 5),
    ],
  },
  {
    id: "outdoor-alfresco-stone",
    pieces: [
      photo("outdoor-alfresco-stone", 1),
      hero("Cabarita 60 Sandstone", "In/out porcelain", `${T}/1744156246.webp?v=3`),
      feature({ kind: "stone", name: "Bastion Sandstone", sub: "Stone veneer", src: `${VENEER}/bastion-sandstone.webp?v=1`, w: 176, h: 176, radius: 10 }),
      styling("plant", "Mediterranean Jug", "ai-floral-mediterranean-jug", -26, 6, 122, 236, 8),
      paint("paintA", "Golden Sand", "#E1CD99", 0, 250, -6, 5),
      paint("paintB", "Antique White U.S.A.", "#E6DECC", 0, 432, 3, 5),
      metal("Stainless Steel", "stainless-steel", 404, 214, -4, 4),
      styling("plant2", "Olive Branch", "ai-floral-olive-branch", 402, 352, 126, 244, 8),
    ],
  },
  {
    // Reagan's own Vision Board (coastal blue-floral) as ONE hero card that shows
    // BOTH AI rooms (bath + kitchen) collaged together, with the palette swatches
    // around them: Woodstock 212 Oak plank floor + Antico Designer Valencia Blue
    // feature + Lunar Frost benchtop + Antique Slate tapware + cushion / florals.
    id: "custom-coastal-duo",
    pieces: [
      { id: "photo", kind: "photo", name: "Room", src: "/images/hero-boards/custom-coastal-bath.jpg", x: 0, y: 8, w: 274, h: 268, rot: -2, z: 2 },
      { id: "photo2", kind: "photo", name: "Room", src: "/images/hero-boards/custom-coastal-kitchen.jpg", x: 246, y: 44, w: 270, h: 266, rot: 2.5, z: 3 },
      { ...plankHero("Woodstock 212 Oak", "Timber-look porcelain", `${T}/1781578830.webp?v=3`), x: 116, y: 328, w: 290, h: 146 },
      { id: "feature", kind: "tile", name: "Antico Designer Valencia Blue", sub: "Blue floral feature", src: tp(`${T}/GLOANQVALENB15M.webp?v=3`), x: 6, y: 392, w: 148, h: 148, rot: -3, z: 4, radius: 2 },
      { ...stone("Lunar Frost", 348, 452, 3, 4), w: 128, h: 128, src: "/images/stone/5141.webp?v=2" },
      metal("Antique Slate", "antique-slate", 70, 490, -4, 7),
      styling("cushion", "Cream Knit", "ai-cushion-cream-knit", 190, 478, 110, 110, 5),
      styling("dried", "Dried Mixed", "ai-floral-dried-mixed", 412, 300, 102, 148, 8),
    ],
  },
  // ── Vision-board collections (warm Mediterranean / coastal) — the same curated
  //    looks featured on /vision-board, added to the hero rotation. ──────────────
  {
    id: "vb-coastal-kitchen",
    pieces: [
      photo("vb-coastal-kitchen", -1),
      hero("Terroir 60 Terra", "Terracotta-look porcelain", `${T}/1736898466.webp?v=3`),
      { id: "feature", kind: "tile", name: "Gelato Azzurro", sub: "Gloss subway", src: tp(`${T}/1718246903.webp?v=3`), x: 314, y: 44, w: 204, h: 96, rot: 3, z: 3, radius: 2 },
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Natural White", "#EFE9DB", 0, 248, -4, 5),
      { ...stone("Antikella", -20, 430, -6, 3), src: "/images/stone/536.webp?v3" },
      timber("Golden Oak", "AU1006823", 402, 214, -5, 4),
      paint("paintB", "Raw Umber", "#D9D0B8", 404, 392, 3, 5),
      metal("Brushed Brass", "brushed-brass", 182, 488, 4, 5),
    ],
  },
  {
    id: "vb-marrakesh-ensuite",
    pieces: [
      photo("vb-marrakesh-ensuite", 1),
      hero("Colonnade 60 Classico", "Travertine-look porcelain", `${T}/1718244596.webp?v=3`),
      feature({ kind: "tile", name: "Marrakesh Terracotta", sub: "Terracotta mosaic", src: `${T}/1726104512.webp?v=3`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Antique White U.S.A.", "#E6DECC", 0, 248, -3, 5),
      { ...stone("Taj Whisper", -20, 430, -4, 3), src: "/images/stone/8251.webp?v=2" },
      timber("Golden Oak", "AU1006823", 402, 214, -6, 4),
      paint("paintB", "Raw Umber", "#D9D0B8", 404, 392, 5, 5),
      metal("Tumbled Aged Brass", "tumbled-aged-brass", 182, 488, 4, 5),
    ],
  },
  {
    id: "vb-coastal-powder",
    pieces: [
      photo("vb-coastal-powder", -1),
      hero("Strata 60 Ivory", "Terrazzo-look porcelain", `${T}/1718319318.webp?v=3`),
      feature({ kind: "tile", name: "Cuadrado Feature Almond", sub: "Textured feature", src: `${T}/1779939428.webp?v=3`, w: 176, h: 176, radius: 2 }),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Natural White", "#EFE9DB", 0, 248, -5, 5),
      { ...stone("Antikella", -20, 430, -8, 3), src: "/images/stone/536.webp?v3" },
      timber("Whitewashed Oak", "AU1007480", 402, 214, 4, 4),
      paint("paintB", "Tranquil Retreat", "#D8D3C7", 404, 392, 4, 5),
      metal("Brushed Brass", "brushed-brass", 182, 488, 0, 5),
    ],
  },
  {
    id: "vb-stackstone-living",
    pieces: [
      photo("vb-stackstone-living", 1),
      plankHero("Woodstock 212 Driftwood", "Timber-look porcelain", `${T}/1781579195.webp?v=3`),
      feature({ kind: "stone", name: "Ridgeline Dune", sub: "Stacked stone veneer", src: `${VENEER}/ridgeline-dune.webp?v=1`, w: 176, h: 176, radius: 10 }),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", -24, 10, 110, 214, 8),
      paint("paintA", "Hog Bristle", "#E4DDC8", 0, 248, -4, 5),
      { ...stone("Taj Whisper", -20, 430, -6, 3), src: "/images/stone/8251.webp?v=2" },
      timber("Golden Oak", "AU1006823", 402, 214, -5, 4),
      paint("paintB", "Timeless Grey", "#B6B3AA", 404, 392, 3, 5),
      metal("Brushed Brass", "brushed-brass", 182, 488, 0, 5),
    ],
  },
];
