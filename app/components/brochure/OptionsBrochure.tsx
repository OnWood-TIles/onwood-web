"use client";
import type { OptionBlock, OptionsBrochureData } from "../../../lib/optionsBrochureLayout";
import { H } from "../../../lib/optionsBrochureLayout";
import OptionsDrawing from "../shop/OptionsDrawing";
import { BROCHURE_CSS, CARD, DEEP, FONTS_HREF, Foot, Img, INK, LINE, Logo, MUTED, TEAL, TERRA, useFitToScreen, type BrochureContact } from "./FamilyBrochure";

// Brochure for a made-to-order product with options (Marquis vanities, mirrors,
// shavers): same look as the tile brochure, but the inside pages are every size with
// its line drawing, then every option (benchtops, basins, finishes, handles, extras).
// Block heights come from lib/optionsBrochure.ts H, which packed the pages.

const mono = (size: number, color = MUTED) => ({ font: `400 ${size}px/1.35 'Space Mono',monospace`, letterSpacing: ".08em", textTransform: "uppercase" as const, color });
const clamp = (lines: number) => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical" as const, overflow: "hidden" });

function PageHead({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 52px 20px", borderBottom: `1px solid ${LINE}` }}>
      <Logo h={17} />
      <span style={{ font: "400 10px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: MUTED }} className="clip">{label}</span>
    </div>
  );
}

function Block({ b }: { b: OptionBlock }) {
  if (b.kind === "group") {
    return (
      <div style={{ height: H.group + (b.help ? H.groupHelp : 0), display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 12, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, background: TERRA, transform: "rotate(45deg)", flex: "none" }} />
          <h2 style={{ margin: 0, font: "800 24px/1.1 Archivo,sans-serif", letterSpacing: "-.02em" }}>{b.title}{b.continued && <em style={{ font: "italic 400 20px Newsreader,serif", color: MUTED }}> continued</em>}</h2>
        </div>
        {b.help && <p style={{ margin: "6px 0 0 18px", font: "400 12.5px/1.3 Manrope,sans-serif", color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.help}</p>}
      </div>
    );
  }
  if (b.kind === "section") return <div style={{ height: H.section, display: "flex", alignItems: "center", ...mono(10, TEAL), fontWeight: 700 }}>{b.title}</div>;
  if (b.kind === "list") {
    return (
      <div style={{ height: H.list, display: "grid", gridTemplateColumns: b.items.length > 1 ? "1fr 1fr" : "1fr", gap: 24, borderBottom: `1px solid ${LINE}`, alignItems: "center" }}>
        {b.items.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, whiteSpace: "nowrap" }}>
            <span style={{ font: "600 13px Manrope,sans-serif", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
            {it.detail && <span style={{ ...mono(9), overflow: "hidden", textOverflow: "ellipsis" }}>{it.detail}</span>}
          </div>
        ))}
      </div>
    );
  }
  const rowH = H.swatch[b.cols] + (b.withDetail ? H.detail : 0);
  const labelH = 34 + (b.withDetail ? H.detail : 0);
  return (
    <div style={{ height: rowH, marginBottom: H.rowGap, display: "grid", gridTemplateColumns: `repeat(${b.cols},1fr)`, gap: 12 }}>
      {b.items.map((it, i) => (
        <div key={i} style={{ minWidth: 0 }}>
          <div style={{ height: rowH - labelH, borderRadius: 10, border: `1px solid ${LINE}`, overflow: "hidden", background: b.fit === "contain" ? "#fff" : "#eee8dc", padding: b.fit === "contain" ? 6 : 0, boxSizing: "border-box" }}>
            <Img src={it.image} alt={it.label} fit={b.fit} />
          </div>
          <div style={{ height: labelH, paddingTop: 6, boxSizing: "border-box" }}>
            <div style={{ font: `600 ${b.cols >= 8 ? 10.5 : 11.5}px/1.25 Manrope,sans-serif`, ...clamp(2) }}>{it.label}</div>
            {b.withDetail && it.detail && <div style={{ ...mono(8.5), marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OptionsBrochure({ data, contact }: { data: OptionsBrochureData; contact: BrochureContact }) {
  useFitToScreen();
  const { name, accentWord, eyebrow, description, rangeSummary, hero, photos, stats, drawing, sizeTitle, sizePages, optionPages, specs, buildUrl, qrSvg } = data;
  const full = `${name} ${accentWord}`;
  const L = name.length;
  const h1Size = L <= 11 ? 82 : L <= 15 ? 68 : L <= 20 ? 56 : L <= 26 ? 46 : 38;
  const sizeCount = sizePages.reduce((a, p) => a + p.length, 0);
  let page = 1; // cover is sheet 1 (unnumbered)
  const pn = () => ++page;
  const shortUrl = buildUrl.replace(/^https:\/\//, "");

  return (
    <>
      <link rel="stylesheet" href={FONTS_HREF} />
      <style>{BROCHURE_CSS}</style>

      <div className="print-bar">
        <span style={{ display: "flex", alignItems: "center", gap: 11 }}><Logo onDark h={20} /><span style={{ font: "400 11px 'Space Mono',monospace", opacity: .7, letterSpacing: ".12em" }}>{full} brochure</span></span>
        <button className="print-btn" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="bx-wrap bx-pad">
        {/* ── COVER ── */}
        <div className="page">
          <div style={{ height: 700, position: "relative" }}>
            <Img src={hero} alt={full} />
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: 170, background: "linear-gradient(180deg,rgba(14,26,32,.55),rgba(14,26,32,0))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 40, left: 52, display: "flex", alignItems: "center", gap: 18 }}>
              <Logo onDark h={66} />
              <span style={{ width: 1, height: 42, background: "rgba(246,241,232,.5)" }} />
              <span style={{ font: "400 20px/1.15 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(246,241,232,.92)" }} className="clip">{full}</span>
            </div>
          </div>
          <div style={{ margin: "-118px 52px 0", position: "relative", background: "#fbfaf6", borderRadius: 24, padding: "36px 40px 32px", boxShadow: "0 40px 90px -32px rgba(16,28,30,.5)", maxWidth: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 9, height: 9, background: TERRA, transform: "rotate(45deg)" }} />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h1 style={{ margin: 0, font: `900 ${h1Size}px/0.96 Archivo,sans-serif`, letterSpacing: "-.03em", overflowWrap: "anywhere" }}>{name}<br /><em style={{ font: `italic 400 ${h1Size}px/0.98 Newsreader,serif`, color: TEAL }}>{accentWord}</em></h1>
            <p style={{ margin: "20px 0 0", font: "400 16.5px/1.6 Manrope,sans-serif", color: MUTED, maxWidth: "46ch", ...clamp(10) }}>{description}</p>
          </div>
        </div>

        {/* ── THE RANGE ── */}
        <div className="page">
          <PageHead label={`${full} · the range`} />
          <div style={{ padding: "30px 52px 0", display: "grid", gridTemplateColumns: "1fr 268px", gap: 36, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: TEAL }} /><span className="eyebrow">01 · The range</span></div>
              <h2 style={{ margin: "0 0 14px", font: "800 34px/1.05 Archivo,sans-serif", letterSpacing: "-.025em" }}>Made to order, <em style={{ font: "italic 400 34px/1.05 Newsreader,serif", color: TEAL }}>your way</em></h2>
              <p style={{ margin: 0, font: "400 15px/1.65 Manrope,sans-serif", color: MUTED }}>{rangeSummary}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {stats.map((s, i) => (
                <div key={i} className="statc"><div className="sk">{s.k}</div><div style={{ marginTop: 5, font: `800 ${s.v.length > 5 ? 17 : 24}px/1.1 Archivo,sans-serif` }}>{s.v}</div></div>
              ))}
            </div>
          </div>
          {photos.length > 0 && (
            <div style={{ padding: "32px 52px 0", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: photos.length > 1 ? "1.4fr 1fr" : "1fr", gridTemplateRows: photos.length > 2 ? "1fr 1fr" : "1fr", gap: 14, marginBottom: 26 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ borderRadius: 14, border: `1px solid ${LINE}`, overflow: "hidden", gridRow: i === 0 && photos.length > 2 ? "1 / span 2" : undefined, minHeight: 0 }}><Img src={p} alt={full} /></div>
              ))}
            </div>
          )}
          <Foot web={contact.website} mid="Photos show example builds" n={pn()} />
        </div>

        {/* ── SIZES (4 x 4 cards a page) ── */}
        {sizePages.map((cards, pi) => (
          <div className="page" key={`sz-${pi}`}>
            <PageHead label={`${sizeTitle}s · ${full}${sizePages.length > 1 ? ` (${pi + 1}/${sizePages.length})` : ""}`} />
            <div style={{ padding: "24px 52px 0" }}>
              <div style={{ height: 80 }}>
                <h2 style={{ margin: "0 0 6px", font: "800 26px/1.1 Archivo,sans-serif", letterSpacing: "-.02em" }}>{pi === 0 ? <>Sizes &amp; <em style={{ font: "italic 400 26px Newsreader,serif", color: TEAL }}>layouts</em></> : <>Sizes &amp; layouts <em style={{ font: "italic 400 22px Newsreader,serif", color: MUTED }}>continued</em></>}</h2>
                {pi === 0 && <p style={{ margin: 0, font: "400 13px/1.5 Manrope,sans-serif", color: MUTED }}>{sizeCount} size{sizeCount === 1 ? "" : "s"}. Every size takes any of the finishes, benchtops and extras on the following pages.</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: 206, gap: 12 }}>
                {cards.map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "10px 11px", display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                    <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {drawing !== "none" && <OptionsDrawing style={drawing} meta={c.meta} size={146} dims={false} />}
                    </div>
                    <div style={{ marginTop: 6, font: "800 13px/1.2 Archivo,sans-serif" }}>{c.label}</div>
                    {c.detail && <div style={{ marginTop: 3, ...mono(8.5), ...clamp(3) }}>{c.detail}</div>}
                    {c.mounts && <div style={{ marginTop: "auto", paddingTop: 5, font: "700 9.5px/1.3 Manrope,sans-serif", color: TEAL, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.mounts}</div>}
                    {c.layouts.length > 0 && <div style={{ marginTop: 2, font: "400 9.5px/1.3 Manrope,sans-serif", color: MUTED, ...clamp(2) }}>{c.layouts.join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </div>
            <Foot web={contact.website} mid="Drawings are illustrations, not to scale" n={pn()} />
          </div>
        ))}

        {/* ── OPTIONS (packed in lib/optionsBrochure.ts) ── */}
        {optionPages.map((blocks, pi) => (
          <div className="page" key={`op-${pi}`}>
            <PageHead label={`Options · ${full}`} />
            <div style={{ padding: "18px 52px 0" }}>
              {blocks.map((b, i) => <Block key={i} b={b} />)}
            </div>
            <Foot web={contact.website} mid="Confirm colours from a physical sample" n={pn()} />
          </div>
        ))}

        {/* ── SPECIFICATION + BUILD ONLINE + CONTACT ── */}
        <div className="page">
          <PageHead label={`Specification · ${full}`} />
          <div style={{ padding: "26px 52px 0" }}>
            <h2 style={{ margin: "0 0 12px", font: "800 26px/1.1 Archivo,sans-serif", letterSpacing: "-.02em" }}>Specification</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
              {specs.map((r, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${LINE}` }}>
                  <div className="sk">{r.k}</div>
                  <div style={{ marginTop: 3, font: "500 12px/1.4 Manrope,sans-serif", color: INK, ...clamp(3) }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ margin: "auto 52px 22px", background: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 104, height: 104, flex: "none" }} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Build and price yours</div>
              <div style={{ font: "800 21px/1.15 Archivo,sans-serif", letterSpacing: "-.01em" }}>Pick your size, finish, benchtop and basin online <em style={{ font: "italic 400 21px Newsreader,serif", color: TEAL }}>and see the price</em></div>
              <div style={{ marginTop: 8, font: "600 12px Manrope,sans-serif", color: TEAL }}>{shortUrl}</div>
            </div>
          </div>

          <div style={{ padding: "24px 52px 22px", background: DEEP, color: "#F6F1E8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <Logo onDark h={34} />
              <span style={{ width: 1, height: 24, background: "rgba(246,241,232,.35)" }} />
              <span style={{ font: "400 9.5px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(246,241,232,.6)" }}>OnWood Tiles</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: "14px 44px" }}>
              {[["Showroom", contact.address], ["Hours", contact.hours], ["Phone", contact.phone], ["Email", contact.email], ["Book a visit", contact.website + contact.bookUrl], ["ABN", contact.abn]].filter(([, v]) => v).map(([k, v], i) => (
                <div key={i}>
                  <div style={{ font: "400 9px/1.4 'Space Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(246,241,232,.5)" }}>{k}</div>
                  <div style={{ marginTop: 5, font: "500 12px/1.5 Manrope,sans-serif", color: "rgba(246,241,232,.9)" }}>{String(v).split(", ").map((line, j) => <div key={j}>{line}</div>)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid rgba(246,241,232,.16)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, font: "400 9.5px/1 'Space Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(246,241,232,.55)" }}>
              <span style={{ fontWeight: 700, color: "#F6F1E8", letterSpacing: ".14em" }}>{contact.website}</span>
              <span>Made to order · confirm finishes from a physical sample</span>
              <span>{pn()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
