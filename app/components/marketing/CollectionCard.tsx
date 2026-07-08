"use client";

import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";
import type { Collection } from "../../../lib/content";

// Subtle 3D tilt-to-cursor card (reference: data-tilt-card). Rotates toward the
// pointer on hover and resets on leave. Honours prefers-reduced-motion.
const MAX_TILT = 5; // degrees

export default function CollectionCard({ col }: { col: Collection }) {
  const ref = useRef<HTMLElement | null>(null);

  const handleMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    const rotY = (px - 0.5) * 2 * MAX_TILT;
    const rotX = (0.5 - py) * 2 * MAX_TILT;
    el.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    el.style.boxShadow = "0 26px 60px -28px rgba(32,48,58,.35)";
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
  }, []);

  return (
    <article
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-tilt-card=""
      style={{
        position: "relative",
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        transition: "transform .16s ease-out, box-shadow .3s",
        transformStyle: "preserve-3d",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 3.4",
          background: col.swatch,
          position: "relative",
          borderRadius: "130px 130px 0 0",
          margin: "10px 10px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(80% 60% at 50% 0%, rgba(255,255,255,.18), transparent 70%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(0,0,0,.38)",
            padding: "5px 12px",
            borderRadius: 100,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {col.tag}
        </span>
      </div>
      <div style={{ padding: "18px 18px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: 20,
              margin: 0,
            }}
          >
            {col.name}
          </h3>
          <span
            style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}
          >
            {col.price}
          </span>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.55,
            margin: "8px 0 0",
          }}
        >
          {col.desc}
        </p>
      </div>
    </article>
  );
}
