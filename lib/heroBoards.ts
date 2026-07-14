// Curated hero vision boards for the Ambient Drift showcase. Each board = a
// pre-generated AI room render (built from these exact samples via the site's
// own imagine pipeline) + the real product swatches, as a per-board piece list
// in board-local coordinates (BOARD_W x BOARD_H).
//
// Composition rules (Reagan, LOCKED):
//  - the HERO porcelain tile is the biggest piece, centred, FRONT, never hidden
//  - ONLY the hero tile + feature/mosaic slot keep the same position on every
//    board - decor, paint, plant, metal and stone reposition per board
//  - NO white borders on swatches; NO labels; tiles get HARD-SQUARE corners
//  - the AI room render stays smaller than the hero tile (supporting, not the
//    feature); the ABI logo stays on the metal disc
export type BoardPiece = {
  id: string;
  kind: "photo" | "swatch" | "metal" | "plant" | "paint";
  src?: string;   // image (photo/swatch/metal/plant)
  color?: string; // paint chip hex
  x: number;      // board-local px
  y: number;
  w: number;
  h: number;
  rot: number;    // resting rotation (deg)
  z: number;
  radius?: number; // corner radius px - tiles 3 (hard square), others rounded
};

export type HeroBoard = { id: string; pieces: BoardPiece[] };

export const BOARD_W = 520;
export const BOARD_H = 600;

const GT = "https://cdn.shopify.com/s/files/1/0626/3370/5561/files";
const GH =
  "https://res.cloudinary.com/gh/image/upload/d_variants:0203600500:floods:flat-web.jpg/ar_1:1,c_crop,g_center,w_400/f_auto/q_auto:good/v1/variants/0203600500/swatches/1";

// Slots every board shares (the anchors of the collage).
const photo = (id: string, rot: number): BoardPiece => ({
  id: "photo", kind: "photo", src: `/images/hero-boards/${id}.jpg`,
  x: 24, y: 24, w: 320, h: 240, rot, z: 2, radius: 18,
});
const hero = (src: string): BoardPiece => ({
  id: "hero", kind: "swatch", src,
  x: 156, y: 250, w: 212, h: 212, rot: -3, z: 6, radius: 3,
});
// The feature slot holds each board's secondary material - a mosaic/wall tile,
// the stackstone, or the rug - so the two anchor positions never move.
const feature = (src: string, radius = 3): BoardPiece => ({
  id: "feature", kind: "swatch", src,
  x: 358, y: 28, w: 134, h: 134, rot: 3, z: 3, radius,
});

