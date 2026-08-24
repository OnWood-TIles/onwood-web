"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Slim, dismissible "showroom coming soon" notice — bottom-left so it clears the
// wishlist FAB (bottom-right). Deliberately NOT a blocking modal: a small banner
// using a reasonable amount of screen space avoids Google's intrusive-interstitial
// penalty. Dismissal is remembered per browser.
const KEY = "ow_showroom_banner_dismissed";

export default function ShowroomBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try { if (localStorage.getItem(KEY) !== "1") setShow(true); } catch { setShow(true); }
  }, []);

  // Don't show on the showroom page itself, or in the admin/trade app areas.
  const hidden = pathname === "/showroom" || pathname.startsWith("/admin") || pathname.startsWith("/trade");
  if (!show || hidden) return null;

  return (
    <div role="region" aria-label="Showroom announcement"
      style={{ position: "fixed", left: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 150, maxWidth: "min(420px, calc(100vw - 92px))", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px 11px 15px", borderRadius: 14, background: "var(--surface, #fbfaf6)", border: "1px solid var(--line, #e6e2d8)", boxShadow: "0 16px 40px -18px rgba(32,48,58,.5)", fontFamily: "var(--font-manrope, system-ui, sans-serif)" }}>
      <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>🏗️</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink, #20303a)", lineHeight: 1.3 }}>Our new showroom is underway</div>
        <Link href="/showroom" onClick={() => setShow(false)} style={{ fontSize: 13, fontWeight: 700, color: "var(--accent, #d06a45)", textDecoration: "none" }}>Learn more &rarr;</Link>
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => { try { localStorage.setItem(KEY, "1"); } catch {} setShow(false); }}
        style={{ flex: "none", width: 26, height: 26, borderRadius: "50%", border: "none", background: "color-mix(in srgb, var(--ink, #20303a) 8%, transparent)", color: "var(--muted, #8a959b)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
    </div>
  );
}
