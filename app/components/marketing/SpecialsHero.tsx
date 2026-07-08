"use client";

import { useEffect, useState } from "react";
import Reveal from "../ui/Reveal";
import { SPECIALS_PAGE } from "../../../lib/content";

// Specials page hero with a live countdown to the end of the current month.
function endOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

export default function SpecialsHero() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(endOfMonth() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ms = Math.max(0, left ?? 0);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => (left === null ? "00" : String(n).padStart(2, "0"));

  const cell = (val: string, label: string, accent = false) => (
    <div style={{ textAlign: "center", minWidth: 62 }}>
      <div
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: 900,
          fontSize: 34,
          lineHeight: 1,
          color: accent ? "var(--accent)" : "#fff",
        }}
      >
        {val}
      </div>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.6,
          marginTop: 5,
        }}
      >
        {label}
      </div>
    </div>
  );
  const colon = (
    <div style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, fontSize: 30, opacity: 0.4 }}>
      :
    </div>
  );

  return (
    <section
      style={{
        padding: "150px 40px 70px",
        maxWidth: 1240,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Reveal>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "7px 14px",
            borderRadius: 100,
            background: "color-mix(in oklab, var(--accent) 12%, var(--surface))",
            border: "1px solid var(--line)",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
          {SPECIALS_PAGE.eyebrow}
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h1
          style={{
            fontFamily: "var(--font-archivo)",
            fontWeight: 900,
            fontSize: "clamp(44px,7vw,96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            margin: "22px 0 10px",
            color: "var(--ink)",
          }}
        >
          {SPECIALS_PAGE.title}{" "}
          <span
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-newsreader)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            specials
          </span>
          {SPECIALS_PAGE.titleAccent}
        </h1>
      </Reveal>
      <Reveal delay={0.16}>
        <p
          style={{
            maxWidth: 560,
            margin: "0 auto 34px",
            color: "var(--muted)",
            fontSize: "clamp(16px,1.6vw,19px)",
            lineHeight: 1.6,
          }}
        >
          {SPECIALS_PAGE.sub}
        </p>
      </Reveal>
      <Reveal delay={0.24}>
        <div
          aria-label="Time left this month"
          style={{
            display: "inline-flex",
            gap: 12,
            padding: "18px 22px",
            borderRadius: 18,
            background: "var(--ink)",
            color: "#fff",
            boxShadow: "0 20px 50px rgba(32,48,58,.2)",
          }}
        >
          {cell(pad(d), "Days")}
          {colon}
          {cell(pad(h), "Hrs")}
          {colon}
          {cell(pad(m), "Min")}
          {colon}
          {cell(pad(s), "Sec", true)}
        </div>
      </Reveal>
    </section>
  );
}
