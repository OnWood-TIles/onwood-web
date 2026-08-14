"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MagBlock } from "../../lib/magazine";

// ── Shapes the server hands us (content + resolved imagery) ───────────────
export type TieItem = { name: string; href: string; thumb: string | null };
export type FlipLeaf = {
  id: string;
  kind: "cover" | "letter" | "contents" | "article" | "showcase" | "closing";
  section?: string;
  title?: string;
  titleAccent?: string;
  standfirst?: string;
  readMins?: number;
  blocks?: MagBlock[];
  pullquote?: string;
  contents?: { n: string; title: string; section: string }[];
  heroUrl?: string | null;
  gallery?: string[];
  tie?: TieItem[];
};

const CREAM = "#fbfaf6";
const INK = "#20303a";
const MUTED = "#6b7a80";
const TERRA = "#d06a45";
const TEAL = "#1e7a8c";
const DEEP = "#0e1a20";
const LINE = "rgba(32,48,58,.12)";

// ── Inline figures (no photo shoot required) ──────────────────────────────
function Diagram({ kind }: { kind: "pores" | "offset" | "thermal" }) {
  if (kind === "pores") {
    return (
      <figure className="mag-fig">
        <svg viewBox="0 0 320 150" width="100%" role="img" aria-label="Open pore structure versus a vitrified body">
          <rect x="6" y="20" width="140" height="110" rx="6" fill="#efe7dc" stroke={LINE} />
          <rect x="174" y="20" width="140" height="110" rx="6" fill={TEAL} opacity="0.14" stroke={LINE} />
          {[...Array(22)].map((_, i) => (
            <circle key={i} cx={22 + (i % 6) * 20} cy={38 + Math.floor(i / 6) * 22} r={4.5} fill="#fff" stroke={MUTED} />
          ))}
          {[...Array(22)].map((_, i) => (
            <circle key={i} cx={190 + (i % 6) * 20} cy={38 + Math.floor(i / 6) * 22} r={1.4} fill={TEAL} />
          ))}
          <text x="76" y="146" textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="'Space Mono',monospace">CERAMIC · OPEN PORES</text>
          <text x="244" y="146" textAnchor="middle" fontSize="10" fill={TEAL} fontFamily="'Space Mono',monospace">PORCELAIN · VITRIFIED</text>
        </svg>
        <figcaption>Fire a fine clay hot enough and the pores close. The body stops drinking.</figcaption>
      </figure>
    );
  }
  if (kind === "offset") {
    return (
      <figure className="mag-fig">
        <svg viewBox="0 0 320 170" width="100%" role="img" aria-label="A 50 percent offset stacks the worst points of bowed tiles; a 33 percent offset does not">
          {/* 50% offset row: bows meet */}
          <text x="6" y="16" fontSize="10" fill={TERRA} fontFamily="'Space Mono',monospace">50% OFFSET · lippage adds up</text>
          <path d="M10 46 Q60 30 110 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <path d="M116 46 Q166 62 216 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <path d="M222 46 Q272 30 312 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <line x1="113" y1="34" x2="113" y2="58" stroke={INK} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="113" cy="46" r="3" fill={INK} />
          {/* 33% offset row: bows near flat where they meet */}
          <text x="6" y="112" fontSize="10" fill={TEAL} fontFamily="'Space Mono',monospace">33% OFFSET · joints land near flat</text>
          <path d="M10 140 Q60 124 110 140" fill="none" stroke={TEAL} strokeWidth="3" />
          <path d="M116 140 Q166 156 216 140" fill="none" stroke={TEAL} strokeWidth="3" />
          <path d="M222 140 Q272 124 312 140" fill="none" stroke={TEAL} strokeWidth="3" />
          <line x1="78" y1="128" x2="78" y2="152" stroke={INK} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="78" cy="135" r="3" fill={INK} />
        </svg>
        <figcaption>The bow is exaggerated. At a half offset the high point of one plank meets the low point of the next; at a third it meets the plank much nearer flat.</figcaption>
      </figure>
    );
  }
  return (
    <figure className="mag-fig">
      <svg viewBox="0 0 320 160" width="100%" role="img" aria-label="Indoor temperature lags and flattens against the outdoor swing">
        <line x1="20" y1="130" x2="310" y2="130" stroke={LINE} />
        <line x1="20" y1="20" x2="20" y2="130" stroke={LINE} />
        <path d="M20 96 Q95 20 165 40 Q235 60 310 104" fill="none" stroke={TERRA} strokeWidth="2.5" />
        <path d="M20 104 Q110 74 185 82 Q255 90 310 96" fill="none" stroke={TEAL} strokeWidth="2.5" />
        <text x="250" y="34" fontSize="10" fill={TERRA} fontFamily="'Space Mono',monospace">OUTSIDE</text>
        <text x="60" y="70" fontSize="10" fill={TEAL} fontFamily="'Space Mono',monospace">INSIDE</text>
        <text x="165" y="150" textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="'Space Mono',monospace">A DAY, MORNING TO NIGHT</text>
      </svg>
      <figcaption>A high mass floor flattens the peak and delays it by hours, riding the afternoon on last night's cool.</figcaption>
    </figure>
  );
}

