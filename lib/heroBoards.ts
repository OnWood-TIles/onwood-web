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

// ---- shared anchor slots (identical on every board) -------------------------
const photo = (id: string, rot: number): BoardPiece => ({
  id: "photo", kind: "photo", name: "Room", src: `/images/hero-boards/${id}.jpg`,
  x: 14, y: 14, w: 300, h: 212, rot, z: 2,
});
// Hero tile - biggest, centred, FRONT (tool tile face scaled up).
const hero = (name: string, sub: string, src: string): BoardPiece => ({
  id: "hero", kind: "tile", name, sub, src,
  x: 136, y: 238, w: 240, h: 240, rot: -2, z: 6, radius: 2,
});
// Feature slot - the board's secondary material (mosaic / subway / stone veneer),
// top-right, fixed position.
const feature = (p: Omit<BoardPiece, "id" | "x" | "y" | "rot" | "z">): BoardPiece => ({
  id: "feature", x: 332, y: 18, rot: 3, z: 3, ...p,
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

export const HERO_BOARDS: HeroBoard[] = [
  {
    id: "bath-coastal-white",
    pieces: [
      photo("bath-coastal-white", -1),
      hero("Alba 45 Statuario", "Marble-look porcelain", `${T}/1668640604.webp?v=3`),
      feature({ kind: "tile", name: "Aspect White Subway", sub: "Gloss subway", src: `${T}/1599661909.webp?v=3`, w: 176, h: 176, radius: 2 }),
      timber("Whitewashed Oak", "AU1007480", 392, 206, -5, 4),
      { ...stone("Calacatta Nuvo", 8, 296, -7, 3), src: "/images/stone/5131.webp?v=2" },
      paint("paintA", "Natural White", "#EFE9DB", 48, 428, -4, 5),
      paint("paintB", "Tranquil Retreat", "#D8D3C7", 186, 436, 3, 4),
      metal("Brushed Nickel", "brushed-nickel", 334, 430, 4, 5),
      styling("plant", "Native Gum", "ai-floral-native-gum", -38, 96, 146, 360, 8),
    ],
  },
  {
    id: "bath-warm-stone",
    pieces: [
      photo("bath-warm-stone", 1),
      hero("Colonnade 60 Classico", "Travertine-look porcelain", `${T}/1718244731.webp?v=3`),
      feature({ kind: "tile", name: "Atami Mosaic Oat", sub: "Feature mosaic", src: `${ABI_MOSAIC}/Atami_Large_Square_Mosaic_Tile_300x300_Latte-scaled.jpg`, w: 176, h: 176, radius: 2 }),
      timber("Golden Oak", "AU1006823", 20, 296, -6, 3),
      { ...stone("Taj Whisper", 336, 204, -4, 2), src: "/images/stone/8251.webp?v=2" },
      metal("Tumbled Aged Brass", "tumbled-aged-brass", 60, 430, 4, 5),
      paint("paintA", "Antique White U.S.A.", "#E6DECC", 190, 434, -3, 4),
      paint("paintB", "Raw Umber", "#D9D0B8", 322, 428, 5, 4),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", 424, 210, 127, 340, 8),
    ],
  },
  {
    id: "kitchen-hamptons-white",
    pieces: [
      photo("kitchen-hamptons-white", -1),
      hero("Cottesloe 60 Limestone", "Limestone-look porcelain", `${T}/1665021475.webp?v=3`),
      feature({ kind: "tile", name: "Aspect White Subway", sub: "Matt subway", src: `${T}/1599661634.webp?v=3`, w: 176, h: 176, radius: 2 }),
      timber("White Painted Wood", "AU1003791", 392, 206, 4, 4),
      { ...stone("Calacatta Nuvo", 8, 296, -8, 3), src: "/images/stone/5131.webp?v=2" },
      paint("paintA", "Natural White", "#EFE9DB", 54, 426, -5, 4),
      metal("Brushed Brass", "brushed-brass", 204, 432, 0, 5),
      paint("paintB", "Coastal Fringe", "#C9D2D4", 330, 434, 4, 4),
      styling("plant", "Hydrangea", "ai-floral-hydrangea-blue", -34, 120, 140, 330, 8),
    ],
  },
  {
    id: "kitchen-industrial-charcoal",
    pieces: [
      photo("kitchen-industrial-charcoal", 1),
      hero("Foundry 60 Cast Iron", "Concrete-look porcelain", `${T}/1599714485.webp?v=3`),
      feature({ kind: "tile", name: "Ironclad Corten", sub: "Metal-look feature", src: `${T}/1771887418-612v3.webp?v=1`, w: 176, h: 176, radius: 2 }),
      timber("Charred Oak", "AU1004571", 20, 298, -6, 3),
      { ...stone("Raw Concrete", 336, 206, 5, 2), src: "/images/stone/4004.webp?v=2" },
      metal("Matte Black", "matte-black", 66, 432, 0, 5),
      paint("paintA", "Milton Moon", "#A19D91", 196, 438, -3, 4),
      paint("paintB", "Domino", "#3D4247", 328, 428, 4, 4),
      styling("plant", "Pampas", "ai-floral-pampas-cream", 386, 336, 179, 260, 8),
    ],
  },
  {
    id: "living-japandi-warm",
    pieces: [
      photo("living-japandi-warm", -1),
      hero("Heartwood 212 Oak", "Timber-look porcelain", `${T}/1760406822.webp?v=3`),
      feature({ kind: "tile", name: "Atami Mosaic Sage", sub: "Feature mosaic", src: `${ABI_MOSAIC}/Atami-Small-Square-Mosaic-Tile-Sage-Green-306x306mm-SKU-19125_1-1-scaled.jpg`, w: 176, h: 176, radius: 2 }),
      styling("bowl", "Wooden Bowl", "ai-decor-wooden-bowl", 14, 300, 158, 150, 3),
      metal("Brushed Brass", "brushed-brass", 64, 432, 0, 5),
      paint("paintA", "Hog Bristle", "#E4DDC8", 192, 436, -4, 4),
      paint("paintB", "Timeless Grey", "#B6B3AA", 324, 430, 3, 4),
      styling("plant", "Olive Branch", "ai-floral-olive-branch", 404, 236, 153, 330, 8),
    ],
  },
  {
    id: "outdoor-alfresco-stone",
    pieces: [
      photo("outdoor-alfresco-stone", 1),
      hero("Cabarita 60 Sandstone", "In/out porcelain", `${T}/1744156246.webp?v=3`),
      feature({ kind: "stone", name: "Bastion Sandstone", sub: "Stone veneer", src: `${VENEER}/bastion-sandstone.webp?v=1`, w: 176, h: 176, radius: 10 }),
      metal("Stainless Steel", "stainless-steel", 394, 210, -4, 4),
      paint("paintA", "Golden Sand", "#E1CD99", 24, 300, -6, 3),
      paint("paintB", "Antique White U.S.A.", "#E6DECC", 190, 436, 3, 4),
      styling("plant", "Mediterranean Jug", "ai-floral-mediterranean-jug", -30, 50, 128, 400, 8),
      styling("plant2", "Olive Branch", "ai-floral-olive-branch", 400, 320, 139, 300, 8),
    ],
  },
];
