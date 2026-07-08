"use client";

import { useEffect, useRef } from "react";
import styles from "./ui.module.css";

// Button/link that leans toward the cursor and springs back. Extracted from the
// coming-soon "Notify me" interaction. Disabled under prefers-reduced-motion.
export default function MagneticButton({
  children,
  href,
  variant = "solid",
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "solid" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
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

  const cls = `${styles.magnetic} ${variant === "ghost" ? styles.magneticGhost : ""}`;

  if (href) {
    return (
      <a ref={ref} href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
