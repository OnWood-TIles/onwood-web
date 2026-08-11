import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Default social-share card for onwoodtiles.com.au — the image that renders when
// a link is shared to Facebook / WhatsApp / iMessage / LinkedIn etc. Applies to
// every route that doesn't define its own opengraph-image. Uses the same
// Instrument Serif + Space Mono treatment as the OnWood mood-board PDF, so the
// share card matches the print brand. Re-exported as twitter-image too.
export const alt = "OnWood Tiles — the Sunshine Coast's home for all things tiles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONTS = join(process.cwd(), "public", "fonts");
const load = async (file: string): Promise<Buffer | null> => {
  try {
    return await readFile(join(FONTS, file));
  } catch {
    return null; // fall back to the built-in font rather than break the build
  }
};
const [serif, mono, monoBold] = await Promise.all([
  load("InstrumentSerif-Regular.ttf"),
  load("SpaceMono-Regular.ttf"),
  load("SpaceMono-Bold.ttf"),
]);

// Brand palette (matches the mood-board PDF / emails).
const CREAM = "#fbfaf6";
const INK = "#20303a";
const TERRA = "#d06a45";
const MUTED = "#4a5760";
const FAINT = "#8a8577";

export default function Image() {
  type Font = { name: string; data: Buffer; weight: 400 | 700; style: "normal" };
  const fonts: Font[] = [];
  if (serif) fonts.push({ name: "Instrument Serif", data: serif, weight: 400, style: "normal" });
  if (mono) fonts.push({ name: "Space Mono", data: mono, weight: 400, style: "normal" });
  if (monoBold) fonts.push({ name: "Space Mono", data: monoBold, weight: 700, style: "normal" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 76,
          backgroundColor: CREAM,
          color: INK,
          fontFamily: "Space Mono",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            color: TERRA,
            display: "flex",
          }}
        >
          SUNSHINE COAST · BARINGA QLD
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 92, height: 8, backgroundColor: TERRA, borderRadius: 4, display: "flex" }} />
          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 132,
              lineHeight: 1,
              marginTop: 26,
              display: "flex",
            }}
          >
            OnWood Tiles
          </div>
          <div style={{ fontSize: 34, color: MUTED, marginTop: 26, maxWidth: 940, lineHeight: 1.4, display: "flex" }}>
            Floor, wall &amp; outdoor tiles — the Sunshine Coast&apos;s new home for all things tiles.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: INK, display: "flex" }}>onwoodtiles.com.au</div>
          <div style={{ fontSize: 24, color: FAINT, display: "flex" }}>Tiles · Stone Veneer</div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
