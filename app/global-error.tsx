"use client"; // Error boundaries must be Client Components

// Last-resort boundary: catches errors thrown in the ROOT layout itself. This
// REPLACES the layout, so it renders its own <html>/<body> and cannot rely on
// layout fonts, global CSS or the --brand-* tokens. Everything is inlined with
// literal brand hex (cream bg #fbfaf6, teal-ink #20303a, terracotta #d06a45) so
// it renders standalone. Kept deliberately minimal and self-contained.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-AU">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "40px 24px",
          background: "#fbfaf6",
          color: "#20303a",
          fontFamily:
            "'Manrope', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* React <title> works in global-error (metadata exports are not) */}
        <title>Something went wrong | OnWood Tiles</title>

        <main style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c57b4c",
              marginBottom: 16,
            }}
          >
            OnWood Tiles
          </div>

          <h1
            style={{
              fontWeight: 800,
              fontSize: "clamp(28px,5vw,44px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
              margin: "0 0 16px",
            }}
          >
            Something went wrong.
          </h1>

          <p
            style={{
              color: "#5a6067",
              fontSize: 16,
              lineHeight: 1.7,
              margin: "0 auto 30px",
              maxWidth: 380,
            }}
          >
            Sorry, we hit an unexpected problem. Please try again in a moment, or
            head back to our home page.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#d06a45",
                color: "#fff6ee",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 28px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#20303a",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 26px",
                borderRadius: 999,
                textDecoration: "none",
                border: "1.5px solid rgba(32,48,58,0.14)",
                background: "#ffffff",
              }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
