"use client";

import { useEffect, useRef } from "react";

type RGB = [number, number, number];

type Tile = {
  x: number;
  y: number;
  c: RGB; // resting zellige colour
  seed: number; // shimmer phase
  delay: number; // grout-line reveal delay (∝ distance from centre)
  lift: number; // eased hover lift 0..1
  locked: boolean; // has the visitor "laid" it?
  lc: RGB | null; // laid finish colour
  pop: number; // just-laid pop 0..1
};

// zellige-style resting palette (terracotta, clay, sea, aqua, creams, ink, apricot)
const PALETTE: RGB[] = [
  [208, 106, 69],
  [197, 123, 76],
  [30, 122, 140],
  [76, 176, 192],
  [235, 224, 205],
  [244, 236, 224],
  [46, 74, 88],
  [224, 156, 110],
];

// vivid OnWood finishes a visitor can "lay" by tapping
const FINISHES: RGB[] = [
  [208, 106, 69], // terracotta
  [30, 122, 140], // sea
  [76, 176, 192], // aqua
  [224, 156, 110], // apricot
  [197, 123, 76], // clay
  [46, 74, 88], // ink
];

const STORAGE_KEY = "onwood.laidTiles.v1";

// laid tiles persist across reloads, keyed by grid cell → finish index
function loadLaid(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLaid(map: Record<string, number>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* private mode / quota — non-fatal */
  }
}

