"use client";

import { useEffect, useState } from "react";

// Live countdown to the end of the current month (for the Specials page).
function endOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0).getTime();
}

function parts(ms: number) {
  const clamp = Math.max(0, ms);
  const d = Math.floor(clamp / 86400000);
  const h = Math.floor((clamp % 86400000) / 3600000);
  const m = Math.floor((clamp % 3600000) / 60000);
  const s = Math.floor((clamp % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(endOfMonth() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const p = parts(left ?? 0);
  const cell = (v: number, label: string) => (
    <div style={{ textAlign: "center", minWidth: 62 }}>
      <div
        style={{
          fontFamily: "var(--font-archivo), sans-serif",
          fontWeight: 900,
          fontSize: 34,
          color: "var(--color-primary)",
          lineHeight: 1,
        }}
      >
        {left === null ? "--" : String(v).padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div
      aria-label="Time left this month"
      style={{ display: "flex", gap: 18, justifyContent: "center" }}
    >
      {cell(p.d, "Days")}
      {cell(p.h, "Hrs")}
      {cell(p.m, "Min")}
      {cell(p.s, "Sec")}
    </div>
  );
}
