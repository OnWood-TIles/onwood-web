import type { Metadata } from "next";
import { listRanges } from "../../../lib/onbase/client";

export const metadata: Metadata = {
  title: "OnBase debug",
  robots: { index: false, follow: false },
};

// Internal check that the OnBase Website Catalogue feed is wired correctly.
// Empty until the OnBase-side endpoints + ONBASE_API_KEY are live. noindex.
export default async function OnBaseDebug() {
  const ranges = await listRanges();
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "var(--font-manrope), monospace",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        minHeight: "100dvh",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-archivo)" }}>OnBase feed</h1>
      <p style={{ color: "var(--color-muted)" }}>
        {ranges.length} range(s) returned from{" "}
        <code>/api/v1/website/ranges</code>.
      </p>
      <pre
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: 12,
          padding: 20,
          overflow: "auto",
          fontSize: 12.5,
        }}
      >
        {JSON.stringify(ranges, null, 2)}
      </pre>
    </main>
  );
}
