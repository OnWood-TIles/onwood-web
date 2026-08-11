"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

// Root error boundary. Catches runtime errors thrown while rendering marketing
// routes (most hit the external OnBase API, so this is a real fallback path).
// It renders INSIDE the root layout, so brand fonts + CSS tokens (--bg, --ink,
// --accent...) are available. Kept self-contained (no async MarketingFooter,
// no provider-dependent nav) so it stays robust even when the page subtree that
// threw is torn down. A brand-simple header is inlined here.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for debugging / any monitoring hooked to console.
    console.error(error);
  }, [error]);

  return (
    <div
      data-theme="terracotta"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Inlined brand-simple header (the full MarketingNav depends on layout
          providers we don't rely on inside the error boundary). */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 28px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <a href="/" aria-label="OnWood Tiles home" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/onwood-logo-ink-tight.png" alt="OnWood Tiles" style={{ height: 40, width: "auto", display: "block" }} />
        </a>
      </header>

      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "clamp(56px,10vw,110px) 32px" }}>
        <section style={{ maxWidth: 560, textAlign: "center" }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--accent2)",
              marginBottom: 18,
            }}
          >
            Something went wrong
          </div>

          <h1
            style={{
              fontFamily: "var(--font-archivo)",
              fontWeight: 800,
              fontSize: "clamp(30px,4.6vw,50px)",
              letterSpacing: "-.025em",
              lineHeight: 1.05,
              margin: "0 0 18px",
            }}
          >
            A tile came{" "}
            <em style={{ fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 500, color: "var(--accent)" }}>
              loose.
            </em>
          </h1>

          <p
            style={{
              color: "#5a6067",
              fontSize: 17,
              lineHeight: 1.7,
              margin: "0 auto 34px",
              maxWidth: 440,
            }}
          >
            Sorry, something went wrong on our end. It&rsquo;s usually a passing
            hiccup, so give it another go, or head back home.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent)",
                color: "#fff6ee",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--ink)",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 26px",
                borderRadius: 999,
                textDecoration: "none",
                border: "1.5px solid var(--line)",
                background: "var(--surface)",
              }}
            >
              Back to home <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
