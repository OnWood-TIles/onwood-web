"use client";
// "Reset build" for the 2D and 3D vanity builders. Asks twice, inline (never a browser pop-up):
// the first tap changes the label to "Tap again to reset" for 3 seconds, and only a second tap
// in that time starts the build again. A double-click is not taken as the second tap.
import { useEffect, useRef, useState } from "react";

const WAIT = 3000; // how long the second tap is waited for
const SETTLE = 300; // a tap this soon after the first is a double-click, not a yes

export default function ResetBuildButton({ disabled, onReset, className }: { disabled: boolean; onReset: () => void; className: string }) {
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const armed = armedAt != null && !disabled;

  const tap = () => {
    const now = Date.now();
    if (armed && now - armedAt < SETTLE) return;
    if (timer.current) clearTimeout(timer.current);
    if (armed) { setArmedAt(null); onReset(); return; }
    setArmedAt(now);
    timer.current = setTimeout(() => setArmedAt(null), WAIT);
  };

  return (
    <button type="button" className={`${className}${armed ? " armed" : ""}`} disabled={disabled} onClick={tap} aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
      </svg>
      {armed ? "Tap again to reset" : "Reset build"}
    </button>
  );
}
