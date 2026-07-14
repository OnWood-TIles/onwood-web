"use client";

import { useEffect, useRef, useState } from "react";
import { BOARD_H, BOARD_W, HERO_BOARDS, type BoardPiece } from "../../../lib/heroBoards";
import { PaintChipFace } from "./PaintChip";
import { CarpetSwatchFace } from "./CarpetSwatch";
import { FloorSwatchFace } from "./FloorSwatch";

// "Ambient Drift" hero showcase (ported from the Claude Design handoff): each
// board's samples float in like dust, magnetise into the assembled vision
// board, hold, then release back into the drift as the next board floats in.
// Pieces are the REAL Vision Board tool samples (PaintChipFace fan-deck chips,
// FloorSwatchFace tiles, CarpetSwatchFace, ABI metal discs) at the tool's
// design sizes - see lib/heroBoards.ts. The hero + feature slots sit in the
// same spot on every board; everything else repositions per board.
//
// All pieces of all boards render once; the engine mutates transform/opacity
// directly on the nodes inside rAF (compositor-only, no React re-renders).

// ---- tunables ---------------------------------------------------------------
const HOLD = 4.5;   // seconds the assembled board holds
const E_DUR = 1.55; // per-piece fly-in duration (s)
const E_STAG = 0.11;
const X_DUR = 1.15; // per-piece release duration (s)
const X_STAG = 0.08;
const DRAMA = 1;    // 0.6 calm … 1.5 wild
const CB = { x: BOARD_W / 2, y: BOARD_H / 2 + 30 }; // drift-ring centre

// the tool's design sizes (render at these, scale to the piece box - keeps
// punch holes / pills / badges in proportion, same trick as VisionBoard)
const PAINT_W = 120, PAINT_H = 168;
const METAL_W = 112;
const CARPET_W = 210;
const TILE_EDGE = 176;

const N_MAX = Math.max(...HERO_BOARDS.map((b) => b.pieces.length));
const E_TOTAL = E_DUR + E_STAG * (N_MAX - 1);
const X_TOTAL = X_DUR + X_STAG * (N_MAX - 1);
const SEG = E_TOTAL + HOLD + X_TOTAL + 0.12; // one full board cycle

// deterministic per-piece randomness (no Math.random - stable across renders)
function rnd(seed: number, i: number) {
  let s = (seed + i * 374761393) >>> 0;
  s = (s ^ (s >>> 13)) >>> 0;
  s = (s * 1274126177) >>> 0;
  s = (s ^ (s >>> 16)) >>> 0;
  return s / 4294967296;
}
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// shuffled arrival order per board per cycle
function order(boardIdx: number, segIdx: number, n: number): number[] {
  const seed = 7919 + boardIdx * 104729 + segIdx * 2654435761;
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd(seed, i) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const pos: number[] = new Array(n);
  for (let i = 0; i < n; i++) pos[arr[i]] = i;
  return pos;
}

type Pose = { x: number; y: number; rot: number; op: number; lift: number };

function pose(
  slot: BoardPiece,
  phase: "enter" | "idle" | "exit",
  p: number,
  seed: number,
  now: number,
  reduced: boolean,
): Pose {
  let { x, y, rot } = slot;
  let op = 1;
  if (reduced) {
    op = phase === "enter" ? clamp(p * 2) : phase === "exit" ? clamp(1 - p * 2) : 1;
    return { x, y, rot, op, lift: 0 };
  }
  if (phase === "idle") {
    // gentle breathing while assembled
    const amp = (slot.kind === "styling" ? 2.6 : 1.7) * DRAMA;
    x += Math.sin(now * 0.00058 + (seed % 7)) * amp;
    y += Math.cos(now * 0.00047 + (seed % 11)) * amp * 1.2;
    rot += Math.sin(now * 0.00035 + (seed % 5)) * 0.45 * DRAMA;
    return { x, y, rot, op: 1, lift: 0 };
  }
  const pang = rnd(seed, 1) * 6.283;
  const prad = (430 + rnd(seed, 2) * 260) * DRAMA;
  const wob = Math.sin(now * 0.0011 + (seed % 13)) * 16 * DRAMA;
  const wob2 = Math.cos(now * 0.0009 + (seed % 17)) * 13 * DRAMA;
  const e = inOutCubic(p);
  let lift: number;
  if (phase === "enter") {
    // magnetise in from a parking spot on a wide ring, wobble fading as it docks
    const px = CB.x + Math.cos(pang) * prad;
    const py = CB.y + Math.sin(pang) * prad * 0.8;
    x = lerp(px, slot.x, e) + wob * (1 - p);
    y = lerp(py, slot.y, e) + wob2 * (1 - p);
    rot = lerp(slot.rot + (rnd(seed, 3) - 0.5) * 60 * DRAMA, slot.rot, e);
    op = clamp(p * 2.2);
    lift = Math.sin(Math.PI * p) * 0.8;
  } else {
    // release back into the drift, further round the ring
    const qx = CB.x + Math.cos(pang + 2) * prad;
    const qy = CB.y + Math.sin(pang + 2) * prad * 0.8;
    x = lerp(slot.x, qx, e) + wob * p;
    y = lerp(slot.y, qy, e) + wob2 * p;
    rot = lerp(slot.rot, slot.rot + (rnd(seed, 4) - 0.5) * 50, e);
    op = clamp((1 - p) * 1.6);
    lift = Math.sin(Math.PI * p) * 0.8;
  }
  return { x, y, rot, op, lift };
}

