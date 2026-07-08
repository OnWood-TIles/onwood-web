"use client";

import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import { TILEGRID_HEAD } from "../../../lib/content";

// Interactive tile mesh. A 16-col grid of 96 cells that lift/scale in 3D toward
// the cursor on pointermove (transcribed from the reference: aspect-ratio 1,
// 7px radius, accent tint, perspective 1000). Per-cell transforms are written
// straight to the DOM inside a rAF for smoothness; reduced-motion disables lift.
const CELL_COUNT = 96;
const R = 150; // radius of pointer influence, px

export default function TileGrid() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cellsRef = useRef<Array<HTMLDivElement | null>>([]);
  const centersRef = useRef<Array<{ x: number; y: number }>>([]);
  const rafRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  // Cache each cell's centre relative to the grid so pointermove does not have
  // to read layout for all 96 cells every frame.
  const measure = () => {
    const cells = cellsRef.current;
    const centers: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < cells.length; i++) {
      const el = cells[i];
      if (!el) {
        centers[i] = { x: 0, y: 0 };
        continue;
      }
      centers[i] = {
        x: el.offsetLeft + el.offsetWidth / 2,
        y: el.offsetTop + el.offsetHeight / 2,
      };
    }
    centersRef.current = centers;
  };

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    measure();
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(grid);
    return () => {
      ro.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyLift = (px: number, py: number) => {
    const cells = cellsRef.current;
    const centers = centersRef.current;
    for (let i = 0; i < cells.length; i++) {
      const el = cells[i];
      const c = centers[i];
      if (!el || !c) continue;
      const dist = Math.hypot(c.x - px, c.y - py);
      const t = Math.max(0, 1 - dist / R); // 0 (far) -> 1 (under cursor)
      if (t <= 0) {
        el.style.transform = "translateZ(0) scale(1)";
        el.style.background =
          "color-mix(in oklab, var(--accent) 14%, transparent)";
        el.style.boxShadow = "none";
        el.style.zIndex = "0";
        continue;
      }
      const lift = (t * 44).toFixed(1);
      const scale = (1 + t * 0.22).toFixed(3);
      const mix = (14 + t * 40).toFixed(1);
      const shadowY = (8 + t * 22).toFixed(0);
      const shadowBlur = (16 + t * 30).toFixed(0);
      const shadowA = (0.12 + t * 0.28).toFixed(3);
      el.style.transform = `translateZ(${lift}px) scale(${scale})`;
      el.style.background = `color-mix(in oklab, var(--accent) ${mix}%, transparent)`;
      el.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(208,106,69,${shadowA})`;
      el.style.zIndex = "2";
    }
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedRef.current) return;
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyLift(px, py));
  };

  const reset = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    for (const el of cellsRef.current) {
      if (!el) continue;
      el.style.transform = "translateZ(0) scale(1)";
      el.style.background =
        "color-mix(in oklab, var(--accent) 14%, transparent)";
      el.style.boxShadow = "none";
      el.style.zIndex = "0";
    }
  };

  return (
    <section style={{ padding: "110px 40px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Reveal>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--accent2)",
            }}
          >
            {TILEGRID_HEAD.eyebrow}
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,4vw,52px)",
              letterSpacing: "-.02em",
              margin: "12px 0 0",
            }}
          >
            {TILEGRID_HEAD.title}
          </h2>
        </Reveal>
      </div>

      <div
        ref={gridRef}
        className="tilegrid-mesh"
        aria-hidden="true"
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(16,1fr)",
          gap: 10,
          perspective: 1000,
        }}
      >
        {Array.from({ length: CELL_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              cellsRef.current[i] = el;
            }}
            style={{
              aspectRatio: "1",
              borderRadius: 7,
              background: "color-mix(in oklab, var(--accent) 14%, transparent)",
              border: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)",
              transition:
                "transform .34s cubic-bezier(.2,.8,.2,1), background .34s, box-shadow .34s",
              willChange: "transform",
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .tilegrid-mesh { grid-template-columns: repeat(8,1fr) !important; }
        }
      `}</style>
    </section>
  );
}