export const HERO_BOARDS: HeroBoard[] = [
  {
    id: "bath-coastal-white",
    pieces: [
      photo("bath-coastal-white", -1),
      hero(`${GT}/BiancoCarraraIn_Out600x600.jpg?width=600`),
      feature("/images/tiles/white-gloss-penny-round.webp"),
      { id: "timber", kind: "swatch", src: "/images/timber/AU1007480.webp", x: 364, y: 182, w: 126, h: 126, rot: -4, z: 2, radius: 16 },
      { id: "stone", kind: "swatch", src: "/images/stone/5131.webp?v=2", x: 382, y: 332, w: 124, h: 124, rot: 5, z: 4, radius: 16 },
      { id: "metal", kind: "metal", src: "/images/metals/abi/brushed-nickel.webp", x: 272, y: 478, w: 60, h: 60, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#EFE9DB", x: 118, y: 498, w: 62, h: 62, rot: -4, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#D8D3C7", x: 196, y: 514, w: 62, h: 62, rot: 3, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-green-skimmia-stem.webp", x: -6, y: 252, w: 81, h: 200, rot: 0, z: 8 },
    ],
  },
  {
    id: "bath-warm-stone",
    pieces: [
      photo("bath-warm-stone", 1),
      hero(`${GT}/Travertine3DCross-cutCrossCutWarmIn_Out600x600_4464205c-d2d9-407a-bb81-e12e94a4d1e3.jpg?width=600`),
      feature("/images/tiles/roman-travertine-mini-arch-mosaic.webp"),
      { id: "timber", kind: "swatch", src: "/images/timber/AU1006823.webp", x: 30, y: 322, w: 138, h: 138, rot: -7, z: 3, radius: 16 },
      { id: "stone", kind: "swatch", src: "/images/stone/8251.webp?v=2", x: 378, y: 190, w: 128, h: 128, rot: -4, z: 2, radius: 16 },
      { id: "metal", kind: "metal", src: "/images/metals/abi/tumbled-aged-brass.webp", x: 250, y: 478, w: 60, h: 60, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#E6DECC", x: 140, y: 500, w: 62, h: 62, rot: 4, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#D9D0B8", x: 60, y: 486, w: 62, h: 62, rot: -3, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-willow-twig-stem.webp", x: 450, y: 320, w: 78, h: 210, rot: 0, z: 8 },
    ],
  },
  {
    id: "kitchen-hamptons-white",
    pieces: [
      photo("kitchen-hamptons-white", -1),
      hero(`${GT}/Limestone2.0CottonMatt600x600.jpg?width=600`),
      feature(`${GT}/HamptonHandmadewhitematt76x302x8.jpg?width=600`),
      { id: "timber", kind: "swatch", src: "/images/timber/AU1003791.webp", x: 380, y: 186, w: 128, h: 128, rot: 4, z: 2, radius: 16 },
      { id: "stone", kind: "swatch", src: "/images/stone/5131.webp?v=2", x: 32, y: 326, w: 142, h: 142, rot: -8, z: 3, radius: 16 },
      { id: "metal", kind: "metal", src: "/images/metals/abi/brushed-brass.webp", x: 346, y: 482, w: 58, h: 58, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#EFE9DB", x: 96, y: 494, w: 62, h: 62, rot: -5, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#C9D2D4", x: 178, y: 510, w: 62, h: 62, rot: 4, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-lemon-stem.webp", x: -8, y: 257, w: 83, h: 195, rot: 0, z: 8 },
    ],
  },
  {
    id: "kitchen-industrial-charcoal",
    pieces: [
      photo("kitchen-industrial-charcoal", 1),
      hero(`${GT}/LavidaDarkGreyMatt600x600.jpg?width=600`),
      feature("/images/tiles/stack-bond-tundra.webp"),
      { id: "timber", kind: "swatch", src: "/images/timber/AU1004571.webp", x: 32, y: 320, w: 136, h: 136, rot: -6, z: 3, radius: 16 },
      { id: "stone", kind: "swatch", src: "/images/stone/4004.webp?v=2", x: 378, y: 188, w: 128, h: 128, rot: 5, z: 2, radius: 16 },
      { id: "metal", kind: "metal", src: "/images/metals/abi/matte-black.webp", x: 92, y: 494, w: 58, h: 58, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#A19D91", x: 226, y: 500, w: 62, h: 62, rot: -3, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#3D4247", x: 306, y: 486, w: 62, h: 62, rot: 4, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-native-berry-eucalypt-bunch.webp", x: 428, y: 360, w: 117, h: 170, rot: 0, z: 8 },
    ],
  },
  {
    id: "living-japandi-warm",
    pieces: [
      photo("living-japandi-warm", -1),
      hero(`${GT}/EverTimberNaturalMatt200x1200.jpg?width=600`),
      feature(GH, 16), // Cotswold Stone wool rug swatch (carpet stays rounded)
      { id: "cushion", kind: "plant", src: "/images/styling/cushion-ember-luxe-cushion-55x55.webp", x: 374, y: 300, w: 124, h: 123, rot: 0, z: 4 },
      { id: "metal", kind: "metal", src: "/images/metals/abi/brushed-brass.webp", x: 396, y: 196, w: 64, h: 64, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#E4DDC8", x: 76, y: 490, w: 62, h: 62, rot: -4, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#B6B3AA", x: 158, y: 506, w: 62, h: 62, rot: 3, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-olive-stem.webp", x: -6, y: 247, w: 95, h: 205, rot: 0, z: 8 },
    ],
  },
  {
    id: "outdoor-alfresco-stone",
    pieces: [
      photo("outdoor-alfresco-stone", 1),
      hero(`${GT}/Acacia_Neutral_300x600_de58c420-70c5-4f42-aff5-b75e560a7d2b.jpg?width=600`),
      feature(`${GT}/TRAV-CLASSIC-IVORY-CRAZY-PAVE-2.jpg?width=600`),
      { id: "metal", kind: "metal", src: "/images/metals/abi/stainless-steel.webp", x: 396, y: 200, w: 64, h: 64, rot: 0, z: 5 },
      { id: "paintA", kind: "paint", color: "#E1CD99", x: 212, y: 502, w: 62, h: 62, rot: -4, z: 2, radius: 16 },
      { id: "paintB", kind: "paint", color: "#E6DECC", x: 292, y: 488, w: 62, h: 62, rot: 5, z: 2, radius: 16 },
      { id: "plant", kind: "plant", src: "/images/styling/floral-flowering-gum-stem.webp", x: -2, y: 222, w: 63, h: 230, rot: 0, z: 8 },
      { id: "plant2", kind: "plant", src: "/images/styling/floral-olive-stem.webp", x: 448, y: 365, w: 77, h: 165, rot: 0, z: 8 },
    ],
  },
];
