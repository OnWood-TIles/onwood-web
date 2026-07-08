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
import { MetalDiscFace, metalDiscStyle } from "./MetalDisc";
import { CarpetSwatchFace, BrandBadge } from "./CarpetSwatch";
import { DULUX_COLOURS } from "../../../lib/dulux";
import { METALS, type MetalFinish } from "../../../lib/metals";
import type { CarpetSwatchItem } from "../../../lib/carpet";

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
const DEFAULT_TABS: VisionTabs = {
  woodlook: [
    { name: "Coastal Oak", color: "#C8894B" },
    { name: "Smoked Oak", color: "#7A4A28" },
    { name: "Pale Ash", color: "#d3cabb" },
    { name: "Blackbutt", color: "#a89372" },
  ],
  tiles: [
    { name: "Zellige", color: "#3f97a6" },
    { name: "Terracotta", color: "#c15a30" },
    { name: "Carrara", color: "#efe9e0" },
    { name: "Travertine", color: "#d8c8ac" },
    { name: "Limestone", color: "#efece5" },
  ],
  benchtops: [
    { name: "Calacatta", color: "#f4f1ea" },
    { name: "Pietra Grey", color: "#4a4d52" },
    { name: "Cloudburst", color: "#6b7178" },
    { name: "Raw Concrete", color: "#b8b2a6" },
  ],
  decor: [
    { name: "Olive", color: "#6b7a3f" },
    { name: "Rattan", color: "#c9a36b" },
    { name: "Brass", color: "#b98e42" },
    { name: "Linen", color: "#e7e1d6" },
  ],
};

const DEFAULT_HEAD: VisionHead = {
  eyebrow: "Vision board",
  title: "Build the look on a Caesarstone benchtop.",
  sub: "Pick paint, wood-look, tiles, benchtops and a little decor from the tabs, then drag each piece to arrange your board.",
};

const TAB_ORDER = ["paint", "woodlook", "tiles", "benchtops", "decor"];

// Pretty tab labels for keys that don't title-case cleanly.
const TAB_LABELS: Record<string, string> = {
  woodlook: "Wood-look",
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

const PIECE = 64; // material chip (square)
const PAINT_W = 120; // Dulux paint chip
const PAINT_H = 168;
const METAL_W = 104; // circular metal disc + label
const METAL_H = 132;
const CARPET_W = 210; // carpet swatch + label (~2x)
const CARPET_H = 262;
const BIN_SIZE = 58;
const BIN_MARGIN = 14;
const MAX_TILT = 15; // max sway angle (deg)
const TILT_K = 0.7; // velocity -> tilt gain

type PieceKind = "chip" | "paint" | "metal" | "carpet";
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
  finish?: MetalFinish; // metal finish
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

export default function VisionBoard({
  tabs = DEFAULT_TABS,
  head = DEFAULT_HEAD,
}: {
  tabs?: VisionTabs;
  head?: VisionHead;
}) {
  // "paint" (Dulux), "metals" and "carpet" (Feltex) are special searchable
  // pickers, always first; the material chip tabs follow.
  const SPECIAL = ["paint", "metals", "carpet"];
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
  const metalResults = useMemo(() => {
    const q = metalQuery.trim().toLowerCase();
    if (!q) return METALS;
    return METALS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.finish.toLowerCase().includes(q),
    );
  }, [metalQuery]);

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
    },
  ) => {
    const el = boardRef.current;
    const bw = el?.clientWidth ?? 600;
    const bh = el?.clientHeight ?? 480;
    const baseW =
      kind === "paint"
        ? PAINT_W
        : kind === "metal"
          ? METAL_W
          : kind === "carpet"
            ? CARPET_W
            : PIECE;
    const baseH =
      kind === "paint"
        ? PAINT_H
        : kind === "metal"
          ? METAL_H
          : kind === "carpet"
            ? CARPET_H
            : PIECE;
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
              gap: 8,
            }}
          >
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
              // Real Calacatta marble benchtop; soft top highlight + edge shade
              // for depth so it reads as a physical slab.
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,.28), rgba(0,0,0,.05)), url(/images/colour-board.jpg)",
              backgroundSize: "auto, cover",
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
                  {p.kind === "paint" ? (
                    <PaintChipFace
                      name={p.name}
                      hex={p.color}
                      showLabel={showLabels}
                    />
                  ) : p.kind === "metal" ? (
                    <MetalDiscFace
                      name={p.name}
                      finish={p.finish!}
                      light={p.light!}
                      mid={p.mid!}
                      dark={p.dark!}
                      texture={p.texture}
                      showLabel={showLabels}
                    />
                  ) : p.kind === "carpet" ? (
                    <CarpetSwatchFace
                      colour={p.name}
                      range={p.sub || ""}
                      url={p.texture || ""}
                      brandLogo={p.brandLogo}
                      showLabel={showLabels}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
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
                placeholder="Search metals (e.g. brass, brushed, antique)"
                aria-label="Search metal finishes"
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
              aria-label="Metal finishes"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
                gap: 16,
                maxHeight: 300,
                overflowY: "auto",
                padding: "6px 4px 10px",
              }}
            >
              {metalResults.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() =>
                    addPiece("metal", m.name, {
                      finish: m.finish,
                      light: m.light,
                      mid: m.mid,
                      dark: m.dark,
                      texture: m.texture,
                    })
                  }
                  aria-label={`Add ${m.name} to the board`}
                  title={`${m.name} - ${m.finish}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 7,
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
                      ...metalDiscStyle(
                        m.finish,
                        m.light,
                        m.mid,
                        m.dark,
                        m.texture,
                      ),
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
                    {m.name}
                  </span>
                </button>
              ))}
              {metalResults.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "24px 0",
                  }}
                >
                  No metals match &ldquo;{metalQuery}&rdquo;.
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
              {metalResults.length} finishes for tapware, handles, lighting &amp;
              hardware. Screen colours are a guide only.
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
