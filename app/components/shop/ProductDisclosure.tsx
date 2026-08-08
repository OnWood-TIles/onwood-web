"use client";

import Link from "next/link";
import { useState } from "react";

// Imagery disclosure for the product page. Full text on desktop; on MOBILE it
// collapses to the first sentence + a "Continue reading" toggle so it doesn't eat
// screen real-estate. Pure CSS decides mobile-vs-desktop; the toggle only matters
// on mobile (desktop always shows the full text and hides the button).
export default function ProductDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`pd ${open ? "pd-open" : ""}`}
      style={{
        margin: "18px 0 0", padding: "14px 16px", borderRadius: 12,
        background: "var(--surface, #f6f1ea)", border: "1px solid var(--line, #e6ded3)",
        fontSize: 12.5, lineHeight: 1.6, color: "#4a5560",
      }}
    >
      <strong style={{ color: "var(--ink, #22303a)" }}>About our images.</strong> Some images on this page are AI-generated or digitally rendered to show how a product may look installed.
      <span className="pd-more"> They are illustrations, not photographs of the actual product. Colour, tone, veining, tile size, scale, layout, grout colour and joint width can differ noticeably from the real thing. Tiles, natural stone and stone veneer also vary naturally between batches. Please confirm your selection from a current physical sample -{" "}
        <Link href="/terms-of-use#ai-imagery" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>read our full imagery disclosure</Link>.
      </span>
      <button type="button" className="pd-toggle" onClick={() => setOpen(true)}> Continue reading…</button>
      <style>{`
        .pd .pd-more{display:none}
        .pd .pd-toggle{display:inline;border:none;background:none;color:var(--accent);font-weight:700;cursor:pointer;padding:0;font-family:inherit;font-size:12.5px}
        .pd.pd-open .pd-more{display:inline}
        .pd.pd-open .pd-toggle{display:none}
        @media(min-width:768px){
          .pd .pd-more{display:inline}
          .pd .pd-toggle{display:none}
        }
      `}</style>
    </div>
  );
}
