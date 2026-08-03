"use client";
import type { BrochureData } from "../../../lib/brochure";

// Per-family product brochure. Ports the OnWood "Claude Design" brochure look
// (Archivo/Manrope/Newsreader/Space Mono, cream paper, terracotta + teal accents)
// into a data-driven, print-to-PDF A4 sheet. Pages are 794×1123px = A4 @ 96dpi.

export type BrochureContact = {
  website: string; address: string; phone: string; email: string; hours: string; abn: string; bookUrl: string;
};

const INK = "#20303a", MUTED = "#6b7a80", CREAM = "#fbfaf6", CARD = "#FBF8F1", TEAL = "#1e7a8c", TERRA = "#d06a45", DEEP = "#0e1a20", LINE = "rgba(32,48,58,.12)";
const PH = "repeating-linear-gradient(135deg,#f0eae0 0 9px,#e7e0d2 9px 18px)";

// Image with an on-image colour caption. White text on a translucent dark chip
// (blurred) so the label stays legible over any photo, per Reagan's request.
function Img({ src, alt, caption, captionPos = "bl", radius }: { src: string | null; alt: string; caption?: string | null; captionPos?: "bl" | "tr"; radius?: number }) {
  const cpos = captionPos === "tr" ? { top: 12, right: 12 } : { left: 9, bottom: 9 };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: radius }}>
      {src ? <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={{ width: "100%", height: "100%", background: PH }} />}
      {caption ? (
        <span style={{ position: "absolute", ...cpos, maxWidth: "calc(100% - 24px)", background: "rgba(14,26,32,.62)", color: "#F6F1E8", font: "400 9px/1 'Space Mono',monospace", letterSpacing: ".07em", textTransform: "uppercase", padding: "4px 7px", borderRadius: 4, backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{caption}</span>
      ) : null}
    </div>
  );
}

const Foot = ({ web, mid, n }: { web: string; mid: string; n: number }) => (
  <div className="foot"><span style={{ fontWeight: 700, color: INK, letterSpacing: ".13em" }}>{web}</span><span>{mid}</span><span>{n}</span></div>
);

// Real OnWood logo: white lockup on dark backgrounds, dark ink on light.
const Logo = ({ onDark, h }: { onDark?: boolean; h: number }) => (
  <img src={onDark ? "/onwood-logo-white.png" : "/onwood-logo-ink-tight.png"} alt="OnWood Tiles" style={{ height: h, width: "auto", display: "block" }} />
);

