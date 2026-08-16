"use client";

import { useEffect, useRef, useState } from "react";

// SSR-renders the FINAL value (so no-JS visitors, prefers-reduced-motion users
// and crawlers/Google always see the real number — never a "0"), then counts
// 0 -> `to` when scrolled into view for JS users who allow motion.
export default function CountUp({
  to,
  suffix = "",
  durationMs = 1400,
  className,
  style,
}: {
  to: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to); // start at final so the served HTML is correct
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / durationMs);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(to * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className} style={style}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
