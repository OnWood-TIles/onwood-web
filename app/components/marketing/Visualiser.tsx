"use client";

import { useState } from "react";
import Reveal from "../ui/Reveal";
import { VISUALISER } from "../../../lib/content";

// Darken a #rrggbb (or #rgb) colour by a multiplier (<1 darkens) -> rgb() string.
// Used to derive the seam-band plank colour from the active floor colour.
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = Math.round(((num >> 16) & 255) * amt);
  const g = Math.round(((num >> 8) & 255) * amt);
  const b = Math.round((num & 255) * amt);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function Visualiser() {
  const { eyebrow, title, sub, swatches } = VISUALISER;
  const [active, setActive] = useState(0);
  const floor = swatches[active].floor;
  const floorName = swatches[active].name;

  const floorBg = `repeating-linear-gradient(91deg, rgba(0,0,0,.14) 0 2px, transparent 2px 130px), repeating-linear-gradient(1deg, ${floor} 0 44px, ${shade(floor, 0.88)} 44px 46px)`;

  return (
    <section
      id="visualize"
      style={{
        padding: "100px 40px",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .viz-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="viz-grid"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 44,
          alignItems: "center",
        }}
      >
        {/* Left: faux room preview */}
        <div>
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 30px 70px rgba(0,0,0,.18)",
              background: "#d9d2c6",
              aspectRatio: "16 / 11",
              perspective: "1400px",
            }}
          >
            {/* back wall gradient */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,#e9e3d8 0%,#ded6c8 46%,#d3cabb 46%)",
              }}
            />
            {/* room photo placeholder (top wall band) */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: "46%",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg,#efe9df 0%,#e4dccd 100%)",
                }}
              />
            </div>
            {/* perspective floor */}
            <div
              style={{
                position: "absolute",
                left: "-10%",
                right: "-10%",
                bottom: "-2%",
                top: "44%",
                transformOrigin: "center bottom",
                transform: "rotateX(58deg)",
              }}
            >
              <div
                data-floor=""
                style={{
                  position: "absolute",
                  inset: 0,
                  background: floorBg,
                  backgroundSize: "auto, auto",
                  transition: "background .5s ease, opacity .5s ease, filter .5s ease",
                  boxShadow: "inset 0 0 120px rgba(0,0,0,.25)",
                }}
              />
            </div>
            {/* floor shadow vignette */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(80% 60% at 50% 100%, rgba(0,0,0,.14), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            {/* active floor name pill */}
            <div
              data-floorname=""
              style={{
                position: "absolute",
                left: 16,
                bottom: 14,
                background: "rgba(0,0,0,.55)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 100,
                backdropFilter: "blur(4px)",
                fontFamily: "var(--font-manrope)",
              }}
            >
              {floorName}
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div>
          <Reveal>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--sea)",
                fontFamily: "var(--font-manrope)",
              }}
            >
              {eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(28px,3.4vw,42px)",
                letterSpacing: "-.02em",
                margin: "12px 0 14px",
              }}
            >
              {title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 15,
                lineHeight: 1.6,
                margin: "0 0 22px",
                fontFamily: "var(--font-manrope)",
              }}
            >
              {sub}
            </p>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 12,
            }}
          >
            {swatches.map((sw, i) => {
              const isActive = i === active;
              return (
                <button
                  key={sw.name}
                  type="button"
                  data-name={sw.name}
                  aria-pressed={isActive}
                  aria-label={`Preview ${sw.name} on the floor`}
                  onClick={() => setActive(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: 9,
                    borderRadius: 13,
                    border: `1.5px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                    background: "var(--bg)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color .2s, transform .2s",
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      background: sw.swatch,
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: "var(--ink)",
                      lineHeight: 1.2,
                      fontFamily: "var(--font-manrope)",
                    }}
                  >
                    {sw.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
