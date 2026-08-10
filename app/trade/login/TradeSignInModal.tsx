"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TradeLoginForm from "./TradeLoginForm";

// Trade Partner sign-in as a modal. The hero "Sign in" button opens it, so there
// is ONE clear entry point (no permanently-open card competing with the button)
// and no fragile anchor-scroll on mobile. The dark card keeps the existing
// white-on-dark login form styling. Closes on backdrop click, the X, or Escape.
export default function TradeSignInModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={triggerStyle}>
        Sign in
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Trade Partner sign in" onClick={() => setOpen(false)} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} style={closeStyle}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/onwood-logo-white.png" alt="OnWood Tiles" style={{ height: 60, width: "auto", display: "block", marginBottom: 18 }} />
            <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: "0 0 6px", color: "#fff" }}>Partner sign-in</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,.6)", margin: "0 0 22px" }}>
              Welcome back. Sign in to see your pricing and place an order.
            </p>
            <TradeLoginForm />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", margin: "20px 0 0", lineHeight: 1.6, textAlign: "center" }}>
              Not a partner yet?{" "}
              <Link href="/trade/apply" style={{ color: "#e79070", fontWeight: 700, textDecoration: "none" }}>Apply now</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const triggerStyle: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 15.5,
  border: "none",
  cursor: "pointer",
  padding: "14px 28px",
  borderRadius: 999,
  fontFamily: "inherit",
};
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 300,
  background: "rgba(11,20,26,.55)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  padding: 20,
};
const cardStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "linear-gradient(165deg,#14242e,#0b141a)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 22,
  padding: "34px 30px",
  boxShadow: "0 50px 100px -40px rgba(0,0,0,.7)",
};
const closeStyle: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  background: "rgba(255,255,255,.08)",
  border: "none",
  color: "rgba(255,255,255,.7)",
  width: 34,
  height: 34,
  borderRadius: 999,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};
