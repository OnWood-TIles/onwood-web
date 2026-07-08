"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Reveal from "../ui/Reveal";

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
const DEFAULT_TABS: VisionTabs = {
  paint: [
    { name: "Chalk", color: "#efece5" },
    { name: "Clay", color: "#c57b4c" },
    { name: "Ink", color: "#20303a" },
    { name: "Sea", color: "#1e7a8c" },
    { name: "Sand", color: "#d8c8ac" },
    { name: "Terracotta", color: "#d06a45" },
  ],
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
const TAB_LABELS: Record<string, string> = { woodlook: "Wood-look" };

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

const PIECE = 64;

type Piece = { id: number; color: string; name: string; x: number; y: number };

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
  const tabKeys = TAB_ORDER.filter((k) => tabs[k]?.length).concat(
    Object.keys(tabs).filter((k) => !TAB_ORDER.includes(k) && tabs[k]?.length),
  );

  const [activeTab, setActiveTab] = useState(tabKeys[0] ?? "paint");
  const [pieces, setPieces] = useState<Piece[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const dropCountRef = useRef(0);
  const dragRef = useRef<{ id: number; grabX: number; grabY: number } | null>(
    null,
  );

  const addPiece = (sw: VisionSwatch) => {
    const el = boardRef.current;
    const w = el?.clientWidth ?? 600;
    const h = el?.clientHeight ?? 480;
    const n = dropCountRef.current++;
    const [ox, oy] = DROP_OFFSETS[n % DROP_OFFSETS.length];
    const drift = Math.floor(n / DROP_OFFSETS.length) * 16;
    const x = clamp(0, w / 2 - PIECE / 2 + ox + drift, Math.max(0, w - PIECE));
    const y = clamp(0, h / 2 - PIECE / 2 + oy + drift, Math.max(0, h - PIECE));
    setPieces((prev) => [
      ...prev,
      { id: idRef.current++, color: sw.color, name: sw.name, x, y },
    ]);
  };

  const clearBoard = () => {
    setPieces([]);
    dropCountRef.current = 0;
  };

  const onPieceDown = (e: PointerEvent<HTMLDivElement>, piece: Piece) => {
    e.preventDefault();
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: piece.id,
      grabX: e.clientX - board.left - piece.x,
      grabY: e.clientY - board.top - piece.y,
    };
  };

  const onPieceMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const board = boardRef.current?.getBoundingClientRect();
    if (!drag || !board) return;
    const nx = clamp(
      0,
      e.clientX - board.left - drag.grabX,
      Math.max(0, board.width - PIECE),
    );
    const ny = clamp(
      0,
      e.clientY - board.top - drag.grabY,
      Math.max(0, board.height - PIECE),
    );
    setPieces((prev) =>
      prev.map((p) => (p.id === drag.id ? { ...p, x: nx, y: ny } : p)),
    );
  };

  const onPieceUp = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    dragRef.current = null;
  };

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
          <button
            type="button"
            onClick={clearBoard}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 6,
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
            }}
          >
            Clear board
          </button>

          <div
            ref={boardRef}
            style={{
              position: "relative",
              height: "clamp(430px,52vw,560px)",
              borderRadius: 22,
              overflow: "hidden",
              touchAction: "none",
              backgroundColor: "#efece5",
              backgroundImage:
                "radial-gradient(rgba(120,110,95,.11) 1px, transparent 1.6px), linear-gradient(118deg, transparent 43%, rgba(150,140,120,.16) 46%, transparent 49%), linear-gradient(127deg, transparent 61%, rgba(110,110,110,.11) 63%, transparent 67%), linear-gradient(180deg, rgba(255,255,255,.55), rgba(0,0,0,.035))",
              backgroundSize: "8px 8px, auto, auto, auto",
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

            {pieces.map((p) => (
              <div
                key={p.id}
                role="img"
                aria-label={`${p.name} swatch, drag to reposition`}
                onPointerDown={(e) => onPieceDown(e, p)}
                onPointerMove={onPieceMove}
                onPointerUp={onPieceUp}
                onPointerCancel={onPieceUp}
                style={{
                  position: "absolute",
                  left: p.x,
                  top: p.y,
                  width: PIECE,
                  height: PIECE,
                  borderRadius: 14,
                  background: p.color,
                  cursor: "grab",
                  touchAction: "none",
                  border: "1px solid rgba(0,0,0,.14)",
                  boxShadow:
                    "0 10px 24px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.5)",
                }}
              />
            ))}
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
              onClick={() => addPiece(sw)}
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
      </div>
    </>
  );
}

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
