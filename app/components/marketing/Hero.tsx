"use client";

import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import MagneticButton from "../ui/MagneticButton";
import { HERO } from "../../../lib/content";
import HeroBoardConveyor from "./HeroBoardConveyor";

// Full-height hero. Behind the copy sits a lightweight canvas that draws soft,
// gently drifting horizontal wood-grain lines in warm tones (accent + walnut on
// the bg). Reduced-motion draws a single static frame. A radial overlay sits on
// top of the canvas; all decorative layers are pointer-events:none.
function WoodgrainCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // t is seconds; grain drifts slowly and alternates direction per line.
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#FBFAF6";
      ctx.fillRect(0, 0, w, h);

      const spacing = 24;
      const lines = Math.ceil(h / spacing) + 2;
      for (let i = 0; i < lines; i++) {
        const baseY = i * spacing;
        // warm palette: mostly walnut, an accent line every third row
        const rgb = i % 3 === 0 ? "208,106,69" : "122,74,40";
        const alpha = 0.045 + (i % 2) * 0.02;
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth = i % 4 === 0 ? 1.5 : 1;

        const amp = 6 + (i % 5) * 2;
        const freq = 0.0045 + (i % 3) * 0.001;
        const drift = t * 0.35 * (i % 2 ? 1 : -1);

        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y =
            baseY +
            Math.sin(x * freq + i * 0.6 + drift) * amp +
            Math.sin(x * freq * 2.3 + i) * amp * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    resize();
    if (reduce) {
      draw(0);
    } else {
      const frame = (ts: number) => {
        draw(ts / 1000);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      resize();
      if (reduce) draw(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <WoodgrainCanvas />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 70% 30%, transparent 55%, rgba(32,48,58,.05) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="ow-hero-grid"
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "120px 40px 80px",
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 14px",
                borderRadius: 100,
                background: "rgba(255,255,255,.7)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                boxShadow: "0 6px 20px rgba(32,48,58,.06)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--sea)",
                }}
              />
              {HERO.eyebrow}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                color: "var(--ink)",
                fontSize: "clamp(44px,6.4vw,92px)",
                lineHeight: 0.96,
                letterSpacing: "-0.02em",
                margin: "22px 0 0",
              }}
            >
              {HERO.headA}
              <br />
              {HERO.headB}
              <br />
              {HERO.headC}
              <span
                style={{
                  color: "var(--sea)",
                  fontFamily: "var(--font-newsreader)",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                {HERO.headAccent}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p
              style={{
                maxWidth: 480,
                color: "var(--muted)",
                fontSize: "clamp(16px,1.5vw,19px)",
                lineHeight: 1.6,
                margin: "26px 0 34px",
              }}
            >
              {HERO.sub}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <MagneticButton href={HERO.ctaPrimary.href}>
                {HERO.ctaPrimary.label} <span aria-hidden="true">→</span>
              </MagneticButton>
              <MagneticButton href={HERO.ctaSecondary.href} variant="ghost">
                {HERO.ctaSecondary.label}
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        <div className="ow-hero-art" style={{ display: "flex", justifyContent: "center" }}>
          <HeroBoardConveyor />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 7,
          color: "var(--muted)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Scroll
        <svg
          width="16"
          height="22"
          viewBox="0 0 16 22"
          aria-hidden="true"
          style={{ animation: "owDown 1.6s ease-in-out infinite" }}
        >
          <path
            d="M8 2 V18 M2 12 L8 18 L14 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .ow-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 110px 24px 72px !important;
          }
          .ow-hero-art { order: 2; }
        }
      `}</style>
    </section>
  );
}
