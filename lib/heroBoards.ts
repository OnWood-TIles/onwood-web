// Curated hero vision boards for the Ambient Drift showcase. Each board = a
// pre-generated AI room render (built from these exact samples via the site's
// own imagine pipeline) + the REAL product samples, rendered with the same
// components as the Vision Board tool (PaintChipFace fan-deck chips with punch
// hole + name pill, FloorSwatchFace tiles, CarpetSwatchFace, ABI metal discs)
// at the tool's real design sizes, as per-board piece lists in board-local
// coordinates (BOARD_W x BOARD_H).
//
// Composition rules (Reagan, LOCKED):
//  - the HERO porcelain tile is the biggest piece, centred, FRONT, never hidden
//  - ONLY the hero tile + feature slot keep the same position on every board -
//    everything else repositions per board
//  - samples look exactly like the Vision Board tool's (labels, badges, punch
//    holes); florals may render LARGER than the tool for colour + vibe
//  - dense collage - minimal white space; the ABI logo stays on the metal disc
export type BoardPiece = {
  id: string;
  kind: "photo" | "tile" | "timber" | "paint" | "metal" | "carpet" | "stone" | "styling";
  name: string;
  sub?: string;       // range / type line under the name
  src?: string;       // texture / swatch / cutout image
  color?: string;     // paint hex
  brandLogo?: string; // corner brand badge (Laminex / Feltex / ABI)
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

const GT = "https://cdn.shopify.com/s/files/1/0626/3370/5561/files";
const LAMINEX = "/images/timber/laminex-logo.svg";
const ABI = "/images/metals/abi/abi-logo.svg";

// ---- shared anchor slots (identical on every board) -------------------------
const photo = (id: string, rot: number): BoardPiece => ({
  id: "photo", kind: "photo", name: "Room", src: `/images/hero-boards/${id}.jpg`,
  x: 14, y: 14, w: 300, h: 212, rot, z: 2,
});
// Hero porcelain tile - biggest, centred, FRONT (tool tile face scaled up).
const hero = (name: string, sub: string, src: string): BoardPiece => ({
  id: "hero", kind: "tile", name, sub, src,
  x: 136, y: 238, w: 240, h: 240, rot: -2, z: 6, radius: 2,
});
// Feature slot - the board's secondary material (mosaic / wall tile / crazy
// pave / the rug), top-right, fixed position.
const feature = (p: Omit<BoardPiece, "id" | "x" | "y" | "rot" | "z">): BoardPiece => ({
  id: "feature", x: 332, y: 18, rot: 3, z: 3, ...p,
});

// ---- piece factories at the tool's real design sizes ------------------------
const tile = (id: string, name: string, sub: string, src: string, x: number, y: number, rot: number, z: number, edge = 176): BoardPiece =>
  ({ id, kind: "tile", name, sub, src, x, y, w: edge, h: edge, rot, z, radius: 2 });
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

export const HERO_BOARDS: HeroBoard[] = [
  {
    id: "bath-coastal-white",
    pieces: [
      photo("bath-coastal-white", -1),
      hero("BIANCO Carrara In & Out", "BIANCO CARRARA", `${GT}/BiancoCarraraIn_Out600x600.jpg?width=600`),
      feature({ kind: "tile", name: "White Gloss Penny Round", sub: "Penny Rounds", src: "/images/tiles/white-gloss-penny-round.webp", w: 176, h: 176, radius: 2 }),
      timber("Whitewashed Oak", "AU1007480", 392, 206, -5, 4),
      { ...stone("Calacatta Nuvo", 8, 296, -7, 3), src: "/images/stone/5131.webp?v=2" },
      paint("paintA", "Natural White", "#EFE9DB", 48, 428, -4, 5),
      paint("paintB", "Tranquil Retreat", "#D8D3C7", 186, 436, 3, 4),
      metal("Brushed Nickel", "brushed-nickel", 334, 430, 4, 5),
      styling("plant", "Green Skimmia Stem", "floral-green-skimmia-stem", -38, 96, 146, 360, 8),
    ],
  },
  {
    id: "bath-warm-stone",
    pieces: [
      photo("bath-warm-stone", 1),
      hero("TRAVERTINE 3D CROSSCUT Warm", "TRAVERTINE 3D CROSSCUT", `${GT}/Travertine3DCross-cutCrossCutWarmIn_Out600x600_4464205c-d2d9-407a-bb81-e12e94a4d1e3.jpg?width=600`),
      feature({ kind: "tile", name: "Roman Travertine Mini Arch", sub: "Feature Tiles", src: "/images/tiles/roman-travertine-mini-arch-mosaic.webp", w: 176, h: 176, radius: 2 }),
      timber("Golden Oak", "AU1006823", 20, 296, -6, 3),
      { ...stone("Taj Whisper", 336, 204, -4, 2), src: "/images/stone/8251.webp?v=2" },
      metal("Tumbled Aged Brass", "tumbled-aged-brass", 60, 430, 4, 5),
      paint("paintA", "Antique White U.S.A.", "#E6DECC", 190, 434, -3, 4),
      paint("paintB", "Raw Umber", "#D9D0B8", 322, 428, 5, 4),
      styling("plant", "Willow Twig Stem", "floral-willow-twig-stem", 424, 210, 127, 340, 8),
    ],
  },
  {
    id: "kitchen-hamptons-white",
    pieces: [
      photo("kitchen-hamptons-white", -1),
      hero("LIMESTONE 2.0 Cotton Matt", "LIMESTONE", `${GT}/Limestone2.0CottonMatt600x600.jpg?width=600`),
      feature({ kind: "tile", name: "Hampton White Matt", sub: "Feature Tiles", src: `${GT}/HamptonHandmadewhitematt76x302x8.jpg?width=600`, w: 176, h: 176, radius: 2 }),
      timber("White Painted Wood", "AU1003791", 392, 206, 4, 4),
      { ...stone("Calacatta Nuvo", 8, 296, -8, 3), src: "/images/stone/5131.webp?v=2" },
      paint("paintA", "Natural White", "#EFE9DB", 54, 426, -5, 4),
      metal("Brushed Brass", "brushed-brass", 204, 432, 0, 5),
      paint("paintB", "Coastal Fringe", "#C9D2D4", 330, 434, 4, 4),
      styling("plant", "Lemon Stem", "floral-lemon-stem", -34, 120, 140, 330, 8),
    ],
  },
  {
    id: "kitchen-industrial-charcoal",
    pieces: [
      photo("kitchen-industrial-charcoal", 1),
      hero("LAVIDA Dark Grey Matt", "LAVIDA", `${GT}/LavidaDarkGreyMatt600x600.jpg?width=600`),
      feature({ kind: "tile", name: "Stack Bond Tundra", sub: "Feature Tiles", src: "/images/tiles/stack-bond-tundra.webp", w: 176, h: 176, radius: 2 }),
      timber("Charred Oak", "AU1004571", 20, 298, -6, 3),
      { ...stone("Raw Concrete", 336, 206, 5, 2), src: "/images/stone/4004.webp?v=2" },
      metal("Matte Black", "matte-black", 66, 432, 0, 5),
      paint("paintA", "Milton Moon", "#A19D91", 196, 438, -3, 4),
      paint("paintB", "Domino", "#3D4247", 328, 428, 4, 4),
      styling("plant", "Native Berry Eucalypt", "floral-native-berry-eucalypt-bunch", 386, 336, 179, 260, 8),
    ],
  },
  {
    id: "living-japandi-warm",
    pieces: [
      photo("living-japandi-warm", -1),
      hero("Ever Timber Natural Matt", "Ever Timber", `${GT}/EverTimberNaturalMatt200x1200.jpg?width=600`),
      feature({
        kind: "carpet", name: "Cotswold Stone", sub: "Stonefields", brandLogo: "/images/carpet/feltex-logo.svg",
        src: "https://res.cloudinary.com/gh/image/upload/d_variants:0203600500:floods:flat-web.jpg/ar_1:1,c_crop,g_center,w_400/f_auto/q_auto:good/v1/variants/0203600500/swatches/1",
        w: 176, h: 176,
      }),
      styling("cushion", "Ember Luxe Cushion", "cushion-ember-luxe-cushion-55x55", 14, 296, 160, 159, 3),
      metal("Brushed Brass", "brushed-brass", 64, 432, 0, 5),
      paint("paintA", "Hog Bristle", "#E4DDC8", 192, 436, -4, 4),
      paint("paintB", "Timeless Grey", "#B6B3AA", 324, 430, 3, 4),
      styling("plant", "Olive Stem", "floral-olive-stem", 404, 236, 153, 330, 8),
    ],
  },
  {
    id: "outdoor-alfresco-stone",
    pieces: [
      photo("outdoor-alfresco-stone", 1),
      hero("ACACIA Beige External", "ACACIA", `${GT}/Acacia_Neutral_300x600_de58c420-70c5-4f42-aff5-b75e560a7d2b.jpg?width=600`),
      feature({ kind: "tile", name: "Crazy Pave", sub: "Natural Stone", src: `${GT}/TRAV-CLASSIC-IVORY-CRAZY-PAVE-2.jpg?width=600`, w: 176, h: 176, radius: 2 }),
      metal("Stainless Steel", "stainless-steel", 394, 210, -4, 4),
      paint("paintA", "Golden Sand", "#E1CD99", 24, 300, -6, 3),
      paint("paintB", "Antique White U.S.A.", "#E6DECC", 190, 436, 3, 4),
      styling("plant", "Flowering Gum Stem", "floral-flowering-gum-stem", -30, 50, 114, 420, 8),
      styling("plant2", "Olive Stem", "floral-olive-stem", 400, 320, 139, 300, 8),
    ],
  },
];
