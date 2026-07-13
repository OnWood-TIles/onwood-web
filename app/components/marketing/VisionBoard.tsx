"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import Reveal from "../ui/Reveal";
import { PaintChipFace } from "./PaintChip";
import { CarpetSwatchFace, BrandBadge } from "./CarpetSwatch";
import { FloorSwatchFace } from "./FloorSwatch";
import { DULUX_COLOURS } from "../../../lib/dulux";
import { type MetalFinish } from "../../../lib/metals";
import type { CarpetSwatchItem } from "../../../lib/carpet";
import {
  IMAGINE_ROOMS,
  IMAGINE_STYLES,
  type ImagineItem,
} from "../../../lib/imagine";

// The Caesarstone-benchtop "Vision board" (bottom half of the showroom section).
// Tap a swatch to drop a draggable colour chip onto the benchtop, then drag each
// piece around via pointer events. "Clear board" removes them all.
//
// NOTE: lib/content.ts is server-only, so this "use client" component cannot
// import VISION_TABS / SHOWROOM directly. It accepts `tabs` and `head` as props
// (a server parent passes VISION_TABS + the SHOWROOM vision copy) and falls back
// to defaults that mirror content.ts exactly, so it is fully self-contained.

export type VisionSwatch = { name: string; color: string };
export type VisionTabs = Record<string, VisionSwatch[]>;
export type VisionHead = { eyebrow: string; title: string; sub: string };

// Defaults mirror lib/content.ts (VISION_TABS + SHOWROOM vision copy).
// The "paint" tab is handled specially (a searchable Dulux picker), so it is
// NOT listed here - only the material chip rails are.
// No standalone colour-chip rails remain - every tab is a SPECIAL searchable
// picker. (The old "decor" rail was removed 2026-07-10; Decor lives under Styling.)
const DEFAULT_TABS: VisionTabs = {};

const DEFAULT_HEAD: VisionHead = {
  eyebrow: "Vision board",
  title: "Build the look on a Caesarstone benchtop.",
  sub: "Pick paint, tiles, flooring, cabinetry, benchtops and styling from the tabs, then drag each piece to arrange your board.",
};

const TAB_ORDER = ["paint", "tiles", "benchtops"];

// Pretty tab labels for keys that don't title-case cleanly.
const TAB_LABELS: Record<string, string> = {
  metals: "Metals",
};

// Deterministic drop offsets (Math.random is unavailable). Cycled + drifted by a
// counter so successive drops fan out around the benchtop centre without stacking.
const DROP_OFFSETS: [number, number][] = [
  [0, -10],
  [56, -42],
  [-50, 30],
  [74, 46],
  [-68, -48],
  [30, 72],
  [-84, 10],
  [90, -26],
  [-22, -74],
  [44, -2],
];

// Caesarstone benchtop surface (selecting one reskins the board). `url` is the
// landscape image (desktop board), `urlP` the portrait image (mobile board).
type StoneItem = { name: string; code: string; url: string; urlP: string };

// Laminex woodgrain decor (Kitchen Cabinetry tab). Rendered as a paint-chip-sized
// swatch with the timber photo as the card face. Hosted locally (see
// scripts/gen-timber.mjs) as public/data/timber.json.
type TimberItem = { name: string; finish: string; code: string; url: string; brand?: string };

// Quick-Step flooring product (Flooring tab). type = vinyl|laminate|timber|hybrid.
// Images hotlink from Quick-Step's CDN. See scripts/gen-flooring.mjs.
type FloorItem = {
  name: string;
  range: string;
  type: string;
  brand: string;
  code: string;
  url: string;
};
const FLOOR_TYPES = ["vinyl", "laminate", "timber", "hybrid"] as const;

// Styling item (Styling tab) - background-removed cutout objects (cushions,
// florals, decor) from Provincial Home Living for mood + colour. ar = width/height
// so the board can size each cutout to its natural shape.
type StylingItem = { name: string; category: string; url: string; ar: number };
const STYLING_CATS = ["Cushion", "Floral", "Decor"] as const;

// GlowTile tile (Tiles tab). Shopify product; the tile face hotlinks from
// cdn.shopify.com. Shown WITHOUT a brand badge (Reagan's call). type = the
// GlowTile collection ("Feature Tiles", "TUNDRA", ...). See scripts/gen-tiles.mjs.
type TileItem = { id: string; name: string; type: string; url: string };

const PIECE = 64; // material chip (square)
const PAINT_W = 120; // Dulux paint chip
const PAINT_H = 168;
const METAL_W = 112; // ABI finish disc + name label
const METAL_H = 142;

// ABI Interiors metal finish (real cut-out sample-disc photo). See scripts/gen-abi.mjs.
type AbiMetal = { name: string; url: string };
const ABI_LOGO = "/images/metals/abi/abi-logo.svg";
const CARPET_W = 210; // carpet swatch + label (~2x)
const CARPET_H = 262;
const FLOOR_W = 176; // flooring plank sample (rectangular, ~carpet size)
const FLOOR_H = 248;
const TILE_EDGE = 176; // GlowTile tile: square swatch (~carpet/flooring scale)
const STYLE_MAX = 178; // styling cutout: long-edge target (aspect preserved per item)
const STYLE_MAX_BIG = 340; // florals drop ~2x larger than cushions (wispy stems need height)
const STYLE_MAX_DECOR = 150; // decor accents (bowls/planters/boxes) drop small, near swatch size
const RENDER_MAX = 300; // AI room render default size (medium; user resizes S/M/L)
const RENDER_SIZES: { label: string; edge: number }[] = [
  { label: "S", edge: 190 },
  { label: "M", edge: 300 },
  { label: "L", edge: 440 },
];
const BIN_SIZE = 58;
const BIN_MARGIN = 14;
const MAX_TILT = 15; // max sway angle (deg)
const TILT_K = 0.7; // velocity -> tilt gain

type PieceKind =
  | "chip"
  | "paint"
  | "metal"
  | "carpet"
  | "timber"
  | "flooring"
  | "tile"
  | "styling"
  | "render";
type Piece = {
  id: number;
  color: string;
  name: string;
  kind: PieceKind;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number; // current sway angle (deg)
  z: number; // stacking order (last-touched on top)
  finish?: MetalFinish; // metal finish (legacy; unused for ABI image discs)
  light?: string; // metal tones
  mid?: string;
  dark?: string;
  texture?: string; // metal/carpet real texture (image url)
  sub?: string; // secondary label (carpet range)
  brandLogo?: string; // carpet brand badge
};

const clamp = (lo: number, v: number, hi: number) =>
  Math.max(lo, Math.min(v, hi));

const label = (k: string) =>
  TAB_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1);

// Cabinetry brand badge: Polytec or Laminex (the default).
const timberLogo = (brand?: string) =>
  brand === "Polytec"
    ? "/images/timber/polytec-logo.svg"
    : "/images/timber/laminex-logo.svg";