export default function FamilyBrochure({ data, contact }: { data: BrochureData; contact: BrochureContact }) {
  const { familyName, accentWord, eyebrow, description, rangeSummary, hero, colours, installed, stats, specs, options, department, accessories } = data;
  const STONE = department === "stone-cladding";
  const installCopy = STONE
    ? "Fix over a clean, sound substrate with a flexible cement-based adhesive. Apply the corners first, alternating long and short returns, then fill in the bodies. Dry-stack for a tight mortarless look, or point with an 8-12mm mortar joint. Work from several boxes at once so colour and size spread naturally."
    : "Lay with a flexible tile adhesive and grout to spec. Rectified edges suit a 2mm joint. Shuffle tiles from several boxes as you lay so the faces distribute evenly and no pattern repeats.";
  const careCopy = STONE
    ? "Little upkeep is needed, just brush or hose off dust. Seal with a penetrating stone sealer to keep the fresh-quarried colour, or leave it unsealed to weather to an aged, European patina. Keep stone at least 25cm from a naked flame."
    : "Sweep, then mop with a pH-neutral cleaner. No wax, no acid, no abrasive pads. Porcelain needs no sealing and will not pit.";
  const showOptions = options.length > 1;
  const bigOptions = showOptions && options.length > 6; // large families get their own page
  const instHero = installed[1] ?? installed[0] ?? hero; // distinct from the cover hero
  const instThumbs = installed.slice(2, 4);
  // Bigger colourway swatches when there are few colours; shrink for large sets so they still fit the page.
  const swatchH = colours.length <= 6 ? 150 : colours.length <= 9 ? 122 : 96;
  // Auto-shrink the cover headline so long names (e.g. "Harper Shower Channel Waste") don't run off the page.
  const L = familyName.length;
  const h1Size = L <= 11 ? 82 : L <= 15 ? 68 : L <= 20 ? 56 : L <= 26 ? 46 : L <= 34 ? 38 : 32;
  let page = 1; // cover is sheet 1 (unnumbered); footers number from 2
  const pn = () => ++page;

  // Image captions: full product name + colour (except colourways, which stay colour-only).
  const cap = (p?: { product: string; colour: string } | null) => (p ? `${p.product} · ${p.colour}` : undefined);

  const optionCard = (o: (typeof options)[number], compact: boolean) => (
    <div style={{ background: "#fff", border: "1px solid rgba(32,48,58,.12)", borderRadius: 14, padding: compact ? 11 : 14, outline: o.current ? `1.5px solid ${TEAL}` : undefined }}>
      <div style={{ height: compact ? 84 : 96, borderRadius: 8, overflow: "hidden" }}><Img src={o.image} alt={o.name} caption={o.colour ? `${o.name} · ${o.colour}` : o.name} /></div>
      <div style={{ marginTop: 10, font: `700 ${compact ? 12 : 13}px/1.3 Manrope,sans-serif` }}>{o.name}</div>
      {o.size && <div style={{ marginTop: 4, font: "400 9px/1.4 'Space Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase", color: MUTED }}>{o.size}</div>}
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Manrope:wght@400;500;600;700&family=Newsreader:ital,wght@1,400&family=Space+Mono:wght@400;700&display=swap" />
      <style>{`
        .bx-wrap{display:flex;flex-direction:column;align-items:center;gap:26px;padding:34px 20px;background:#e6e2d9;min-height:100vh;font-family:Manrope,system-ui,sans-serif}
        .page{width:794px;height:1123px;background:${CREAM};color:${INK};display:flex;flex-direction:column;border:1px solid ${LINE};border-radius:8px;box-shadow:0 30px 70px -34px rgba(16,28,30,.55);overflow:hidden;position:relative}
        .sr{display:flex;justify-content:space-between;gap:14px;padding:9.5px 0;border-bottom:1px solid ${LINE}}
        .sk{font:400 10px/1.4 'Space Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};white-space:nowrap}
        .sv{font:600 13px/1.4 Manrope,sans-serif;text-align:right}
        .eyebrow{font:600 11.5px/1 'Space Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:${MUTED}}
        .foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 52px 24px;border-top:1px solid ${LINE};font:400 10.5px/1 'Space Mono',monospace;letter-spacing:.11em;text-transform:uppercase;color:${MUTED}}
        .statc{background:${CARD};border:1px solid ${LINE};border-radius:16px;padding:14px}
        .h3d{margin:0 0 13px;display:flex;align-items:center;gap:9px;font:800 14px/1 Archivo,sans-serif;letter-spacing:.05em;text-transform:uppercase}
        .clip{max-width:56%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .foot span:nth-child(2){max-width:52%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
        .print-bar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 22px;background:${DEEP};color:${CREAM};font-family:Manrope,sans-serif}
        .print-btn{appearance:none;border:none;cursor:pointer;background:${TERRA};color:#fff;border-radius:999px;padding:10px 22px;font:700 14px Manrope,sans-serif}
        .bx-pad{padding-top:60px}
        @page{size:A4;margin:0}
        @media print{
          .print-bar{display:none!important}
          .bx-wrap{background:#fff!important;padding:0!important;gap:0!important}
          .bx-pad{padding-top:0!important}
          .page{box-shadow:none!important;border:none!important;border-radius:0!important;break-after:page;page-break-after:always}
          .page:last-child{break-after:auto}
        }
      `}</style>

      <div className="print-bar">
        <span style={{ display: "flex", alignItems: "center", gap: 11 }}><Logo onDark h={20} /><span style={{ font: "400 11px 'Space Mono',monospace", opacity: .7, letterSpacing: ".12em" }}>{familyName} brochure</span></span>
        <button className="print-btn" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="bx-wrap bx-pad">
        {/* ── P1 COVER ── */}
        <div className="page">
          <div style={{ height: 700, position: "relative" }}>
            <Img src={hero?.src ?? null} alt={`${familyName} installed`} caption={cap(hero)} captionPos="tr" />
            <div style={{ position: "absolute", inset: "0 0 auto 0", height: 170, background: "linear-gradient(180deg,rgba(14,26,32,.55),rgba(14,26,32,0))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 40, left: 52, display: "flex", alignItems: "center", gap: 18 }}>
              <Logo onDark h={66} />
              <span style={{ width: 1, height: 42, background: "rgba(246,241,232,.5)" }} />
              <span style={{ font: "400 20px/1.15 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(246,241,232,.92)" }} className="clip">{familyName}</span>
            </div>
          </div>
          <div style={{ margin: "-118px 52px 0", position: "relative", background: CREAM, borderRadius: 24, padding: "36px 40px 32px", boxShadow: "0 40px 90px -32px rgba(16,28,30,.5)", maxWidth: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 9, height: 9, background: TERRA, transform: "rotate(45deg)" }} />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h1 style={{ margin: 0, font: `900 ${h1Size}px/0.96 Archivo,sans-serif`, letterSpacing: "-.03em", overflowWrap: "anywhere" }}>{familyName}<br /><em style={{ font: `italic 400 ${h1Size}px/0.98 Newsreader,serif`, color: TEAL }}>{accentWord}</em></h1>
            <p style={{ margin: "20px 0 0", font: "400 16.5px/1.6 Manrope,sans-serif", color: MUTED, maxWidth: "46ch" }}>{description}</p>
          </div>
        </div>

        {/* ── P2 THE RANGE ── */}
        <div className="page">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 52px 22px" }}>
            <Logo h={17} />
            <span style={{ font: "400 10px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: MUTED }} className="clip">{familyName} · the range</span>
          </div>
          <div style={{ padding: "8px 52px 0", display: "grid", gridTemplateColumns: "1fr 268px", gap: 36, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: TEAL }} /><span className="eyebrow">01 · The range</span>
              </div>
              <h2 style={{ margin: "0 0 14px", font: "800 34px/1.05 Archivo,sans-serif", letterSpacing: "-.025em" }}>A single look, <em style={{ font: "italic 400 34px/1.05 Newsreader,serif", color: TEAL }}>every format</em></h2>
              <p style={{ margin: 0, font: "400 15px/1.65 Manrope,sans-serif", color: MUTED }}>{rangeSummary}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {stats.map((s, i) => (
                <div key={i} className="statc"><div className="sk">{s.k}</div><div style={{ marginTop: 5, font: `800 ${s.v.length > 4 ? 18 : 24}px/1.1 Archivo,sans-serif` }}>{s.v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ padding: "30px 52px 0" }}>
            <h3 className="h3d"><span style={{ width: 8, height: 8, background: TERRA, transform: "rotate(45deg)" }} />{colours.length} colourway{colours.length === 1 ? "" : "s"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13 }}>
              {colours.map((c, i) => (
                <div key={i}>
                  <div style={{ height: swatchH, borderRadius: 12, border: "1px solid rgba(32,48,58,.12)", overflow: "hidden", background: c.hex || "#e7e2d6" }}><Img src={c.image} alt={c.name} caption={c.name} /></div>
                  {c.sub && <div style={{ marginTop: 6, font: "400 9.5px/1.3 'Space Mono',monospace", letterSpacing: ".1em", textTransform: "uppercase", color: MUTED }}>{c.sub}</div>}
                </div>
              ))}
            </div>
          </div>
          <Foot web={contact.website} mid="Colours vary with screen · confirm from a sample" n={pn()} />
        </div>

        {/* ── P3 SEE IT INSTALLED (only when we have room photos) ── */}
        {installed.length > 0 && (
          <div className="page">
            <div style={{ height: 560, position: "relative" }}><Img src={instHero?.src ?? null} alt={`${familyName} installed`} caption={cap(instHero)} /></div>
            <div style={{ padding: "30px 52px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 34 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: TEAL }} /><span className="eyebrow">02 · Room visuals</span></div>
                <h2 style={{ margin: 0, font: "800 38px/1.04 Archivo,sans-serif", letterSpacing: "-.025em" }}>See it in a <em style={{ font: "italic 400 38px/1.04 Newsreader,serif", color: TEAL }}>space</em></h2>
              </div>
              <p style={{ margin: 0, maxWidth: "36ch", font: "400 14.5px/1.62 Manrope,sans-serif", color: MUTED }}>A look at how {familyName} can transform a space, to help you picture it in your own home before you commit.</p>
            </div>
            {instThumbs.length > 0 && (
              <div style={{ padding: "26px 52px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {instThumbs.map((t, i) => (
                  <div key={i} style={{ height: 212, borderRadius: 14, border: "1px solid rgba(32,48,58,.12)", overflow: "hidden" }}><Img src={t.src} alt="installed" caption={cap(t)} /></div>
                ))}
              </div>
            )}
            <Foot web={contact.website} mid="Indicative room visuals" n={pn()} />
          </div>
        )}

        {/* ── ACCESSORIES (stone cladding: corners + capping + pier caps) ── */}
        {accessories.length > 0 && (
          <div className="page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 52px 20px", borderBottom: `1px solid ${LINE}` }}>
              <Logo h={17} />
              <span style={{ font: "400 10px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: MUTED }} className="clip">Accessories · {familyName}</span>
            </div>
            <div style={{ padding: "26px 52px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: TEAL }} /><span className="eyebrow">Complete the range</span></div>
              <h2 style={{ margin: "0 0 6px", font: "800 30px/1.06 Archivo,sans-serif", letterSpacing: "-.025em" }}>Finish it in <em style={{ font: "italic 400 30px/1.06 Newsreader,serif", color: TEAL }}>solid stone</em></h2>
              <p style={{ margin: "0 0 22px", maxWidth: "62ch", font: "400 14px/1.6 Manrope,sans-serif", color: MUTED }}>Matching finishing pieces so your {familyName} project reads as solid stone from corner to cap. All handcrafted in the same range of colours.</p>
              <div style={{ display: "grid", gap: 22 }}>
                {accessories.map((a, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, font: "800 15px/1 Archivo,sans-serif", letterSpacing: ".04em", textTransform: "uppercase" }}>{a.name}</h3>
                      <span style={{ font: "400 9.5px/1 'Space Mono',monospace", letterSpacing: ".1em", textTransform: "uppercase", color: TERRA }}>{a.spec}</span>
                    </div>
                    <p style={{ margin: "0 0 10px", maxWidth: "70ch", font: "400 12.5px/1.55 Manrope,sans-serif", color: MUTED }}>{a.blurb}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 9 }}>
                      {a.photos.slice(0, 6).map((p, j) => (
                        <div key={j} style={{ height: 104, borderRadius: 10, border: "1px solid rgba(32,48,58,.12)", overflow: "hidden" }}><Img src={p.src} alt={p.colour} caption={p.colour} /></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Foot web={contact.website} mid="Corners, capping & pier caps to suit" n={pn()} />
          </div>
        )}

        {/* ── DEDICATED AVAILABLE OPTIONS PAGE (large families) ── */}
        {bigOptions && (
          <div className="page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 52px 20px", borderBottom: `1px solid ${LINE}` }}>
              <Logo h={17} />
              <span style={{ font: "400 10px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: MUTED }} className="clip">Available options · {familyName}</span>
            </div>
            <div style={{ padding: "26px 52px 0" }}>
              <h2 style={{ margin: "0 0 4px", font: "800 26px/1.1 Archivo,sans-serif", letterSpacing: "-.02em" }}>Available options</h2>
              <p style={{ margin: "0 0 18px", font: "400 13px/1.5 Manrope,sans-serif", color: MUTED }}>{options.length} sizes and finishes in the {familyName} family.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
                {options.map((o, i) => <div key={i}>{optionCard(o, true)}</div>)}
              </div>
            </div>
            <Foot web={contact.website} mid={`${options.length} options in the range`} n={pn()} />
          </div>
        )}

        {/* ── SPECIFICATION (+ inline options for small families) ── */}
        <div className="page">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 52px 20px", borderBottom: `1px solid ${LINE}` }}>
            <Logo h={17} />
            <span style={{ font: "400 10px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: MUTED }} className="clip">Specification · {familyName}</span>
          </div>
          <div style={{ padding: "28px 52px 0" }}>
            <h2 style={{ margin: "0 0 14px", font: "800 26px/1.1 Archivo,sans-serif", letterSpacing: "-.02em" }}>Specification</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 44px" }}>
              {specs.map((r, i) => (<div key={i} className="sr"><span className="sk">{r.k}</span><span className="sv">{r.v}</span></div>))}
            </div>
          </div>

          {showOptions && !bigOptions && (
            <div style={{ padding: "30px 52px 0" }}>
              <h3 className="h3d"><span style={{ width: 8, height: 8, background: TERRA, transform: "rotate(45deg)" }} />Available options</h3>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(options.length, 3)},1fr)`, gap: 12 }}>
                {options.map((o, i) => <div key={i}>{optionCard(o, false)}</div>)}
              </div>
            </div>
          )}

          <div style={{ padding: "26px 52px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <h3 style={{ margin: "0 0 10px", font: "800 14px/1 Archivo,sans-serif", letterSpacing: ".05em", textTransform: "uppercase" }}>Installation</h3>
              <p style={{ margin: 0, font: "400 13.5px/1.6 Manrope,sans-serif", color: MUTED }}>{installCopy}</p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 10px", font: "800 14px/1 Archivo,sans-serif", letterSpacing: ".05em", textTransform: "uppercase" }}>Care</h3>
              <p style={{ margin: 0, font: "400 13.5px/1.6 Manrope,sans-serif", color: MUTED }}>{careCopy}</p>
            </div>
          </div>

          <div style={{ marginTop: 26, padding: "26px 52px 24px", background: DEEP, color: "#F6F1E8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <Logo onDark h={36} />
              <span style={{ width: 1, height: 26, background: "rgba(246,241,232,.35)" }} />
              <span style={{ font: "400 9.5px/1 'Space Mono',monospace", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(246,241,232,.6)" }}>OnWood Tiles</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: "17px 44px" }}>
              {[["Showroom", contact.address], ["Hours", contact.hours], ["Phone", contact.phone], ["Email", contact.email], ["Book a visit", contact.website + contact.bookUrl], ["ABN", contact.abn]].filter(([, v]) => v).map(([k, v], i) => (
                <div key={i}>
                  <div style={{ font: "400 9px/1.4 'Space Mono',monospace", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(246,241,232,.5)" }}>{k}</div>
                  <div style={{ marginTop: 6, font: "500 12.5px/1.5 Manrope,sans-serif", color: "rgba(246,241,232,.9)" }} dangerouslySetInnerHTML={{ __html: String(v).replace(/, /g, "<br>") }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(246,241,232,.16)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, font: "400 9.5px/1 'Space Mono',monospace", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(246,241,232,.55)" }}>
              <span style={{ fontWeight: 700, color: "#F6F1E8", letterSpacing: ".14em" }}>{contact.website}</span>
              <span>Confirm all colours and finishes from a physical sample</span>
              <span>{pn()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
