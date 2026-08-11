"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Reveal from "../ui/Reveal";
import { SPECIALS_TEASER } from "../../../lib/content";

// Full-bleed terracotta specials teaser. Transcribed from
// .refwork/tiles-sections/05-section-specials.html (exact radii, gradients,
// shadows). The white CTA carries the reference's data-magnetic lean-to-cursor
// behaviour (disabled under prefers-reduced-motion).
export default function SpecialsTeaser() {
  const { eyebrow, headA, headB, sub, chips, cta, badge, card, image } =
    SPECIALS_TEASER;
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      el.style.transition = "transform .1s ease-out";
      el.style.transform = `translate(${
        (e.clientX - (b.left + b.width / 2)) * 0.25
      }px, ${(e.clientY - (b.top + b.height / 2)) * 0.35}px)`;
    };
    const leave = () => {
      el.style.transition = "transform .4s cubic-bezier(.2,.9,.3,1.4)";
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section
      id="specials"
      style={{
        padding: "100px 40px",
        background: "linear-gradient(150deg,#d97a4e,#c15a30 68%,#a84a24)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <style>{`@media (max-width:860px){.ow-specials-grid{grid-template-columns:1fr;gap:34px;}.spt-img{height:min(116vw,480px)!important;border-radius:170px 170px 22px 22px!important;}.spt-badge{display:none!important;}.spt-price{display:none!important;}.spt-mobile-price{display:flex!important;}}`}</style>

      <div
        className="ow-specials-grid"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr .95fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        {/* Left column */}
        <div>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.95)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
              {eyebrow}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: "clamp(32px,4.4vw,58px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                margin: "14px 0 16px",
              }}
            >
              {headA}
              <br />
              {headB}
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p
              style={{
                maxWidth: 460,
                color: "rgba(255,255,255,.9)",
                fontSize: 16,
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              {sub}
            </p>
          </Reveal>

          {/* Mobile-only price. On mobile the floating badge + price card are hidden
              for a clean, stacked Why-OnWood-style layout, so the price shows here. */}
          <div className="spt-mobile-price" style={{ display: "none", alignItems: "baseline", gap: 12, margin: "2px 0 24px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: "clamp(36px,11vw,50px)", lineHeight: 1, color: "#fff" }}>{badge.pct}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>inc GST · {badge.label}</span>
          </div>

          <Reveal delay={0.24}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 30,
              }}
            >
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: 100,
                    background: "rgba(255,255,255,.16)",
                    border: "1px solid rgba(255,255,255,.3)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <Link
              ref={ctaRef}
              href={cta.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: "#fff",
                color: "#b8562f",
                fontWeight: 800,
                padding: "16px 28px",
                borderRadius: 100,
                fontSize: 15,
                boxShadow: "0 16px 40px rgba(0,0,0,.22)",
                willChange: "transform",
              }}
            >
              {cta.label}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </Reveal>
        </div>

        {/* Right column */}
        <div style={{ position: "relative" }}>
          <div
            role="img"
            aria-label="Special offer tile display"
            className="spt-img"
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              height: "clamp(320px,34vw,440px)",
              boxShadow: "0 30px 70px rgba(0,0,0,.3)",
              backgroundColor: "#c9a06a",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Rotated discount badge */}
          <div
            className="spt-badge"
            style={{
              position: "absolute",
              top: -14,
              right: -6,
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "var(--sea)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 34px rgba(0,0,0,.28)",
              transform: "rotate(-8deg)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 900,
                fontSize: 26,
                lineHeight: 1,
              }}
            >
              {badge.pct}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              {badge.label}
            </span>
          </div>

          {/* Price card */}
          <div
            className="spt-price"
            style={{
              position: "absolute",
              left: -16,
              bottom: 22,
              background: "#fff",
              color: "var(--ink)",
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 18px 40px rgba(0,0,0,.24)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo)",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {card.name}
            </div>
            <div style={{ fontSize: 13, marginTop: 3 }}>
              {card.was ? (
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "var(--muted)",
                  }}
                >
                  {card.was}
                </span>
              ) : null}{" "}
              <strong style={{ color: "#b8562f" }}>{card.now}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