export default function VisionBoard({
  tabs = DEFAULT_TABS,
  head = DEFAULT_HEAD,
}: {
  tabs?: VisionTabs;
  head?: VisionHead;
}) {
  // "paint" (Dulux), "metals", "carpet" (Feltex/Redbook), "flooring" (Quick-Step)
  // and "cabinetry" (Laminex timber) are special searchable pickers, always
  // first; the material chip tabs follow.
  const SPECIAL = [
    "paint",
    "tiles",
    "metals",
    "carpet",
    "flooring",
    "cabinetry",
    "styling",
    "benchtops",
  ];
  const materialKeys = TAB_ORDER.filter(
    (k) => !SPECIAL.includes(k) && tabs[k]?.length,
  ).concat(
    Object.keys(tabs).filter((k) => !TAB_ORDER.includes(k) && tabs[k]?.length),
  );
  const tabKeys = [...SPECIAL, ...materialKeys];

  const [activeTab, setActiveTab] = useState("paint");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [query, setQuery] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  // Benchtop surface override (Caesarstone). null = default marble bench.
  const [boardStone, setBoardStone] = useState<{
    name: string;
    url: string;
    urlP: string;
  } | null>(null);
  const [stoneData, setStoneData] = useState<StoneItem[] | null>(null);
  const [stoneQuery, setStoneQuery] = useState("");
  const zTopRef = useRef(10); // rising stack counter (last-touched on top)

  const duluxResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DULUX_COLOURS;
    return DULUX_COLOURS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.collection.toLowerCase().includes(q),
    );
  }, [query]);

  const [metalQuery, setMetalQuery] = useState("");
  // Metals = ABI Interiors finish sample discs (real cut-out photos, fetched JSON;
  // scripts/gen-abi.mjs). Replaced the old CSS-rendered discs/bars 2026-07-10.
  const [abiData, setAbiData] = useState<AbiMetal[] | null>(null);
  useEffect(() => {
    if (activeTab === "metals" && abiData === null) {
      fetch("/data/abi-metals.json")
        .then((r) => r.json())
        .then((d: AbiMetal[]) => setAbiData(d))
        .catch(() => setAbiData([]));
    }
  }, [activeTab, abiData]);
  const metalResults = useMemo(() => {
    const all = abiData ?? [];
    const q = metalQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((m) => m.name.toLowerCase().includes(q));
  }, [abiData, metalQuery]);

  const [carpetQuery, setCarpetQuery] = useState("");
  const [carpetData, setCarpetData] = useState<CarpetSwatchItem[] | null>(null);
  const CARPET_PAGE = 90;
  const [carpetLimit, setCarpetLimit] = useState(CARPET_PAGE);

  // Fetch the carpet catalogue JSON on first open of the Carpet tab. Kept OUT
  // of the JS bundle so it scales to thousands of swatches without slowing the
  // initial page load. (Later this same fetch can point at the OnBase API.)
  useEffect(() => {
    if (activeTab === "carpet" && carpetData === null) {
      fetch("/data/carpet.json")
        .then((r) => r.json())
        .then((d: CarpetSwatchItem[]) => setCarpetData(d))
        .catch(() => setCarpetData([]));
    }
  }, [activeTab, carpetData]);

  const carpetResults = useMemo(() => {
    const all = carpetData ?? [];
    const q = carpetQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.colour.toLowerCase().includes(q) ||
        s.range.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [carpetData, carpetQuery]);

  // Reset the render cap whenever the search changes (search-first + paged
  // rendering: only ~90 tiles in the DOM at once, no matter how big the list).
  useEffect(() => {
    setCarpetLimit(CARPET_PAGE);
  }, [carpetQuery]);

  // Fetch the Caesarstone benchtop catalogue on first open of the Benchtop tab.
  useEffect(() => {
    if (activeTab === "benchtops" && stoneData === null) {
      fetch("/data/stone.json")
        .then((r) => r.json())
        .then((d: StoneItem[]) => setStoneData(d))
        .catch(() => setStoneData([]));
    }
  }, [activeTab, stoneData]);

  const stoneResults = useMemo(() => {
    const all = stoneData ?? [];
    const q = stoneQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    );
  }, [stoneData, stoneQuery]);

  // Cabinetry (Laminex timber). Same scalable JSON-fetch + paged-render pattern
  // as carpet, so it stays out of the JS bundle.
  const [timberQuery, setTimberQuery] = useState("");
  const [timberData, setTimberData] = useState<TimberItem[] | null>(null);
  const TIMBER_PAGE = 60;
  const [timberLimit, setTimberLimit] = useState(TIMBER_PAGE);

  // Cabinetry = Laminex + Polytec. Fetch both catalogues, tag each with its brand
  // (so the board shows the right badge), and merge into one searchable list.
  useEffect(() => {
    if (activeTab === "cabinetry" && timberData === null) {
      Promise.all([
        fetch("/data/timber.json").then((r) => r.json()).catch(() => []),
        fetch("/data/polytec.json").then((r) => r.json()).catch(() => []),
      ])
        .then(([lam, poly]: [TimberItem[], TimberItem[]]) =>
          setTimberData(
            [
              ...lam.map((t) => ({ ...t, brand: t.brand || "Laminex" })),
              ...poly,
            ].sort((a, b) => a.name.localeCompare(b.name)),
          ),
        )
        .catch(() => setTimberData([]));
    }
  }, [activeTab, timberData]);

  const timberResults = useMemo(() => {
    const all = timberData ?? [];
    const q = timberQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.finish.toLowerCase().includes(q) ||
        (t.brand || "").toLowerCase().includes(q),
    );
  }, [timberData, timberQuery]);

  useEffect(() => {
    setTimberLimit(TIMBER_PAGE);
  }, [timberQuery]);

  // Flooring (Quick-Step) - a searchable picker with a Vinyl/Laminate/Timber/
  // Hybrid sub-tab. Same scalable JSON-fetch + paged-render pattern.
  const [floorType, setFloorType] = useState<string>("timber");
  const [floorQuery, setFloorQuery] = useState("");
  const [floorData, setFloorData] = useState<FloorItem[] | null>(null);
  const FLOOR_PAGE = 60;
  const [floorLimit, setFloorLimit] = useState(FLOOR_PAGE);

  useEffect(() => {
    if (activeTab === "flooring" && floorData === null) {
      fetch("/data/flooring.json")
        .then((r) => r.json())
        .then((d: FloorItem[]) => setFloorData(d))
        .catch(() => setFloorData([]));
    }
  }, [activeTab, floorData]);

  // Per-type counts (for sub-tab labels + empty states).
  const floorCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of floorData ?? []) c[f.type] = (c[f.type] || 0) + 1;
    return c;
  }, [floorData]);

  const floorResults = useMemo(() => {
    const all = (floorData ?? []).filter((f) => f.type === floorType);
    const q = floorQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.range.toLowerCase().includes(q),
    );
  }, [floorData, floorType, floorQuery]);

  useEffect(() => {
    setFloorLimit(FLOOR_PAGE);
  }, [floorQuery, floorType]);

  // Styling (Provincial Home Living cutouts) - Cushion / Floral / Decor sub-tabs.
  const [stylingCat, setStylingCat] = useState<string>("Cushion");
  const [stylingQuery, setStylingQuery] = useState("");
  const [stylingData, setStylingData] = useState<StylingItem[] | null>(null);
  useEffect(() => {
    if (activeTab === "styling" && stylingData === null) {
      fetch("/data/styling.json")
        .then((r) => r.json())
        .then((d: StylingItem[]) => setStylingData(d))
        .catch(() => setStylingData([]));
    }
  }, [activeTab, stylingData]);

  const stylingCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of stylingData ?? []) c[s.category] = (c[s.category] || 0) + 1;
    return c;
  }, [stylingData]);

  const stylingResults = useMemo(() => {
    const all = (stylingData ?? []).filter((s) => s.category === stylingCat);
    const q = stylingQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) => s.name.toLowerCase().includes(q));
  }, [stylingData, stylingCat, stylingQuery]);

  // Tiles (GlowTile). Same scalable JSON-fetch + search + paged-render pattern as
  // carpet. NO brand badge is shown for tiles (Reagan's call).
  const [tileQuery, setTileQuery] = useState("");
  const [tileData, setTileData] = useState<TileItem[] | null>(null);
  const TILE_PAGE = 90;
  const [tileLimit, setTileLimit] = useState(TILE_PAGE);

  useEffect(() => {
    if (activeTab === "tiles" && tileData === null) {
      fetch("/data/tiles.json")
        .then((r) => r.json())
        .then((d: TileItem[]) => setTileData(d))
        .catch(() => setTileData([]));
    }
  }, [activeTab, tileData]);

  const tileResults = useMemo(() => {
    const all = tileData ?? [];
    const q = tileQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q),
    );
  }, [tileData, tileQuery]);

  useEffect(() => {
    setTileLimit(TILE_PAGE);
  }, [tileQuery]);

  const boardRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const dropCountRef = useRef(0);
  const dragRef = useRef<{
    id: number;
    grabX: number;
    grabY: number;
    w: number;
    h: number;
  } | null>(null);
  // Physics-sway drag: rAF loop reads the latest pointer + eases position and a
  // velocity-based tilt so pieces lean into the motion, then settle upright.
  const pointerRef = useRef({ x: 0, y: 0 });
  const appliedRef = useRef({ x: 0, y: 0 });
  const velRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const reduceRef = useRef(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [settleId, setSettleId] = useState<number | null>(null);
  // Drag-to-delete bin (bottom-right corner of the board).
  const overBinRef = useRef(false);
  const [binHot, setBinHot] = useState(false);

  // Mobile tuning: bigger board + smaller dropped samples for a practical
  // touch experience. Desktop is left exactly as-is (isMobile = false).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  // Is the CURSOR over the bin drop-zone (bottom-right corner)? Pointer-based so
  // it works for any piece size (a tall paint chip can't push its centre into
  // the corner). The bin lights up as feedback before release.
  const isOverBin = () => {
    const el = boardRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const px = pointerRef.current.x - rect.left;
    const py = pointerRef.current.y - rect.top;
    const zone = BIN_SIZE + BIN_MARGIN + 20; // generous catch area
    return px >= el.clientWidth - zone && py >= el.clientHeight - zone;
  };

  const addPiece = (
    kind: PieceKind,
    name: string,
    opts: {
      color?: string;
      finish?: MetalFinish;
      light?: string;
      mid?: string;
      dark?: string;
      texture?: string;
      sub?: string;
      brandLogo?: string;
      ar?: number; // styling cutout aspect ratio (w/h)
      big?: boolean; // styling: florals sit ~2x larger than cushions
      styleMax?: number; // explicit styling long-edge (overrides big); decor uses this
    },
  ) => {
    const el = boardRef.current;
    const bw = el?.clientWidth ?? 600;
    const bh = el?.clientHeight ?? 480;
    let baseW =
      kind === "paint" || kind === "timber"
        ? PAINT_W
        : kind === "metal"
          ? METAL_W
          : kind === "carpet"
            ? CARPET_W
            : kind === "flooring"
              ? FLOOR_W
              : kind === "tile"
                ? TILE_EDGE
                : kind === "styling"
                  ? STYLE_MAX
                  : PIECE;
    let baseH =
      kind === "paint" || kind === "timber"
        ? PAINT_H
        : kind === "metal"
          ? METAL_H
          : kind === "carpet"
            ? CARPET_H
            : kind === "flooring"
              ? FLOOR_H
              : kind === "tile"
                ? TILE_EDGE
                : kind === "styling"
                  ? STYLE_MAX
                  : PIECE;
    // Styling cutouts keep their natural shape - fit within a box sized by kind
    // (florals + decor ~2x cushions).
    if (kind === "styling" || kind === "render") {
      const sm =
        kind === "render"
          ? RENDER_MAX
          : (opts.styleMax ?? (opts.big ? STYLE_MAX_BIG : STYLE_MAX));
      const ar = opts.ar || 1;
      baseW = ar >= 1 ? sm : Math.round(sm * ar);
      baseH = ar >= 1 ? Math.round(sm / ar) : sm;
    }
    // Drop smaller on mobile so several samples fit + can be arranged.
    const scale = isMobile ? 0.62 : 1;
    const pw = Math.round(baseW * scale);
    const ph = Math.round(baseH * scale);
    const n = dropCountRef.current++;
    const [ox, oy] = DROP_OFFSETS[n % DROP_OFFSETS.length];
    const drift = Math.floor(n / DROP_OFFSETS.length) * 16;
    const x = clamp(0, bw / 2 - pw / 2 + ox + drift, Math.max(0, bw - pw));
    const y = clamp(0, bh / 2 - ph / 2 + oy + drift, Math.max(0, bh - ph));
    setPieces((prev) => [
      ...prev,
      {
        id: idRef.current++,
        name,
        kind,
        w: pw,
        h: ph,
        x,
        y,
        rot: 0,
        z: zTopRef.current++,
        color: opts.color ?? "",
        finish: opts.finish,
        light: opts.light,
        mid: opts.mid,
        dark: opts.dark,
        texture: opts.texture,
        sub: opts.sub,
        brandLogo: opts.brandLogo,
      },
    ]);
  };

  const clearBoard = () => {
    setPieces([]);
    dropCountRef.current = 0;
  };

  // "Imagine my room" - send the board palette to /api/imagine (Cloudflare Flux)
  // and get back a photorealistic room render to drop on the board.
  const [imagineOpen, setImagineOpen] = useState(false);
  const [imgRoom, setImgRoom] = useState(IMAGINE_ROOMS[0]);
  const [imgStyle, setImgStyle] = useState(IMAGINE_STYLES[0]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgResults, setImgResults] = useState<string[]>([]);
  const [imgSelected, setImgSelected] = useState(0);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgPrompt, setImgPrompt] = useState<string | null>(null);
  const [imgNote, setImgNote] = useState("");

  // "Share" - capture the customer's details, then POST the board (finishes +
  // arrangement) to /api/share, which emails a branded Mood Board PDF, files an
  // OnBase customer card + note, and tags them in OnConnect ("Vision Board").
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareForm, setShareForm] = useState({
    name: "",
    phone: "",
    email: "",
    suburb: "",
    postcode: "",
  });

  const generateRoom = async () => {
    setImgLoading(true);
    setImgError(null);
    setImgResults([]);
    setImgPrompt(null);
    try {
      const items: ImagineItem[] = pieces
        .filter((p) => p.kind !== "render")
        .map((p) => ({
          kind: p.kind,
          name: p.name,
          // Only paint's colour is a real selection; for materials leave it blank
          // so the API reads the actual swatch image (fallback colours were
          // blocking that, making all cabinetry/flooring read generic).
          color: p.kind === "paint" ? p.color || undefined : undefined,
          sub: p.sub || undefined,
          url: p.texture || undefined,
        }));
      const res = await fetch("/api/imagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          benchtop: boardStone?.name ?? null,
          benchtopUrl: boardStone?.url ?? undefined,
          room: imgRoom,
          style: imgStyle,
          note: imgNote.trim() || undefined,
          count: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Generation failed.");
      const imgs: string[] =
        (data.images as string[]) || (data.image ? [data.image as string] : []);
      setImgResults(imgs);
      setImgSelected(0);
      setImgPrompt((data.prompt as string) || null);
    } catch (e) {
      setImgError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setImgLoading(false);
    }
  };

  const addRenderToBoard = (dataUrl: string) => {
    const im = new window.Image();
    const drop = (ar: number) => {
      addPiece("render", `${imgStyle} ${imgRoom}`, { texture: dataUrl, ar });
      setImagineOpen(false);
      setImgResults([]);
    };
    im.onload = () => drop(im.naturalWidth / im.naturalHeight || 1.5);
    im.onerror = () => drop(1.5);
    im.src = dataUrl;
  };

  // Shrink a large render data URL (AI images are big) before sending, so the
  // share payload stays well under the request-size limit.
  const downscaleDataUrl = (src: string, maxW = 900): Promise<string> =>
    new Promise((resolve) => {
      const im = new window.Image();
      im.onload = () => {
        const scale = Math.min(1, maxW / (im.naturalWidth || maxW));
        const w = Math.round((im.naturalWidth || maxW) * scale);
        const h = Math.round((im.naturalHeight || maxW) * scale);
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(im, 0, 0, w, h);
        try {
          resolve(cv.toDataURL("image/jpeg", 0.82));
        } catch {
          resolve(src);
        }
      };
      im.onerror = () => resolve(src);
      im.src = src;
    });

  const submitShare = async () => {
    const f = shareForm;
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim()) {
      setShareError("Please add your name, phone and email.");
      return;
    }
    setShareLoading(true);
    setShareError(null);
    try {
      const el = boardRef.current;
      const boardW = el?.clientWidth ?? 900;
      const boardH = el?.clientHeight ?? 560;
      const outPieces = await Promise.all(
        pieces.map(async (p) => {
          let url = p.texture || undefined;
          if (p.kind === "render" && url && url.startsWith("data:")) {
            url = await downscaleDataUrl(url, 900);
          }
          return {
            kind: p.kind,
            name: p.name,
            color: p.color || p.mid || undefined,
            url,
            sub: p.sub || undefined,
            x: p.x,
            y: p.y,
            w: p.w,
            h: p.h,
            z: p.z,
          };
        }),
      );
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: f.name.trim(),
            phone: f.phone.trim(),
            email: f.email.trim(),
            suburb: f.suburb.trim(),
            postcode: f.postcode.trim(),
          },
          board: {
            w: boardW,
            h: boardH,
            stoneName: boardStone?.name ?? null,
            stoneUrl: boardStone?.url ?? null,
          },
          pieces: outPieces,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Something went wrong.");
      setShareDone(true);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setShareLoading(false);
    }
  };

  // Resize a render piece to a S/M/L long-edge (keeps its aspect + centre point).
  const resizeRender = (id: number, edge: number) => {
    const target = edge * (isMobile ? 0.62 : 1);
    const el = boardRef.current;
    const bw = el?.clientWidth ?? 600;
    const bh = el?.clientHeight ?? 480;
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const ar = p.w / p.h || 1;
        const nw = ar >= 1 ? target : Math.round(target * ar);
        const nh = ar >= 1 ? Math.round(target / ar) : target;
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        return {
          ...p,
          w: nw,
          h: nh,
          x: clamp(0, cx - nw / 2, Math.max(0, bw - nw)),
          y: clamp(0, cy - nh / 2, Math.max(0, bh - nh)),
          z: zTopRef.current++,
        };
      }),
    );
  };

  // Per-frame: ease the piece toward the pointer and tilt it by its horizontal
  // velocity (leans into the motion, decays to upright when the pointer stops).
  const step = () => {
    const drag = dragRef.current;
    const el = boardRef.current;
    if (!drag || !el) {
      rafRef.current = null;
      return;
    }
    const rect = el.getBoundingClientRect();
    const tx = clamp(
      0,
      pointerRef.current.x - rect.left - drag.grabX,
      Math.max(0, rect.width - drag.w),
    );
    const ty = clamp(
      0,
      pointerRef.current.y - rect.top - drag.grabY,
      Math.max(0, rect.height - drag.h),
    );
    const dx = tx - appliedRef.current.x;
    velRef.current = velRef.current * 0.78 + dx * 0.22; // smoothed velocity
    const rot = reduceRef.current
      ? 0
      : clamp(-MAX_TILT, velRef.current * TILT_K, MAX_TILT);
    appliedRef.current = { x: tx, y: ty };
    setPieces((prev) =>
      prev.map((p) => (p.id === drag.id ? { ...p, x: tx, y: ty, rot } : p)),
    );
    const over = isOverBin();
    if (over !== overBinRef.current) {
      overBinRef.current = over;
      setBinHot(over);
    }
    rafRef.current = requestAnimationFrame(step);
  };

  const onPieceDown = (e: PointerEvent<HTMLDivElement>, piece: Piece) => {
    e.preventDefault();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: piece.id,
      grabX: e.clientX - rect.left - piece.x,
      grabY: e.clientY - rect.top - piece.y,
      w: piece.w,
      h: piece.h,
    };
    pointerRef.current = { x: e.clientX, y: e.clientY };
    appliedRef.current = { x: piece.x, y: piece.y };
    velRef.current = 0;
    // Bring the touched piece to the top of the stack.
    const newZ = zTopRef.current++;
    setPieces((prev) =>
      prev.map((p) => (p.id === piece.id ? { ...p, z: newZ } : p)),
    );
    setDraggingId(piece.id);
    setSettleId(null);
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(step);
  };

  const onPieceMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    pointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPieceUp = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const drag = dragRef.current;
    if (drag && (overBinRef.current || isOverBin())) {
      // Dropped over the bin -> delete the piece.
      setPieces((prev) => prev.filter((p) => p.id !== drag.id));
    } else if (drag) {
      // Settle upright with a springy transition.
      const id = drag.id;
      setPieces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, rot: 0 } : p)),
      );
      setSettleId(id);
      window.setTimeout(
        () => setSettleId((cur) => (cur === id ? null : cur)),
        600,
      );
    }
    dragRef.current = null;
    overBinRef.current = false;
    setBinHot(false);
    setDraggingId(null);
  };

  // Respect reduced-motion (disables the sway tilt) + cancel rAF on unmount.
  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rail = tabs[activeTab] ?? [];

  return (
    <>
      {/* Vision-board head */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <Reveal>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            {head.eyebrow}
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h3
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(24px,3vw,38px)",
              letterSpacing: "-.02em",
              margin: "10px 0 4px",
            }}
          >
            {head.title}
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 15,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            {head.sub}
          </p>
        </Reveal>
      </div>

      {/* Board */}
      <Reveal delay={0.05}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 901,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: "calc(100% - 28px)",
              gap: 8,
            }}
          >
            {pieces.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setShareOpen(true);
                  setShareDone(false);
                  setShareError(null);
                }}
                style={shareBtnStyle}
              >
                📤 Share
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setImagineOpen(true);
                setImgResults([]);
                setImgError(null);
              }}
              style={imagineBtnStyle}
            >
              ✨ Imagine my room
            </button>
            <button
              type="button"
              onClick={() => setShowLabels((v) => !v)}
              aria-pressed={!showLabels}
              style={boardBtnStyle}
            >
              {showLabels ? "Hide labels" : "Show labels"}
            </button>
            <button type="button" onClick={clearBoard} style={boardBtnStyle}>
              Clear board
            </button>
          </div>

          <div
            ref={boardRef}
            style={{
              position: "relative",
              height: isMobile
                ? "clamp(500px, 74vh, 680px)"
                : "clamp(430px,52vw,560px)",
              borderRadius: 22,
              overflow: "hidden",
              touchAction: "none",
              backgroundColor: "#efece5",
              // Benchtop surface: the selected Caesarstone stone (portrait image
              // on mobile, landscape on desktop), else the default marble.
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.24), rgba(0,0,0,.06)), url(${boardStone ? (isMobile ? boardStone.urlP : boardStone.url) : "/images/colour-board.jpg"})`,
              backgroundSize: "cover, cover",
              backgroundPosition: "center, center",
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,.7), inset 0 -18px 40px rgba(0,0,0,.06), 0 30px 70px rgba(0,0,0,.16)",
              border: "1px solid rgba(0,0,0,.06)",
            }}
          >
            {pieces.length === 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  color: "#9a927f",
                  fontFamily: "monospace",
                  fontSize: 12.5,
                  opacity: 0.6,
                  padding: "0 20px",
                  textAlign: "center",
                }}
              >
                tap a swatch below to drop it on the benchtop
              </div>
            ) : null}

            {/* Drag-to-delete bin (bottom-right). Purely a visual drop-zone;
                the dragged piece holds pointer capture, so pointerEvents:none. */}
            {pieces.length > 0 ? (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: BIN_MARGIN,
                  bottom: BIN_MARGIN,
                  width: BIN_SIZE,
                  height: BIN_SIZE,
                  zIndex: 900,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                  background: binHot
                    ? "rgba(208,106,69,.92)"
                    : "rgba(255,255,255,.82)",
                  border: binHot
                    ? "1px solid rgba(208,106,69,1)"
                    : "1px dashed rgba(32,48,58,.32)",
                  color: binHot ? "#fff" : "#6b7a80",
                  boxShadow: binHot
                    ? "0 12px 26px rgba(208,106,69,.4)"
                    : "0 6px 16px rgba(0,0,0,.1)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  transform: binHot ? "scale(1.12)" : "scale(1)",
                  transition: "all .18s ease",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1z" />
                  <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>
            ) : null}

            {pieces.map((p) => {
              const dragging = p.id === draggingId;
              const settling = p.id === settleId;
              return (
                <div
                  key={p.id}
                  role="img"
                  aria-label={`${p.name} ${p.kind === "paint" ? "paint chip" : "swatch"}, drag to reposition or drag to the bin to remove`}
                  onPointerDown={(e) => onPieceDown(e, p)}
                  onPointerMove={onPieceMove}
                  onPointerUp={onPieceUp}
                  onPointerCancel={onPieceUp}
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: p.w,
                    height: p.h,
                    cursor: dragging ? "grabbing" : "grab",
                    touchAction: "none",
                    zIndex: p.z,
                    transform: `rotate(${p.rot}deg)${dragging ? " scale(1.05)" : ""}`,
                    transformOrigin: "center",
                    transition: settling
                      ? "transform .6s cubic-bezier(.2,1.5,.35,1)"
                      : dragging
                        ? "none"
                        : "transform .25s ease-out",
                    ...(p.kind === "chip"
                      ? {
                          borderRadius: 14,
                          background: p.color,
                          border: "1px solid rgba(0,0,0,.14)",
                          boxShadow:
                            "0 10px 24px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.5)",
                        }
                      : {}),
                  }}
                >
                  {p.kind === "paint" || p.kind === "timber" ? (
                    // Render the chip at its full design size then scale uniformly
                    // to the (smaller, on mobile) piece box, so the punch hole,
                    // brand badge, pill + name all keep their proportions instead
                    // of the fixed-px inner elements ballooning on a shrunk face.
                    <div
                      style={{
                        width: PAINT_W,
                        height: PAINT_H,
                        transform: `scale(${p.w / PAINT_W})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <PaintChipFace
                        name={p.name}
                        hex={p.color}
                        image={p.kind === "timber" ? p.texture : undefined}
                        brandLogo={p.kind === "timber" ? p.brandLogo : undefined}
                        showLabel={showLabels}
                      />
                    </div>
                  ) : p.kind === "metal" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: showLabels ? "flex-start" : "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "1 / 1",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.texture}
                          alt={p.name}
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                            filter: "drop-shadow(0 6px 10px rgba(0,0,0,.34))",
                          }}
                        />
                        {showLabels && p.brandLogo ? (
                          <BrandBadge logo={p.brandLogo} h={11} />
                        ) : null}
                      </div>
                      {showLabels ? (
                        <div
                          style={{
                            background: "#fff",
                            borderRadius: 8,
                            padding: "3px 8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
                            maxWidth: "100%",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#20303a",
                              textAlign: "center",
                              lineHeight: 1.1,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                            }}
                          >
                            {p.name}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : p.kind === "carpet" ? (
                    <CarpetSwatchFace
                      colour={p.name}
                      range={p.sub || ""}
                      url={p.texture || ""}
                      brandLogo={p.brandLogo}
                      showLabel={showLabels}
                    />
                  ) : p.kind === "flooring" ? (
                    <div
                      style={{
                        width: FLOOR_W,
                        height: FLOOR_H,
                        transform: `scale(${p.w / FLOOR_W})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <FloorSwatchFace
                        name={p.name}
                        range={p.sub || ""}
                        url={p.texture || ""}
                        brandLogo={p.brandLogo}
                        showLabel={showLabels}
                      />
                    </div>
                  ) : p.kind === "tile" ? (
                    <div
                      style={{
                        width: TILE_EDGE,
                        height: TILE_EDGE,
                        transform: `scale(${p.w / TILE_EDGE})`,
                        transformOrigin: "top left",
                      }}
                    >
                      {/* Tiles reuse the flooring swatch face with NO brand badge,
                          and squared-off corners (tiles aren't rounded). */}
                      <FloorSwatchFace
                        name={p.name}
                        range={p.sub || ""}
                        url={p.texture || ""}
                        showLabel={showLabels}
                        radius={2}
                      />
                    </div>
                  ) : p.kind === "styling" ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.texture}
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                          filter: "drop-shadow(0 8px 12px rgba(0,0,0,.34))",
                        }}
                      />
                      {showLabels && p.brandLogo ? (
                        <BrandBadge logo={p.brandLogo} h={11} />
                      ) : null}
                    </div>
                  ) : p.kind === "render" ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        padding: 6,
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 14px 30px rgba(0,0,0,.34)",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.texture}
                        alt={p.name}
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: 4,
                        }}
                      />
                      {showLabels ? (
                        <div
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            display: "flex",
                            gap: 2,
                            background: "rgba(255,255,255,.92)",
                            borderRadius: 100,
                            padding: 3,
                            boxShadow: "0 2px 8px rgba(0,0,0,.22)",
                          }}
                        >
                          {RENDER_SIZES.map((sz) => {
                            const active =
                              Math.abs(
                                Math.max(p.w, p.h) - sz.edge * (isMobile ? 0.62 : 1),
                              ) < 40;
                            return (
                              <button
                                key={sz.label}
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resizeRender(p.id, sz.edge);
                                }}
                                aria-label={`Resize room image to ${sz.label === "S" ? "small" : sz.label === "M" ? "medium" : "large"}`}
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: "50%",
                                  border: "none",
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  fontWeight: 700,
                                  fontSize: 11,
                                  lineHeight: 1,
                                  background: active ? "var(--accent)" : "transparent",
                                  color: active ? "#fff" : "#20303a",
                                }}
                              >
                                {sz.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {imagineOpen ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 950,
                borderRadius: 22,
                background: "rgba(18,24,28,.55)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <div
                style={{
                  width: "min(440px, 94%)",
                  maxHeight: "94%",
                  overflowY: "auto",
                  background: "var(--surface)",
                  borderRadius: 16,
                  boxShadow: "0 30px 70px rgba(0,0,0,.45)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-archivo)",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--ink)",
                    }}
                  >
                    ✨ Imagine my room
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagineOpen(false)}
                    aria-label="Close"
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 18,
                      cursor: "pointer",
                      color: "var(--muted)",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {imgResults.length === 0 ? (
                  <>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 13,
                        lineHeight: 1.5,
                        margin: "0 0 14px",
                      }}
                    >
                      Turn your board into a photorealistic room with AI. Pick a
                      room and a style, and we&rsquo;ll imagine it in your palette.
                    </p>
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      <label style={{ flex: 1 }}>
                        <span style={fieldLabelStyle}>Room</span>
                        <select
                          value={imgRoom}
                          onChange={(e) => setImgRoom(e.target.value)}
                          style={selectStyle}
                        >
                          {IMAGINE_ROOMS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={{ flex: 1 }}>
                        <span style={fieldLabelStyle}>Style</span>
                        <select
                          value={imgStyle}
                          onChange={(e) => setImgStyle(e.target.value)}
                          style={selectStyle}
                        >
                          {IMAGINE_STYLES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label style={{ display: "block", marginBottom: 16 }}>
                      <span style={fieldLabelStyle}>Add a note (optional)</span>
                      <input
                        type="text"
                        value={imgNote}
                        onChange={(e) => setImgNote(e.target.value)}
                        placeholder="e.g. large windows, brighter, add an island"
                        maxLength={200}
                        style={{ ...selectStyle, cursor: "text" }}
                      />
                    </label>
                    {imgError ? (
                      <div
                        style={{
                          color: "#c0392b",
                          fontSize: 13,
                          marginBottom: 12,
                          textAlign: "center",
                        }}
                      >
                        {imgError}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={generateRoom}
                      disabled={imgLoading}
                      style={{ ...primaryBtnStyle, opacity: imgLoading ? 0.7 : 1 }}
                    >
                      {imgLoading ? "Painting your room…" : "Generate room"}
                    </button>
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--muted)",
                        fontSize: 11.5,
                        margin: "10px 0 0",
                      }}
                    >
                      {imgLoading
                        ? "This takes a few seconds…"
                        : "AI render is a styling guide, not exact products."}
                    </p>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgResults[imgSelected]}
                      alt="Your imagined room"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        display: "block",
                        boxShadow: "0 10px 24px rgba(0,0,0,.22)",
                      }}
                    />
                    {imgResults.length > 1 ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        {imgResults.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setImgSelected(i)}
                            aria-label={`Option ${i + 1}`}
                            style={{
                              flex: 1,
                              padding: 0,
                              border:
                                i === imgSelected
                                  ? "2px solid var(--accent)"
                                  : "2px solid transparent",
                              borderRadius: 8,
                              overflow: "hidden",
                              cursor: "pointer",
                              background: "transparent",
                              lineHeight: 0,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt=""
                              style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--muted)",
                        fontSize: 11.5,
                        margin: "10px 0 0",
                      }}
                    >
                      {imgResults.length > 1
                        ? "Tap an option, then add your favourite to the board."
                        : "Add it to your board, or regenerate for another look."}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => addRenderToBoard(imgResults[imgSelected])}
                        style={{ ...primaryBtnStyle, flex: 1, minWidth: 130 }}
                      >
                        Add to board
                      </button>
                      <button
                        type="button"
                        onClick={generateRoom}
                        disabled={imgLoading}
                        style={boardBtnStyle}
                      >
                        {imgLoading ? "…" : "Regenerate"}
                      </button>
                      <a
                        href={imgResults[imgSelected]}
                        download="onwood-room.jpg"
                        style={{
                          ...boardBtnStyle,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Download
                      </a>
                    </div>
                    {imgPrompt ? (
                      <details style={{ marginTop: 12 }}>
                        <summary
                          style={{
                            cursor: "pointer",
                            fontSize: 12,
                            color: "var(--muted)",
                            fontWeight: 700,
                          }}
                        >
                          What your board sent to the AI
                        </summary>
                        <p
                          style={{
                            fontSize: 11.5,
                            color: "var(--muted)",
                            lineHeight: 1.5,
                            marginTop: 8,
                            maxHeight: 130,
                            overflowY: "auto",
                          }}
                        >
                          {imgPrompt}
                        </p>
                      </details>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ) : null}

          {shareOpen ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 950,
                borderRadius: 22,
                background: "rgba(18,24,28,.55)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <div
                style={{
                  width: "min(440px, 94%)",
                  maxHeight: "94%",
                  overflowY: "auto",
                  background: "var(--surface)",
                  borderRadius: 16,
                  boxShadow: "0 30px 70px rgba(0,0,0,.45)",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-archivo)",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--ink)",
                    }}
                  >
                    📤 Share your board
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareOpen(false)}
                    aria-label="Close"
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 18,
                      cursor: "pointer",
                      color: "var(--muted)",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {shareDone ? (
                  <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                    <p
                      style={{
                        color: "var(--ink)",
                        fontSize: 15,
                        fontWeight: 700,
                        margin: "0 0 6px",
                      }}
                    >
                      Your vision board is on its way.
                    </p>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        margin: "0 0 16px",
                      }}
                    >
                      We&rsquo;ve emailed a copy to{" "}
                      <strong>{shareForm.email}</strong>, and our team will be in
                      touch soon. Check your inbox (and spam, just in case).
                    </p>
                    <button
                      type="button"
                      onClick={() => setShareOpen(false)}
                      style={primaryBtnStyle}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 13,
                        lineHeight: 1.5,
                        margin: "0 0 14px",
                      }}
                    >
                      We&rsquo;ll email you a polished PDF of your vision board with
                      the finishes you chose, and our team can help you make it
                      real.
                    </p>
                    <label style={{ display: "block", marginBottom: 10 }}>
                      <span style={fieldLabelStyle}>Full name</span>
                      <input
                        type="text"
                        value={shareForm.name}
                        onChange={(e) =>
                          setShareForm((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Jane Smith"
                        autoComplete="name"
                        style={{ ...selectStyle, cursor: "text" }}
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: 10 }}>
                      <span style={fieldLabelStyle}>Phone</span>
                      <input
                        type="tel"
                        value={shareForm.phone}
                        onChange={(e) =>
                          setShareForm((s) => ({ ...s, phone: e.target.value }))
                        }
                        placeholder="0400 000 000"
                        autoComplete="tel"
                        style={{ ...selectStyle, cursor: "text" }}
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: 10 }}>
                      <span style={fieldLabelStyle}>Email</span>
                      <input
                        type="email"
                        value={shareForm.email}
                        onChange={(e) =>
                          setShareForm((s) => ({ ...s, email: e.target.value }))
                        }
                        placeholder="jane@email.com"
                        autoComplete="email"
                        style={{ ...selectStyle, cursor: "text" }}
                      />
                    </label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      <label style={{ flex: 2 }}>
                        <span style={fieldLabelStyle}>Suburb</span>
                        <input
                          type="text"
                          value={shareForm.suburb}
                          onChange={(e) =>
                            setShareForm((s) => ({
                              ...s,
                              suburb: e.target.value,
                            }))
                          }
                          placeholder="Baringa"
                          autoComplete="address-level2"
                          style={{ ...selectStyle, cursor: "text" }}
                        />
                      </label>
                      <label style={{ flex: 1 }}>
                        <span style={fieldLabelStyle}>Postcode</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={shareForm.postcode}
                          onChange={(e) =>
                            setShareForm((s) => ({
                              ...s,
                              postcode: e.target.value,
                            }))
                          }
                          placeholder="4551"
                          autoComplete="postal-code"
                          style={{ ...selectStyle, cursor: "text" }}
                        />
                      </label>
                    </div>
                    {shareError ? (
                      <div
                        style={{
                          color: "#c0392b",
                          fontSize: 13,
                          marginBottom: 12,
                          textAlign: "center",
                        }}
                      >
                        {shareError}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={submitShare}
                      disabled={shareLoading}
                      style={{
                        ...primaryBtnStyle,
                        opacity: shareLoading ? 0.7 : 1,
                        cursor: shareLoading ? "default" : "pointer",
                      }}
                    >
                      {shareLoading
                        ? "Sending your board..."
                        : "Email me my vision board"}
                    </button>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 11,
                        lineHeight: 1.5,
                        margin: "10px 0 0",
                        textAlign: "center",
                      }}
                    >
                      We&rsquo;ll only use your details to send your board and
                      follow up. No spam.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Reveal>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          margin: "22px 0 14px",
        }}
      >
        {tabKeys.map((key) => {
          const active = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "10px 18px",
                borderRadius: 100,
                border: `1.5px solid ${active ? "var(--accent)" : "var(--line)"}`,
                background: active ? "rgba(208,106,69,.08)" : "var(--surface)",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                color: active ? "var(--accent)" : "var(--ink)",
              }}
            >
              {label(key)}
            </button>
          );
        })}
      </div>

      {/* Active rail */}
      <div>
        {activeTab === "paint" ? (
          <div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Dulux colours (e.g. Natural White, Colorbond)"
                aria-label="Search Dulux colours"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            {/* Results grid (scrollable) */}
            <div
              role="group"
              aria-label="Dulux colours"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                gap: 12,
                maxHeight: 300,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {duluxResults.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => addPiece("paint", c.name, { color: c.hex })}
                  aria-label={`Add ${c.name} to the board`}
                  title={`${c.name} - ${c.collection}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 10,
                      background: c.hex,
                      border: "1px solid rgba(0,0,0,.12)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,.4), 0 3px 10px rgba(0,0,0,.1)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--ink)",
                      lineHeight: 1.15,
                      textAlign: "center",
                    }}
                  >
                    {c.name}
                  </span>
                </button>
              ))}
              {duluxResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No colours match &ldquo;{query}&rdquo;.
                </div>
              ) : null}
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {duluxResults.length} Dulux &amp; Colorbond colours. Screen colours
              are a guide only, see a physical sample in-store for a true match.
            </p>
          </div>
        ) : activeTab === "metals" ? (
          <div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={metalQuery}
                onChange={(e) => setMetalQuery(e.target.value)}
                placeholder="Search ABI finishes (e.g. brass, antique, matte black)"
                aria-label="Search ABI metal finishes"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="ABI metal finishes"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 16,
                maxHeight: 320,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {abiData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading ABI finishes...
                </div>
              ) : (
                metalResults.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() =>
                      addPiece("metal", m.name, {
                        texture: m.url,
                        brandLogo: ABI_LOGO,
                      })
                    }
                    aria-label={`Add ${m.name} to the board`}
                    title={`${m.name} (ABI Interiors)`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        display: "block",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,.28))",
                        }}
                      />
                      <BrandBadge logo={ABI_LOGO} h={9} />
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.15,
                        textAlign: "center",
                      }}
                    >
                      {m.name}
                    </span>
                  </button>
                ))
              )}
              {abiData !== null && metalResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No finishes match &ldquo;{metalQuery}&rdquo;.
                </div>
              ) : null}
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {abiData === null
                ? ""
                : `${metalResults.length} ABI Interiors finishes for tapware, handles & hardware. Colours are a guide only.`}
            </p>
          </div>
        ) : activeTab === "tiles" ? (
          <div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={tileQuery}
                onChange={(e) => setTileQuery(e.target.value)}
                placeholder="Search GlowTile tiles (name or collection, e.g. Carrara)"
                aria-label="Search GlowTile tiles"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="GlowTile tiles"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
                gap: 14,
                maxHeight: 340,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {tileData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading tiles...
                </div>
              ) : (
                tileResults.slice(0, tileLimit).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      addPiece("tile", t.name, { texture: t.url, sub: t.type })
                    }
                    aria-label={`Add ${t.name}${t.type ? ` (${t.type})` : ""} to the board`}
                    title={t.type ? `${t.name} - ${t.type}` : t.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,.14)",
                        boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                        background: "#efece5",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.1,
                        textAlign: "center",
                      }}
                    >
                      {t.name}
                      {t.type ? (
                        <span
                          style={{
                            display: "block",
                            fontSize: 9,
                            fontWeight: 500,
                            color: "var(--muted)",
                          }}
                        >
                          {t.type}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))
              )}
              {tileData !== null && tileResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No tiles match &ldquo;{tileQuery}&rdquo;.
                </div>
              ) : null}
            </div>
            {tileResults.length > tileLimit ? (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setTileLimit((n) => n + TILE_PAGE)}
                  style={boardBtnStyle}
                >
                  Load more ({tileResults.length - tileLimit} more)
                </button>
              </div>
            ) : null}
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {tileData === null
                ? ""
                : `${tileResults.length} tiles from GlowTile. Swatches are a guide only.`}
            </p>
          </div>
        ) : activeTab === "carpet" ? (
          <div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={carpetQuery}
                onChange={(e) => setCarpetQuery(e.target.value)}
                placeholder="Search Feltex carpet (colour or range, e.g. Spinifex)"
                aria-label="Search Feltex carpet"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="Carpet colours"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                gap: 14,
                maxHeight: 340,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {carpetData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading carpet colours...
                </div>
              ) : (
                carpetResults.slice(0, carpetLimit).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      addPiece("carpet", s.colour, {
                        texture: s.url,
                        sub: s.range,
                        brandLogo: s.brandLogo,
                      })
                    }
                    aria-label={`Add ${s.colour} (${s.range}, ${s.brand}) to the board`}
                    title={`${s.colour} - ${s.range} (${s.brand})`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        borderRadius: 9,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,.14)",
                        boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                        background: "#efece5",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      {s.brandLogo ? (
                        <BrandBadge logo={s.brandLogo} h={9} />
                      ) : null}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.1,
                        textAlign: "center",
                      }}
                    >
                      {s.colour}
                      <span
                        style={{
                          display: "block",
                          fontSize: 9,
                          fontWeight: 500,
                          color: "var(--muted)",
                        }}
                      >
                        {s.range}
                      </span>
                    </span>
                  </button>
                ))
              )}
              {carpetData !== null && carpetResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No carpet matches &ldquo;{carpetQuery}&rdquo;.
                </div>
              ) : null}
            </div>
            {carpetResults.length > carpetLimit ? (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setCarpetLimit((n) => n + CARPET_PAGE)}
                  style={boardBtnStyle}
                >
                  Load more ({carpetResults.length - carpetLimit} more)
                </button>
              </div>
            ) : null}
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {carpetData === null
                ? ""
                : `${carpetResults.length} carpet colours across ${new Set(carpetResults.map((s) => s.range)).size} ranges. Swatches are a guide only.`}
            </p>
          </div>
        ) : activeTab === "flooring" ? (
          <div>
            {/* Flooring type sub-tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {FLOOR_TYPES.map((t) => {
                const active = t === floorType;
                const count = floorCounts[t] || 0;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFloorType(t)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--line)"}`,
                      background: active ? "var(--accent)" : "var(--surface)",
                      color: active ? "#fff" : "var(--ink)",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {label(t)}
                    {floorData && count ? ` (${count})` : ""}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={floorQuery}
                onChange={(e) => setFloorQuery(e.target.value)}
                placeholder={`Search ${floorType} flooring (name or range)`}
                aria-label="Search Quick-Step flooring"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="Quick-Step flooring"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
                gap: 14,
                maxHeight: 360,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {floorData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading flooring...
                </div>
              ) : floorResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  {floorCounts[floorType]
                    ? `No ${floorType} flooring matches “${floorQuery}”.`
                    : `${label(floorType)} ranges coming soon.`}
                </div>
              ) : (
                floorResults.slice(0, floorLimit).map((f) => (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() =>
                      addPiece("flooring", f.name, {
                        texture: f.url,
                        sub: f.range,
                        brandLogo: "/images/flooring/quickstep-logo.svg",
                        color: "#cbb79a",
                      })
                    }
                    aria-label={`Add ${f.name} to the board`}
                    title={`${f.name} - ${f.range} (Quick-Step ${label(f.type)})`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        borderRadius: 9,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,.14)",
                        boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                        background: "#e7ddcd",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1.1)",
                          display: "block",
                        }}
                      />
                      <BrandBadge
                        logo="/images/flooring/quickstep-logo.svg"
                        h={9}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.1,
                        textAlign: "center",
                      }}
                    >
                      {f.name}
                      <span
                        style={{
                          display: "block",
                          fontSize: 9,
                          fontWeight: 500,
                          color: "var(--muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {f.range}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
            {floorResults.length > floorLimit ? (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setFloorLimit((n) => n + FLOOR_PAGE)}
                  style={boardBtnStyle}
                >
                  Load more ({floorResults.length - floorLimit} more)
                </button>
              </div>
            ) : null}
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {floorData === null
                ? ""
                : `${floorResults.length} Quick-Step ${floorType} floor${floorResults.length === 1 ? "" : "s"}. Colours are a guide only, see a sample in-store.`}
            </p>
          </div>
        ) : activeTab === "cabinetry" ? (
          <div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={timberQuery}
                onChange={(e) => setTimberQuery(e.target.value)}
                placeholder="Search Laminex + Polytec (e.g. Oak, Walnut, Black, Stone)"
                aria-label="Search Laminex and Polytec cabinetry decors"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="Laminex and Polytec cabinetry decors"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                gap: 14,
                maxHeight: 340,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {timberData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading timber decors...
                </div>
              ) : (
                timberResults.slice(0, timberLimit).map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() =>
                      addPiece("timber", t.name, {
                        texture: t.url,
                        sub: t.finish,
                        color: t.brand === "Polytec" ? "#c9c2b4" : "#a88a5f",
                        brandLogo: timberLogo(t.brand),
                      })
                    }
                    aria-label={`Add ${t.name} to the board`}
                    title={`${t.name}${t.finish ? ` - ${t.finish}` : ""} (${t.brand || "Laminex"})`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        borderRadius: 9,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,.14)",
                        boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                        background: "#e7ddcd",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <BrandBadge logo={timberLogo(t.brand)} h={9} />
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.1,
                        textAlign: "center",
                      }}
                    >
                      {t.name}
                      <span
                        style={{
                          display: "block",
                          fontSize: 9,
                          fontWeight: 500,
                          color: "var(--muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.finish || t.brand || "Laminex"}
                      </span>
                    </span>
                  </button>
                ))
              )}
              {timberData !== null && timberResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No timber matches &ldquo;{timberQuery}&rdquo;.
                </div>
              ) : null}
            </div>
            {timberResults.length > timberLimit ? (
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setTimberLimit((n) => n + TIMBER_PAGE)}
                  style={boardBtnStyle}
                >
                  Load more ({timberResults.length - timberLimit} more)
                </button>
              </div>
            ) : null}
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {timberData === null
                ? ""
                : `${timberResults.length} cabinetry decors from Laminex + Polytec (doors, panels & joinery). Swatches are a guide only.`}
            </p>
          </div>
        ) : activeTab === "styling" ? (
          <div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12.5,
                margin: "0 auto 12px",
                maxWidth: 520,
              }}
            >
              Style your board with cushions, florals and decor - product cut-outs
              from Provincial Home Living, for colour and mood.
            </p>
            {/* Category sub-tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {STYLING_CATS.map((cat) => {
                const active = cat === stylingCat;
                const count = stylingCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStylingCat(cat)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--line)"}`,
                      background: active ? "var(--accent)" : "var(--surface)",
                      color: active ? "#fff" : "var(--ink)",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                    {stylingData && count ? ` (${count})` : ""}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={stylingQuery}
                onChange={(e) => setStylingQuery(e.target.value)}
                placeholder={`Search ${stylingCat.toLowerCase()}s`}
                aria-label="Search styling pieces"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="Styling pieces"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
                gap: 14,
                maxHeight: 360,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {stylingData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading styling pieces...
                </div>
              ) : stylingResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No {stylingCat.toLowerCase()} pieces match &ldquo;{stylingQuery}
                  &rdquo;.
                </div>
              ) : (
                stylingResults.map((s) => (
                  <button
                    key={s.url}
                    type="button"
                    onClick={() =>
                      addPiece("styling", s.name, {
                        texture: s.url,
                        ar: s.ar,
                        brandLogo: "/images/styling/phl-logo.png",
                        styleMax:
                          s.category === "Floral"
                            ? STYLE_MAX_BIG
                            : s.category === "Decor"
                              ? STYLE_MAX_DECOR
                              : STYLE_MAX,
                      })
                    }
                    aria-label={`Add ${s.name} to the board`}
                    title={`${s.name} (Provincial Home Living)`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,.10)",
                        boxShadow: "0 3px 10px rgba(0,0,0,.12)",
                        background: "linear-gradient(160deg,#f6f3ec,#e9e4d9)",
                        display: "grid",
                        placeItems: "center",
                        padding: 8,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          display: "block",
                          filter: "drop-shadow(0 4px 6px rgba(0,0,0,.22))",
                        }}
                      />
                      <BrandBadge logo="/images/styling/phl-logo.png" h={8} />
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.1,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {s.name}
                    </span>
                  </button>
                ))
              )}
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {stylingData === null
                ? ""
                : `${stylingResults.length} ${stylingCat.toLowerCase()} piece${stylingResults.length === 1 ? "" : "s"} from Provincial Home Living. Styling ideas only.`}
            </p>
          </div>
        ) : activeTab === "benchtops" ? (
          <div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12.5,
                margin: "0 auto 12px",
                maxWidth: 520,
              }}
            >
              Pick a Caesarstone surface to lay your samples on - it replaces the
              benchtop behind your board.
            </p>
            {/* Search */}
            <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
              <input
                type="search"
                value={stoneQuery}
                onChange={(e) => setStoneQuery(e.target.value)}
                placeholder="Search Caesarstone (name or code, e.g. Calacatta)"
                aria-label="Search Caesarstone benchtops"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 100,
                  border: "1.5px solid var(--line)",
                  background: "var(--surface)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div
              role="group"
              aria-label="Benchtop stones"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
                gap: 14,
                maxHeight: 340,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {/* Default marble reset (only when not searching) */}
              {stoneQuery.trim() === "" ? (
                <button
                  type="button"
                  onClick={() => setBoardStone(null)}
                  aria-pressed={boardStone === null}
                  title="Default marble bench"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      borderRadius: 9,
                      backgroundImage: "url(/images/colour-board.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border:
                        boardStone === null
                          ? "2px solid var(--accent)"
                          : "1px solid rgba(0,0,0,.14)",
                      boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "var(--ink)",
                      textAlign: "center",
                    }}
                  >
                    Default marble
                  </span>
                </button>
              ) : null}

              {stoneData === null ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  Loading benchtops...
                </div>
              ) : (
                stoneResults.map((s) => {
                  const active = boardStone?.url === s.url;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() =>
                        setBoardStone({
                          name: s.name,
                          url: s.url,
                          urlP: s.urlP,
                        })
                      }
                      aria-pressed={active}
                      title={`${s.code} ${s.name}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        padding: 0,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{
                          width: "100%",
                          aspectRatio: "16 / 10",
                          borderRadius: 9,
                          overflow: "hidden",
                          border: active
                            ? "2px solid var(--accent)"
                            : "1px solid rgba(0,0,0,.14)",
                          boxShadow: "0 3px 10px rgba(0,0,0,.14)",
                          background: "#efece5",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "var(--ink)",
                          lineHeight: 1.1,
                          textAlign: "center",
                        }}
                      >
                        {s.name}
                        <span
                          style={{
                            display: "block",
                            fontSize: 9,
                            fontWeight: 500,
                            color: "var(--muted)",
                          }}
                        >
                          Caesarstone {s.code}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
              {stoneData !== null && stoneResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No stone matches &ldquo;{stoneQuery}&rdquo;.
                </div>
              ) : null}
            </div>
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
                margin: "12px auto 0",
                maxWidth: 560,
              }}
            >
              {stoneData === null
                ? ""
                : `${stoneResults.length} Caesarstone colours. Colours are a guide only.`}
            </p>
          </div>
        ) : (
          <div
            role="group"
            aria-label={`${label(activeTab)} swatches`}
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "8px 2px 12px",
            }}
          >
            {rail.map((sw) => (
              <button
                key={sw.name}
                type="button"
                onClick={() => addPiece("chip", sw.name, { color: sw.color })}
                aria-label={`Add ${sw.name} to the board`}
                style={chipStyle}
              >
                <span
                  aria-hidden
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: sw.color,
                    border: "1px solid rgba(0,0,0,.1)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,.4), 0 4px 12px rgba(0,0,0,.12)",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sw.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const boardBtnStyle: CSSProperties = {
  background: "rgba(255,255,255,.85)",
  border: "1px solid rgba(0,0,0,.08)",
  color: "#20303A",
  fontWeight: 700,
  fontSize: 12.5,
  padding: "8px 14px",
  borderRadius: 100,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  boxShadow: "0 6px 16px rgba(0,0,0,.1)",
  fontFamily: "inherit",
};

const chipStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  minWidth: 76,
  padding: 10,
  borderRadius: 16,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  cursor: "pointer",
  fontFamily: "inherit",
};

const imagineBtnStyle: CSSProperties = {
  background: "var(--accent)",
  border: "1px solid var(--accent)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 12.5,
  padding: "8px 14px",
  borderRadius: 100,
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(208,106,69,.35)",
  fontFamily: "inherit",
};

const shareBtnStyle: CSSProperties = {
  background: "#20303a",
  border: "1px solid #20303a",
  color: "#fff",
  fontWeight: 700,
  fontSize: 12.5,
  padding: "8px 14px",
  borderRadius: 100,
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(0,0,0,.22)",
  fontFamily: "inherit",
};

const primaryBtnStyle: CSSProperties = {
  width: "100%",
  background: "var(--accent)",
  border: "none",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14.5,
  padding: "12px 18px",
  borderRadius: 100,
  cursor: "pointer",
  fontFamily: "inherit",
};

const selectStyle: CSSProperties = {
  width: "100%",
  marginTop: 5,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1.5px solid var(--line)",
  background: "var(--surface)",
  fontFamily: "inherit",
  fontSize: 14,
  color: "var(--ink)",
  cursor: "pointer",
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: ".08em",
};
