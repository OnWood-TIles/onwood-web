"use client";

import { useEffect, useState } from "react";
import VisionBoardCard from "./VisionBoardCard";
import { HERO_BOARDS } from "../../../lib/heroBoards";

// The hero showcase: pre-set vision boards fly in from the right, pose, then slide
// out to the left as the next flies in - looping. Respects reduced-motion (soft
// crossfade instead of sliding). All boards stay mounted, so images preload and
// there is no pop-in.
const HOLD_MS = 4800;

export default function HeroBoardConveyor() {
  const boards = HERO_BOARDS;
  const n = boards.length;
  const [index, setIndex] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const tick = () => setIndex((i) => (i + 1) % n);
    let id = window.setInterval(tick, HOLD_MS);
    // pause while the tab is hidden, resume on return
    const onVis = () => {
      window.clearInterval(id);
      if (!document.hidden) id = window.setInterval(tick, HOLD_MS);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [n]);

  return (
    <div
      aria-label="A rotating showcase of OnWood tile and material vision boards"
      role="img"
      style={{ position: "relative", width: "min(430px, 94%)", aspectRatio: "490 / 648", margin: "0 auto" }}
    >
      {boards.map((b, i) => {
        const isCurrent = i === index;
        const isPrev = i === (index - 1 + n) % n;
        const x = isCurrent ? "0%" : isPrev ? "-120%" : "120%";
        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              inset: 0,
              transform: reduce ? "none" : `translate3d(${x},0,0)`,
              opacity: isCurrent ? 1 : 0,
              transition: reduce
                ? "opacity .9s ease"
                : "transform .9s cubic-bezier(.5,0,.2,1), opacity .8s ease",
              zIndex: isCurrent ? 2 : 1,
              pointerEvents: isCurrent ? "auto" : "none",
              willChange: "transform, opacity",
            }}
          >
            <VisionBoardCard board={b} />
          </div>
        );
      })}
    </div>
  );
}
