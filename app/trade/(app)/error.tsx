"use client";

import Link from "next/link";
import { useEffect } from "react";

// Error boundary for the logged-in trade portal. A non-404 error from OnBase (e.g. a
// transient 500 on the order-detail page) would otherwise render Next's default crash
// screen; this shows a friendly, on-brand fallback with retry + back links instead.
// (redirect() from the layout's auth gate throws NEXT_REDIRECT, which Next handles
// itself and never reaches here.)
export default function TradeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[trade portal]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 40, color: "#1F7A74", lineHeight: 1, marginBottom: 18 }}>
          Hmm.
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1D2A32", margin: "0 0 10px" }}>This page is temporarily unavailable</h1>
        <p style={{ fontSize: 15, color: "#5A6067", lineHeight: 1.6, margin: "0 0 24px" }}>
          Something went wrong loading this. Please try again in a moment - if it keeps happening, get in touch and we&rsquo;ll sort it out.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{ background: "#E2703A", color: "#FFF6EE", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 999, border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
          <Link
            href="/trade"
            style={{ background: "#FDFCF8", color: "#1D2A32", fontWeight: 600, fontSize: 15, padding: "13px 28px", borderRadius: 999, border: "1.5px solid rgba(29,42,50,0.16)", textDecoration: "none" }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
