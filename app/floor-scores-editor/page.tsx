import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Editor from "./Editor";

export const metadata: Metadata = {
  title: "Floor score editor",
  robots: { index: false, follow: false }, // private tuning tool, not for search
};

// Server wrapper (renders the nav + async footer); the interactive table is the
// client <Editor/>. Adjust scores here, copy, and paste back into
// lib/floorScores.ts to update the public flooring guide table.
export default function FloorScoresEditorPage() {
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(96px,13vw,128px) 20px 80px" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>Private tool</p>
        <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.05, margin: "10px 0 12px" }}>Floor score editor</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)", maxWidth: "70ch", margin: "0 0 8px" }}>
          Adjust any score from 1 to 5, where 5 is best for the buyer. The overall out of 100 recalculates live as you type. When you are happy, hit <strong>Copy scores</strong> and send me the result and I will lock it into the live <Link href="/blog/best-floor-covering-for-every-room" style={{ color: "var(--accent)", fontWeight: 700 }}>flooring guide</Link>. Nothing here changes the public page until then.
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", maxWidth: "70ch", margin: "0 0 20px" }}>
          Expansion = dimensional stability (5 = barely moves, no big expansion gaps). Trims = how cleanly it finishes at walls and doorways (5 = tight, few transition strips).
        </p>
        <Editor />
      </main>
      <MarketingFooter />
    </div>
  );
}