// Design-size wrapper: render the face at its tool design size, scale to the
// piece box so pills/punch holes/badges keep their proportions.
function Scaled({
  dw,
  dh,
  w,
  children,
}: {
  dw: number;
  dh: number;
  w: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: dw, height: dh, transform: `scale(${w / dw})`, transformOrigin: "top left" }}>
      {children}
    </div>
  );
}

// One piece, rendered exactly like the Vision Board tool renders it.
function PieceFace({ piece }: { piece: BoardPiece }) {
  switch (piece.kind) {
    case "photo":
      // the tool's "render" piece: white photo frame
      return (
        <div
          style={{
            position: "relative", width: "100%", height: "100%", padding: 6,
            background: "#fff", borderRadius: 8,
            boxShadow: "0 14px 30px rgba(0,0,0,.34)", boxSizing: "border-box",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piece.src} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 4 }}
          />
        </div>
      );
    case "paint":
      return (
        <Scaled dw={PAINT_W} dh={PAINT_H} w={piece.w}>
          <PaintChipFace name={piece.name} hex={piece.color || "#ccc"} />
        </Scaled>
      );
    case "timber":
      return (
        <Scaled dw={PAINT_W} dh={PAINT_H} w={piece.w}>
          <PaintChipFace name={piece.name} hex="#cbb79a" image={piece.src} brandLogo={piece.brandLogo} />
        </Scaled>
      );
    case "tile":
    case "stone":
      // labels off (Reagan: only cabinetry + paint keep theirs)
      return (
        <Scaled dw={TILE_EDGE} dh={TILE_EDGE} w={piece.w}>
          <FloorSwatchFace
            name={piece.name}
            range={piece.sub || ""}
            url={piece.src || ""}
            showLabel={false}
            radius={piece.radius ?? (piece.kind === "tile" ? 2 : 10)}
          />
        </Scaled>
      );
    case "carpet":
      return (
        <Scaled dw={CARPET_W} dh={CARPET_W} w={piece.w}>
          <CarpetSwatchFace
            colour={piece.name}
            range={piece.sub || ""}
            url={piece.src || ""}
            brandLogo={piece.brandLogo}
            showLabel={false}
          />
        </Scaled>
      );
    case "metal":
      // the ABI disc alone - the embossed ABI branding lives in the photo
      return (
        <Scaled dw={METAL_W} dh={METAL_W} w={piece.w}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piece.src} alt={piece.name}
            style={{
              width: "100%", height: "100%", objectFit: "contain", display: "block",
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,.34))",
            }}
          />
        </Scaled>
      );
    case "styling":
      // background-removed cutout - florals render LARGER here than in the
      // tool on purpose (colour + vibe on the front page)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={piece.src} alt=""
          style={{
            width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom",
            display: "block", filter: "drop-shadow(0 8px 12px rgba(0,0,0,.34))",
          }}
        />
      );
  }
}