function Blocks({ blocks }: { blocks: MagBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.t === "p") return <p key={i} className="mag-p">{b.text}</p>;
        if (b.t === "h") return <h3 key={i} className="mag-sub">{b.text}</h3>;
        if (b.t === "lead")
          return (
            <p key={i} className="mag-p"><strong className="mag-lead">{b.label}</strong> {b.text}</p>
          );
        if (b.t === "list")
          return (
            <ul key={i} className="mag-ul">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          );
        if (b.t === "note")
          return (
            <aside key={i} className="mag-note">
              {b.label && <div className="mag-note-label">{b.label}</div>}
              <div>{b.text}</div>
            </aside>
          );
        if (b.t === "diagram") return <Diagram key={i} kind={b.kind} />;
        return null;
      })}
    </>
  );
}

function TieIn({ tie }: { tie?: TieItem[] }) {
  if (!tie || !tie.length) return null;
  return (
    <div className="mag-tie">
      <div className="mag-tie-label">In the showroom</div>
      <div className="mag-tie-row">
        {tie.map((t) => (
          <a key={t.href} href={t.href} className="mag-tie-card">
            {t.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.thumb} alt={t.name} loading="lazy" />
            ) : (
              <div className="mag-tie-ph" />
            )}
            <span>{t.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Title({ title, accent, className }: { title?: string; accent?: string; className?: string }) {
  if (!title) return null;
  return (
    <h1 className={className}>
      {title}
      {accent ? <> <em>{accent}</em></> : null}
    </h1>
  );
}

function Leaf({ leaf }: { leaf: FlipLeaf }) {
  // COVER
  if (leaf.kind === "cover") {
    return (
      <div className="mag-cover">
        {leaf.heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mag-cover-img" src={leaf.heroUrl} alt="" />
        )}
        <div className="mag-cover-scrim" />
        <div className="mag-cover-inner">
          <div className="mag-cover-eyebrow">{leaf.section}</div>
          <div className="mag-masthead">{leaf.title}</div>
          <div className="mag-cover-sub">{leaf.standfirst}</div>
          <div className="mag-cover-cue">Flick or press the arrows to read &rsaquo;</div>
        </div>
      </div>
    );
  }

  // CONTENTS
  if (leaf.kind === "contents") {
    return (
      <div className="mag-pad mag-contents">
        <div className="mag-eyebrow">{leaf.section}</div>
        <Title title={leaf.title} accent={leaf.titleAccent} className="mag-h1" />
        <ol className="mag-toc">
          {leaf.contents?.map((c) => (
            <li key={c.n}>
              <span className="mag-toc-n">{c.n}</span>
              <span className="mag-toc-t">{c.title}</span>
              <span className="mag-toc-s">{c.section}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // LETTER / CLOSING share a text-forward layout with a top image
  if (leaf.kind === "letter" || leaf.kind === "closing") {
    return (
      <div className="mag-pad">
        {leaf.heroUrl && (
          <div className="mag-hero mag-hero-wide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={leaf.heroUrl} alt="" />
          </div>
        )}
        <div className="mag-eyebrow">{leaf.section}</div>
        <Title title={leaf.title} accent={leaf.titleAccent} className="mag-h1" />
        {leaf.standfirst && <p className="mag-standfirst">{leaf.standfirst}</p>}
        <div className="mag-body">{leaf.blocks && <Blocks blocks={leaf.blocks} />}</div>
        {leaf.pullquote && <blockquote className="mag-pull">{leaf.pullquote}</blockquote>}
        <TieIn tie={leaf.tie} />
      </div>
    );
  }

  // SHOWCASE
  if (leaf.kind === "showcase") {
    return (
      <div className="mag-pad">
        <div className="mag-eyebrow">{leaf.section}{leaf.readMins ? ` · ${leaf.readMins} min` : ""}</div>
        <Title title={leaf.title} accent={leaf.titleAccent} className="mag-h1" />
        {leaf.standfirst && <p className="mag-standfirst">{leaf.standfirst}</p>}
        <div className="mag-body">{leaf.blocks && <Blocks blocks={leaf.blocks} />}</div>
        {leaf.gallery && leaf.gallery.length > 0 && (
          <div className="mag-gallery">
            {leaf.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}
        <TieIn tie={leaf.tie} />
      </div>
    );
  }

  // ARTICLE
  return (
    <div className="mag-pad">
      <div className="mag-eyebrow">{leaf.section}{leaf.readMins ? ` · ${leaf.readMins} min read` : ""}</div>
      <Title title={leaf.title} accent={leaf.titleAccent} className="mag-h1" />
      {leaf.standfirst && <p className="mag-standfirst">{leaf.standfirst}</p>}
      {leaf.heroUrl && (
        <div className="mag-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leaf.heroUrl} alt="" />
        </div>
      )}
      <div className="mag-body">{leaf.blocks && <Blocks blocks={leaf.blocks} />}</div>
      {leaf.pullquote && <blockquote className="mag-pull">{leaf.pullquote}</blockquote>}
      <TieIn tie={leaf.tie} />
    </div>
  );
}

export default function MagazineFlip({ leaves }: { leaves: FlipLeaf[] }) {
  const [index, setIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const n = leaves.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (to: number) => {
      setIndex((prev) => {
        const next = Math.max(0, Math.min(n - 1, to));
        if (next !== prev) {
          // reset the incoming leaf's scroll to the top
          const el = trackRef.current?.children[next] as HTMLElement | undefined;
          if (el) el.scrollTop = 0;
        }
        return next;
      });
    },
    [n]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(index + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(index - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, n]);

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(index + (dx < 0 ? 1 : -1));
    }
    touch.current = null;
  };

  const tocIndex = leaves.findIndex((l) => l.kind === "contents");

  return (
    <div className="mag-stage">
      {/* Space Mono for editorial labels, loaded like the brochure */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
      />
      <style>{css}</style>

      <div
        className="mag-book"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="mag-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {leaves.map((leaf) => (
            <div className="mag-leaf" key={leaf.id}>
              <Leaf leaf={leaf} />
            </div>
          ))}
        </div>

        {/* Edge tap zones (desktop) */}
        <button className="mag-edge mag-edge-l" aria-label="Previous page" onClick={() => go(index - 1)} disabled={index === 0} />
        <button className="mag-edge mag-edge-r" aria-label="Next page" onClick={() => go(index + 1)} disabled={index === n - 1} />
      </div>

      {/* Controls */}
      <div className="mag-controls">
        <button className="mag-btn" onClick={() => go(index - 1)} disabled={index === 0}>&lsaquo; Prev</button>
        <div className="mag-mid">
          <button className="mag-toc-btn" onClick={() => setShowToc((s) => !s)}>Contents</button>
          <span className="mag-count">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <button className="mag-toc-btn" onClick={() => window.print()}>Print</button>
        </div>
        <button className="mag-btn" onClick={() => go(index + 1)} disabled={index === n - 1}>Next &rsaquo;</button>
      </div>

      {/* progress */}
      <div className="mag-progress"><span style={{ width: `${((index + 1) / n) * 100}%` }} /></div>

      {/* Contents overlay */}
      {showToc && (
        <div className="mag-toc-overlay" onClick={() => setShowToc(false)}>
          <div className="mag-toc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mag-eyebrow" style={{ marginBottom: 14 }}>Jump to</div>
            <button className="mag-jump" onClick={() => { go(0); setShowToc(false); }}>
              <span className="mag-toc-n">00</span><span className="mag-toc-t">Cover</span>
            </button>
            {tocIndex >= 0 && leaves[tocIndex].contents?.map((c) => {
              const li = leaves.findIndex((l) => l.section?.startsWith(c.n));
              return (
                <button key={c.n} className="mag-jump" onClick={() => { if (li >= 0) go(li); setShowToc(false); }}>
                  <span className="mag-toc-n">{c.n}</span>
                  <span className="mag-toc-t">{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Print-only stacked version (each leaf a page) lives in CSS via .mag-leaf */}
    </div>
  );
}

const css = `
.mag-stage{--cream:${CREAM};--ink:${INK};--muted:${MUTED};--terra:${TERRA};--teal:${TEAL};--deep:${DEEP};--line:${LINE};
  display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 16px 30px;background:${DEEP};min-height:100vh}
.mag-book{position:relative;width:min(94vw,880px);height:min(84vh,1180px);background:var(--cream);border-radius:6px;
  box-shadow:0 40px 90px -30px rgba(0,0,0,.6),0 2px 0 rgba(255,255,255,.04);overflow:hidden}
.mag-track{display:flex;height:100%;transition:transform .55s cubic-bezier(.5,0,.1,1);will-change:transform}
.mag-leaf{flex:0 0 100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;
  color:var(--ink);font-family:var(--font-manrope),system-ui,sans-serif}
.mag-leaf::-webkit-scrollbar{width:8px}.mag-leaf::-webkit-scrollbar-thumb{background:var(--line);border-radius:8px}
.mag-pad{padding:clamp(26px,4.4vw,52px)}
.mag-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--terra);margin-bottom:14px}
.mag-h1{font-family:var(--font-archivo),sans-serif;font-weight:900;letter-spacing:-.03em;line-height:.98;
  font-size:clamp(30px,5.4vw,52px);margin:0 0 4px;color:var(--ink)}
.mag-h1 em{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-weight:400;color:var(--teal)}
.mag-standfirst{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-size:clamp(17px,2.4vw,21px);
  line-height:1.5;color:#41535d;margin:18px 0 22px;max-width:46ch}
.mag-hero{border-radius:5px;overflow:hidden;margin:0 0 24px;aspect-ratio:16/10;background:#e9e3d8}
.mag-hero img{width:100%;height:100%;object-fit:cover;display:block}
.mag-hero-wide{aspect-ratio:16/9;margin-bottom:26px}
.mag-body{max-width:62ch}
.mag-p{font-size:clamp(15px,1.7vw,16.5px);line-height:1.72;margin:0 0 16px;color:#28363f}
.mag-lead{color:var(--ink);font-weight:800}
.mag-sub{font-family:var(--font-archivo),sans-serif;font-weight:800;letter-spacing:-.01em;font-size:clamp(18px,2.3vw,22px);
  margin:26px 0 12px;color:var(--ink)}
.mag-ul{margin:2px 0 18px;padding-left:0;list-style:none;max-width:62ch}
.mag-ul li{position:relative;padding-left:22px;margin:0 0 11px;font-size:15.5px;line-height:1.62;color:#28363f}
.mag-ul li::before{content:"";position:absolute;left:2px;top:9px;width:7px;height:7px;background:var(--teal);border-radius:2px;transform:rotate(45deg)}
.mag-note{background:#fff;border:1px solid var(--line);border-left:3px solid var(--terra);border-radius:4px;
  padding:16px 18px;margin:22px 0;max-width:56ch;font-size:14px;line-height:1.6;color:#3a4750}
.mag-note-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--terra);margin-bottom:7px}
.mag-fig{margin:24px 0;max-width:60ch}
.mag-fig svg{background:#fff;border:1px solid var(--line);border-radius:5px;padding:12px;display:block}
.mag-fig figcaption{font-size:12.5px;color:var(--muted);margin-top:9px;line-height:1.5}
.mag-pull{font-family:var(--font-archivo),sans-serif;font-weight:800;letter-spacing:-.02em;
  font-size:clamp(20px,3vw,28px);line-height:1.22;color:var(--teal);border-top:2px solid var(--line);border-bottom:2px solid var(--line);
  padding:22px 0;margin:30px 0;max-width:24ch}
/* tie-in */
.mag-tie{margin:30px 0 4px;border-top:1px solid var(--line);padding-top:20px}
.mag-tie-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.mag-tie-row{display:flex;gap:14px;flex-wrap:wrap}
.mag-tie-card{display:flex;flex-direction:column;gap:8px;width:104px;text-decoration:none;color:var(--ink)}
.mag-tie-card img,.mag-tie-ph{width:104px;height:104px;object-fit:cover;border-radius:5px;background:#e9e3d8;display:block}
.mag-tie-card span{font-size:12.5px;line-height:1.3;font-weight:600}
.mag-tie-card:hover span{color:var(--terra)}
/* cover */
.mag-cover{position:relative;height:100%;width:100%;color:#fff;overflow:hidden}
.mag-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.mag-cover-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,26,32,.25) 0%,rgba(14,26,32,.15) 40%,rgba(14,26,32,.86) 100%)}
.mag-cover-inner{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(30px,5vw,60px)}
.mag-cover-eyebrow{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#fff;opacity:.9;margin-bottom:10px}
.mag-masthead{font-family:var(--font-archivo),sans-serif;font-weight:900;letter-spacing:-.04em;font-size:clamp(56px,15vw,120px);line-height:.9;margin-bottom:14px}
.mag-cover-sub{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-size:clamp(18px,2.6vw,24px);max-width:30ch;opacity:.95}
.mag-cover-cue{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:26px;opacity:.75}
/* contents */
.mag-contents .mag-h1{margin-bottom:26px}
.mag-toc{list-style:none;margin:0;padding:0;counter-reset:none}
.mag-toc li{display:grid;grid-template-columns:44px 1fr auto;align-items:baseline;gap:14px;padding:16px 0;border-top:1px solid var(--line)}
.mag-toc li:last-child{border-bottom:1px solid var(--line)}
.mag-toc-n{font-family:'Space Mono',monospace;font-size:13px;color:var(--terra)}
.mag-toc-t{font-family:var(--font-archivo),sans-serif;font-weight:800;font-size:clamp(16px,2.1vw,19px);letter-spacing:-.01em}
.mag-toc-s{font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
/* gallery */
.mag-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:8px 0 6px}
.mag-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:5px;background:#e9e3d8;display:block}
.mag-gallery img:first-child{grid-column:1 / -1;aspect-ratio:16/9}
/* edges */
.mag-edge{position:absolute;top:0;bottom:0;width:12%;border:none;background:transparent;cursor:pointer;z-index:2}
.mag-edge:disabled{cursor:default}
.mag-edge-l{left:0}.mag-edge-r{right:0}
/* controls */
.mag-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;width:min(94vw,880px)}
.mag-btn{appearance:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;
  font-family:var(--font-manrope),sans-serif;font-weight:700;font-size:14px;border-radius:999px;padding:10px 20px;cursor:pointer}
.mag-btn:hover:not(:disabled){background:var(--terra);border-color:var(--terra)}
.mag-btn:disabled{opacity:.3;cursor:default}
.mag-mid{display:flex;align-items:center;gap:16px}
.mag-count{font-family:'Space Mono',monospace;font-size:12.5px;color:#fff;opacity:.85;letter-spacing:.1em}
.mag-toc-btn{appearance:none;background:none;border:none;color:#fff;opacity:.8;font-family:'Space Mono',monospace;
  font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;padding:6px 4px}
.mag-toc-btn:hover{opacity:1;color:var(--terra)}
.mag-progress{width:min(94vw,880px);height:3px;background:rgba(255,255,255,.14);border-radius:3px;overflow:hidden}
.mag-progress span{display:block;height:100%;background:var(--terra);transition:width .5s ease}
/* toc overlay */
.mag-toc-overlay{position:fixed;inset:0;background:rgba(14,26,32,.7);z-index:40;display:flex;align-items:center;justify-content:center;padding:20px}
.mag-toc-panel{background:var(--cream);border-radius:8px;padding:26px;width:min(92vw,460px);max-height:82vh;overflow:auto}
.mag-jump{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:center;width:100%;text-align:left;
  background:none;border:none;border-top:1px solid var(--line);padding:13px 2px;cursor:pointer}
.mag-jump:hover .mag-toc-t{color:var(--terra)}
@media (max-width:560px){
  .mag-book{height:82vh}
  .mag-gallery img:first-child{aspect-ratio:4/3}
  .mag-edge{display:none}
}
/* ── PRINT: stack every leaf as its own page, hide the reader chrome ── */
@media print{
  .mag-stage{background:#fff;padding:0;display:block;min-height:0}
  .mag-book{width:100%;height:auto;box-shadow:none;border-radius:0;overflow:visible}
  .mag-track{display:block;transform:none !important}
  .mag-leaf{height:auto;overflow:visible;page-break-after:always;break-after:page}
  .mag-controls,.mag-progress,.mag-edge,.mag-cover-cue,.mag-toc-overlay{display:none !important}
  .mag-cover{height:96vh}
  .mag-hero,.mag-gallery img,.mag-tie-card img{print-color-adjust:exact;-webkit-print-color-adjust:exact}
}
`;