export default function MosaicCanvas({
  hostRef,
}: {
  hostRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const laid = loadLaid();
    const cleanups: Array<() => void> = [];
    let raf = 0;

    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let cell = 0;
    let tiles: Tile[] = [];
    let cgx = 0;
    let cgy = 0;
    let maxD = 1;

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const build = () => {
      const rect = host.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(44, Math.round(Math.min(W, H) / 12));
      cols = Math.ceil(W / cell) + 1;
      rows = Math.ceil(H / cell) + 1;
      cgx = (cols - 1) / 2;
      cgy = (rows - 1) / 2;
      maxD = Math.hypot(cgx, cgy) || 1;

      // preserve any tiles the visitor laid this session across resize
      const prev: Record<string, Tile> = {};
      tiles.forEach((t) => {
        prev[`${t.x}x${t.y}`] = t;
      });

      tiles = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const old = prev[`${x}x${y}`];
          const c = PALETTE[(Math.random() * PALETTE.length) | 0];
          const d = Math.hypot(x - cgx, y - cgy) / maxD; // 0 centre .. 1 edge

          // restore a persisted (reloaded) finish if present
          const savedIdx = laid[`${x},${y}`];
          const persisted =
            savedIdx !== undefined ? FINISHES[savedIdx] ?? null : null;

          tiles.push({
            x,
            y,
            c,
            seed: Math.random() * 6.28,
            delay: d * 0.55,
            lift: 0,
            locked: old ? old.locked : persisted !== null,
            lc: old ? old.lc : persisted,
            pop: 0,
          });
        }
      }
    };
    build();

    const onResize = () => build();
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    // cursor tracking (relative to the host, so the glow follows over the card too)
    let mx = -999;
    let my = -999;
    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
    };
    const onLeave = () => {
      mx = -999;
      my = -999;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    });

    // tap to permanently "lay" a tile in a vivid OnWood finish
    const onTap = (e: PointerEvent) => {
      if (e.target !== canvas) return; // ignore clicks on the card / form
      const b = host.getBoundingClientRect();
      const gx = Math.floor((e.clientX - b.left) / cell);
      const gy = Math.floor((e.clientY - b.top) / cell);
      const tl = tiles.find((t) => t.x === gx && t.y === gy);
      if (!tl) return;
      let fi = (Math.random() * FINISHES.length) | 0;
      // avoid re-laying the same colour twice in a row
      if (tl.lc && FINISHES[fi] === tl.lc) fi = (fi + 1) % FINISHES.length;
      tl.locked = true;
      tl.lc = FINISHES[fi];
      tl.pop = 1;
      laid[`${gx},${gy}`] = fi;
      saveLaid(laid);
    };
    canvas.style.cursor = "pointer";
    canvas.addEventListener("pointerdown", onTap);
    cleanups.push(() => canvas.removeEventListener("pointerdown", onTap));

    const gap = 3;
    let t = 0;
    const start = performance.now();
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const draw = (now: number) => {
      t += 0.016;
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      const radius = cell * 3.4;

      for (const tl of tiles) {
        // grout-line reveal: tiles rise in from the centre outward
        const appear = easeOut(
          Math.max(0, Math.min(1, (elapsed - tl.delay) / 0.4)),
        );
        if (appear <= 0.001) continue;

        const px = tl.x * cell;
        const py = tl.y * cell;
        const ccx = px + cell / 2;
        const ccy = py + cell / 2;
        const dist = Math.hypot(mx - ccx, my - ccy);
        const near = mx > -900 ? Math.max(0, 1 - dist / radius) : 0;
        const shimmer =
          0.5 + 0.5 * Math.sin(t * 1.1 + tl.seed + tl.x * 0.3 + tl.y * 0.2);
        const targetLift = near * near;
        tl.lift += (targetLift - tl.lift) * 0.14;
        tl.pop *= 0.9;
        if (tl.pop < 0.01) tl.pop = 0;

        const s =
          (0.55 + 0.45 * appear) * (1 + tl.lift * 0.16 + tl.pop * 0.28);
        const inset = gap + (1 - s) * cell * 0.5;
        const size = cell - inset * 2;
        if (size <= 0) continue;

        const col = tl.locked && tl.lc ? tl.lc : tl.c;
        const bright =
          (tl.locked ? 0.92 : 0.72) +
          shimmer * 0.12 +
          tl.lift * 0.5 +
          tl.pop * 0.6;
        const [r0, g0, b0] = col;
        const R = Math.min(255, r0 * bright);
        const G = Math.min(255, g0 * bright);
        const B = Math.min(255, b0 * bright);
        const ox = px + inset;
        const oy = py + inset - tl.lift * 6 - tl.pop * 4;
        ctx.globalAlpha = appear;

        // shadow for lifted / just-laid tiles
        if (tl.lift > 0.04 || tl.pop > 0.04) {
          ctx.fillStyle = `rgba(0,0,0,${(tl.lift + tl.pop) * 0.32})`;
          rr(ox + 2, oy + (tl.lift + tl.pop) * 8, size, size, 7);
          ctx.fill();
        }

        // tile face with soft diagonal sheen
        const g = ctx.createLinearGradient(ox, oy, ox + size, oy + size);
        g.addColorStop(0, `rgb(${(R + 14) | 0},${(G + 14) | 0},${(B + 14) | 0})`);
        g.addColorStop(
          1,
          `rgb(${(R * 0.82) | 0},${(G * 0.82) | 0},${(B * 0.82) | 0})`,
        );
        ctx.fillStyle = g;
        rr(ox, oy, size, size, 7);
        ctx.fill();

        // laid tiles get a crisp grout edge so they read as "set"
        if (tl.locked) {
          ctx.strokeStyle = `rgba(255,255,255,${0.28 + tl.pop * 0.5})`;
          ctx.lineWidth = 1.5;
          rr(ox, oy, size, size, 7);
          ctx.stroke();
        }

        // glossy top highlight
        ctx.fillStyle = `rgba(255,255,255,${0.1 + tl.lift * 0.22 + tl.pop * 0.3})`;
        rr(ox + size * 0.12, oy + size * 0.1, size * 0.76, size * 0.28, 6);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // warm glow that follows the cursor
      if (mx > -900) {
        const rg = ctx.createRadialGradient(mx, my, 0, mx, my, cell * 3.4);
        rg.addColorStop(0, "rgba(255,210,170,.14)");
        rg.addColorStop(1, "rgba(255,210,170,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }

      // full animation normally; a single settled frame under reduced motion
      if (!reduce) raf = requestAnimationFrame(draw);
      else if (elapsed < 1.2) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [hostRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