export default function AmbientDriftBoard() {
  const boards = HERO_BOARDS;
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scale, setScale] = useState(1);

  // scale the fixed 520x600 board space to the container width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BOARD_W));
    ro.observe(el);
    setScale(el.clientWidth / BOARD_W);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // flat piece list mirroring the render order below
    const flat: { bi: number; pi: number; piece: BoardPiece }[] = [];
    boards.forEach((b, bi) => b.pieces.forEach((piece, pi) => flat.push({ bi, pi, piece })));

    // ?heroBoard=N freezes board N fully assembled (screenshots / debugging)
    const dbg = new URLSearchParams(window.location.search).get("heroBoard");
    if (dbg !== null) {
      const bi = Math.max(0, Math.min(boards.length - 1, parseInt(dbg, 10) || 0));
      flat.forEach(({ bi: b, piece }, i) => {
        const node = nodeRefs.current[i];
        if (!node) return;
        if (b === bi) {
          node.style.transform = `translate(${piece.x}px,${piece.y}px) rotate(${piece.rot}deg)`;
          node.style.opacity = "1";
        } else {
          node.style.opacity = "0";
        }
      });
      return;
    }

    let t0 = performance.now();
    let hiddenAt = 0;
    const cache: (string | undefined)[] = new Array(flat.length);
    const ordCache = new Map<string, number[]>();

    const tick = (now: number) => {
      const el = (now - t0) / 1000;
      const segIdx = Math.floor(el / SEG);
      const boardIdx = segIdx % boards.length;
      const tl = el - segIdx * SEG;
      const n = boards[boardIdx].pieces.length;
      const okey = `${boardIdx}-${segIdx}`;
      let ord = ordCache.get(okey);
      if (!ord) {
        if (ordCache.size > 60) ordCache.clear();
        ord = order(boardIdx, segIdx, n);
        ordCache.set(okey, ord);
      }
      for (let i = 0; i < flat.length; i++) {
        const node = nodeRefs.current[i];
        if (!node) continue;
        const { bi, pi, piece } = flat[i];
        if (bi !== boardIdx) {
          if (cache[i] !== "hidden") {
            node.style.opacity = "0";
            cache[i] = "hidden";
          }
          continue;
        }
        const oi = ord[pi] || 0;
        const seed = (7919 + boardIdx * 104729 + pi * 1299709 + segIdx * 96557) >>> 0;
        let phase: "enter" | "idle" | "exit";
        let p: number;
        if (tl < E_TOTAL) {
          phase = "enter";
          p = clamp((tl - oi * E_STAG) / E_DUR);
        } else if (tl < E_TOTAL + HOLD) {
          phase = "idle";
          p = 0;
        } else {
          phase = "exit";
          p = clamp((tl - E_TOTAL - HOLD - oi * X_STAG) / X_DUR);
        }
        const ps = pose(piece, phase, p, seed, now, reduced);
        const tr = `translate(${ps.x.toFixed(2)}px,${ps.y.toFixed(2)}px) rotate(${ps.rot.toFixed(2)}deg) scale(${(1 + 0.05 * ps.lift).toFixed(3)})`;
        const sig = `${tr}|${ps.op.toFixed(3)}`;
        if (cache[i] === sig) continue;
        cache[i] = sig;
        node.style.transform = tr;
        node.style.opacity = ps.op.toFixed(3);
      }
    };

    let raf = 0;
    let last = 0;
    const loop = () => {
      const now = performance.now();
      if (now - last >= 12) {
        last = now;
        tick(now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // pause the cycle while the tab is hidden (shift the clock on return)
    const onVis = () => {
      if (document.hidden) hiddenAt = performance.now();
      else if (hiddenAt) t0 += performance.now() - hiddenAt;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [boards]);

  let flatIdx = -1;
  return (
    <div
      ref={wrapRef}
      aria-label="A rotating showcase of OnWood tile and material vision boards"
      role="img"
      style={{
        position: "relative",
        width: "min(430px, 94%)",
        aspectRatio: `${BOARD_W} / ${BOARD_H}`,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BOARD_W,
          height: BOARD_H,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {boards.map((b) =>
          b.pieces.map((piece) => {
            flatIdx++;
            const i = flatIdx;
            return (
              <div
                key={`${b.id}-${piece.id}`}
                ref={(el) => { nodeRefs.current[i] = el; }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: piece.w,
                  height: piece.h,
                  zIndex: piece.z,
                  opacity: 0,
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              >
                <PieceFace piece={piece} />
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
