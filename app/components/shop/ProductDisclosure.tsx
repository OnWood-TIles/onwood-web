"use client";

import Link from "next/link";
import { useState } from "react";

// Imagery disclosure for the product page. Full text on desktop; on MOBILE it
// collapses to the first sentence + a "Continue reading" toggle so it doesn't eat
// screen real-estate. Pure CSS decides mobile-vs-desktop; the toggle only matters
// on mobile (desktop always shows the full text and hides the button).
// Vanities + mirrors are made to order with chosen finishes, so the tile/stone
// wording (veining, grout, batches) is swapped for finish/configuration wording.
const MADE_TO_ORDER = new Set(["vanities", "mirrors", "bathroom-storage"]);

export default function ProductDisclosure({ department, categories = [] }: { department?: string | null; categories?: string[] }) {
  const madeToOrder = !!department && MADE_TO_ORDER.has(department);
  const [open, setOpen] = useState(false);
  // Tiling supplies: grout + silicone pages show colour swatches, so the note that matters is
  // colour; the rest (membranes, prep, cleaners) just point to the data sheet.
  if (department === "adhesives") {
    const box = { margin: "18px 0 0", padding: "14px 16px", borderRadius: 12, background: "var(--surface, #f6f1ea)", border: "1px solid var(--line, #e6ded3)", fontSize: 12.5, lineHeight: 1.6, color: "#4a5560" };
    if (categories.some((c) => c === "grout" || c === "sealants")) {
      return (
        <div style={box}>
          <strong style={{ color: "var(--ink, #22303a)" }}>About colours.</strong> Grout and silicone colours on screen are a guide only, and grout can dry slightly lighter or darker depending on the tile, the joint and the weather. Please check a real colour sample in our Baringa showroom before you buy. Always follow the LATICRETE data sheet for your job.
        </div>
      );
    }
    if (categories.includes("adhesives")) {
      return (
        <div style={box}>
          <strong style={{ color: "var(--ink, #22303a)" }}>Before you start.</strong> Always follow the LATICRETE data sheet for your tile, surface and job.
        </div>
      );
    }
    return (
      <div style={box}>
        <strong style={{ color: "var(--ink, #22303a)" }}>Before you start.</strong> Always follow the data sheet for your surface and job. The photo shows the product in a typical setting; the pack size you receive is the one named on this page.
      </div>
    );
  }
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
      <span className="pd-more"> They are illustrations, not photographs of the actual product. {madeToOrder
          ? "Cabinet colour, timber grain, benchtop colour, handles, size and proportions can differ noticeably from the real thing, and screens show colours differently. Please confirm your finishes from a physical sample or in our showroom before ordering - "
          : "Colour, tone, veining, tile size, scale, layout, grout colour and joint width can differ noticeably from the real thing. Tiles, natural stone and stone veneer also vary naturally between batches. Please confirm your selection from a current physical sample - "}
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
