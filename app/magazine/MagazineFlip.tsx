"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  imageCaption?: string;
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
          <text x="6" y="16" fontSize="10" fill={TERRA} fontFamily="'Space Mono',monospace">50% OFFSET · lippage adds up</text>
          <path d="M10 46 Q60 30 110 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <path d="M116 46 Q166 62 216 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <path d="M222 46 Q272 30 312 46" fill="none" stroke={TERRA} strokeWidth="3" />
          <line x1="113" y1="34" x2="113" y2="58" stroke={INK} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="113" cy="46" r="3" fill={INK} />
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
      <figcaption>A high mass floor flattens the peak and delays it by hours, riding the afternoon on last night&rsquo;s cool.</figcaption>
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

  if (leaf.kind === "letter" || leaf.kind === "closing") {
    return (
      <div className="mag-pad">
        {leaf.heroUrl && (
          <figure className="mag-hero mag-hero-wide">
            <div className="mag-hero-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={leaf.heroUrl} alt="" />
            </div>
            {leaf.imageCaption && <figcaption className="mag-cap">{leaf.imageCaption}</figcaption>}
          </figure>
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

  return (
    <div className="mag-pad">
      <div className="mag-eyebrow">{leaf.section}{leaf.readMins ? ` · ${leaf.readMins} min read` : ""}</div>
      <Title title={leaf.title} accent={leaf.titleAccent} className="mag-h1" />
      {leaf.standfirst && <p className="mag-standfirst">{leaf.standfirst}</p>}
      {leaf.heroUrl && (
        <figure className="mag-hero">
          <div className="mag-hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={leaf.heroUrl} alt="" />
          </div>
          {leaf.imageCaption && <figcaption className="mag-cap">{leaf.imageCaption}</figcaption>}
        </figure>
      )}
      <div className="mag-body">{leaf.blocks && <Blocks blocks={leaf.blocks} />}</div>
      {leaf.pullquote && <blockquote className="mag-pull">{leaf.pullquote}</blockquote>}
      <TieIn tie={leaf.tie} />
    </div>
  );
}

// ── A single fixed-size page. Non-cover content is scaled DOWN to fit the
//    page box so the whole page is visible with no scrolling; the loupe then
//    magnifies it back to readable size on hover. ──────────────────────────
function Page({ leaf, cls }: { leaf: FlipLeaf | null; cls?: string }) {
  const fitRef = useRef<HTMLDivElement>(null);
  const isFull = !leaf || leaf.kind === "cover";

  useLayoutEffect(() => {
    if (isFull) return;
    const fit = fitRef.current;
    const box = fit?.parentElement;
    if (!fit || !box) return;
    const measure = () => {
      // scrollHeight/Width are the natural (untransformed) content size.
      const availH = box.clientHeight;
      const availW = box.clientWidth;
      const h = fit.scrollHeight;
      const w = fit.scrollWidth;
      if (!h || !w) return;
      const k = Math.min(1, availH / h, availW / w);
      fit.style.setProperty("--fit", String(k));
    };
    measure();
    // Re-measure when content reflows (image loads) or the box resizes.
    const ro = new ResizeObserver(measure);
    ro.observe(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [leaf, isFull]);

  return (
    <div className={`mag-page ${cls || ""} ${isFull ? "full" : ""}`}>
      {leaf ? (
        isFull ? (
          <Leaf leaf={leaf} />
        ) : (
          <div className="mag-fit" ref={fitRef}>
            <Leaf leaf={leaf} />
          </div>
        )
      ) : (
        <div className="mag-endpaper" aria-hidden="true" />
      )}
    </div>
  );
}

export default function MagazineFlip({ leaves }: { leaves: FlipLeaf[] }) {
  const [per, setPer] = useState(2); // 2 = book spread, 1 = single page (mobile)
  const [index, setIndex] = useState(0); // left page position within `pages`
  const [showToc, setShowToc] = useState(false);
  const [loupe, setLoupe] = useState(false);
  const [flip, setFlip] = useState<null | { dir: 1 | -1; from: number }>(null);

  const bookRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Book mode prepends a blank endpaper so the COVER opens alone on the right,
  // exactly like a real book. Single-page (mobile) has no blank.
  const pages: (FlipLeaf | null)[] = per === 2 ? [null, ...leaves] : leaves;
  const n = pages.length;
  const at = (p: number): FlipLeaf | null => (p >= 0 && p < n ? pages[p] : null);

  // Responsive: two-up on wide screens, single page below.
  useEffect(() => {
    const apply = () => {
      const two = window.innerWidth >= 900;
      setPer(two ? 2 : 1);
      setIndex((i) => {
        const len = leaves.length + (two ? 1 : 0);
        let ni = Math.min(i, len - 1);
        if (two) ni -= ni % 2;
        return Math.max(0, ni);
      });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [leaves.length]);

  const step = per; // pages advanced per turn
  const atStart = index <= 0;
  const atEnd = index + step >= n;

  const commit = useCallback((to: number) => {
    setIndex(Math.max(0, to));
    setFlip(null);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flip) return; // ignore during an in-progress turn
      const target = index + dir * step;
      if (target < 0 || target >= n) return;
      if (per === 1) {
        setIndex(target);
        return;
      }
      // Book mode: run the 3D page turn, commit on transition end.
      setFlip({ dir, from: index });
    },
    [flip, index, step, n, per]
  );

  // Kick the CSS transition one frame after the sheet mounts at 0deg.
  useEffect(() => {
    if (!flip) return;
    const el = sheetRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.classList.add("go"));
    // Safety net if transitionend never fires.
    const t = window.setTimeout(() => commit(flip.from + flip.dir * step), 900);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [flip, commit, step]);

  const jump = useCallback(
    (leafIdx: number) => {
      if (flip) return;
      let p = per === 2 ? leafIdx + 1 : leafIdx;
      if (per === 2) p -= p % 2;
      setIndex(Math.max(0, Math.min(n - 1, p)));
    },
    [flip, per, n]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "Home") jump(0);
      else if (e.key === "End") jump(leaves.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, jump, leaves.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  // Loupe: magnify about the cursor. Position is pushed via CSS vars (no React
  // re-render on move). Hidden during a page turn and on the table of contents.
  const onMove = (e: React.MouseEvent) => {
    const el = bookRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  // ── Which leaves sit in the static left/right slots right now ─────────────
  // During a forward turn we must freeze the OLD left and reveal the NEW right;
  // during a backward turn, reveal the NEW left and freeze the OLD right.
  let leftLeaf: FlipLeaf | null;
  let rightLeaf: FlipLeaf | null;
  let sheetFront: FlipLeaf | null = null;
  let sheetBack: FlipLeaf | null = null;
  if (per === 2 && flip) {
    const f = flip.from;
    if (flip.dir === 1) {
      leftLeaf = at(f); // old left, stays
      rightLeaf = at(f + 3); // new right, revealed behind the turning sheet
      sheetFront = at(f + 1); // old right (front of the sheet)
      sheetBack = at(f + 2); // new left (back, lands on the left)
    } else {
      leftLeaf = at(f - 2); // new left, revealed
      rightLeaf = at(f + 1); // old right, stays
      sheetFront = at(f); // old left (front)
      sheetBack = at(f - 1); // new right (back, lands on the right)
    }
  } else {
    leftLeaf = at(index);
    rightLeaf = per === 2 ? at(index + 1) : null;
  }

  const tocIndex = leaves.findIndex((l) => l.kind === "contents");
  // In book mode `index` is page-space (with a leading blank), so the left leaf
  // is index-1 and the right leaf is index in leaves[]. On mobile it is direct.
  const pad2 = (v: number) => String(v).padStart(2, "0");
  const pageLabel = (() => {
    if (per !== 2) return pad2(index + 1);
    const l = index - 1; // left leaf index (-1 = endpaper)
    const r = index; // right leaf index
    const showL = l >= 0 ? l + 1 : null;
    const showR = r < leaves.length ? r + 1 : null;
    if (showL && showR) return `${pad2(showL)}–${pad2(showR)}`;
    return pad2(showR || showL || 1);
  })();
  const totalLabel = pad2(leaves.length);
  const shownLeaf = per === 2 ? Math.min(index, leaves.length - 1) : index;
  const progress = ((shownLeaf + 1) / leaves.length) * 100;

  const renderSpread = (forLoupe = false) => (
    <div className="mag-spread">
      <Page leaf={leftLeaf} cls="left" key={forLoupe ? "l2" : "l"} />
      {per === 2 && <Page leaf={rightLeaf} cls="right" key={forLoupe ? "r2" : "r"} />}
    </div>
  );

  return (
    <div className="mag-stage" data-per={per}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
      />
      <style>{css}</style>

      <div
        className={`mag-book${loupe && !flip && !showToc ? " loupe-on" : ""}`}
        ref={bookRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseMove={onMove}
        onMouseEnter={() => setLoupe(true)}
        onMouseLeave={() => setLoupe(false)}
      >
        {/* Static spread */}
        {renderSpread()}

        {/* Turning sheet (book mode only) */}
        {per === 2 && flip && (
          <div
            className={`mag-sheet ${flip.dir === 1 ? "fwd" : "bwd"}`}
            ref={sheetRef}
            onTransitionEnd={(e) => {
              if (e.propertyName === "transform") commit(flip.from + flip.dir * step);
            }}
          >
            <div className="mag-face front"><Page leaf={sheetFront} cls={flip.dir === 1 ? "right" : "left"} /></div>
            <div className="mag-face back"><Page leaf={sheetBack} cls={flip.dir === 1 ? "left" : "right"} /></div>
            <div className="mag-sheet-shade" />
          </div>
        )}

        {/* Centre fold + spine (book mode) */}
        {per === 2 && <div className="mag-fold" aria-hidden="true" />}

        {/* Magnifier loupe */}
        <div className="mag-loupe" aria-hidden="true">
          <div className="mag-loupe-scale">{renderSpread(true)}</div>
        </div>
        <div className="mag-loupe-ring" aria-hidden="true" />

        {/* Edge tap zones */}
        <button className="mag-edge mag-edge-l" aria-label="Previous page" onClick={() => go(-1)} disabled={atStart} />
        <button className="mag-edge mag-edge-r" aria-label="Next page" onClick={() => go(1)} disabled={atEnd} />
      </div>

      {/* Controls */}
      <div className="mag-controls">
        <button className="mag-btn" onClick={() => go(-1)} disabled={atStart}>&lsaquo; Prev</button>
        <div className="mag-mid">
          <button className="mag-toc-btn" onClick={() => setShowToc((s) => !s)}>Contents</button>
          <span className="mag-count">{pageLabel} / {totalLabel}</span>
          <button className="mag-toc-btn" onClick={() => window.print()}>Print</button>
        </div>
        <button className="mag-btn" onClick={() => go(1)} disabled={atEnd}>Next &rsaquo;</button>
      </div>

      <div className="mag-progress"><span style={{ width: `${progress}%` }} /></div>

      {/* Contents overlay */}
      {showToc && (
        <div className="mag-toc-overlay" onClick={() => setShowToc(false)}>
          <div className="mag-toc-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mag-eyebrow" style={{ marginBottom: 14 }}>Jump to</div>
            <button className="mag-jump" onClick={() => { jump(0); setShowToc(false); }}>
              <span className="mag-toc-n">00</span><span className="mag-toc-t">Cover</span>
            </button>
            {tocIndex >= 0 && leaves[tocIndex].contents?.map((c) => {
              const li = leaves.findIndex((l) => l.section?.startsWith(c.n));
              return (
                <button key={c.n} className="mag-jump" onClick={() => { if (li >= 0) jump(li); setShowToc(false); }}>
                  <span className="mag-toc-n">{c.n}</span>
                  <span className="mag-toc-t">{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
.mag-stage{--cream:${CREAM};--ink:${INK};--muted:${MUTED};--terra:${TERRA};--teal:${TEAL};--deep:${DEEP};--line:${LINE};
  --lx:50%;--ly:50%;--lr:120px;--lz:2.35;
  /* Available book height = viewport minus the nav, controls, progress + gaps.
     Every page is locked to A4 portrait (210:297); a spread is two A4 pages
     (420:297). Width is derived from that so the book always fits on screen. */
  --bh:min(900px, calc(100vh - 244px));
  --bw:min(96vw, calc(var(--bh) * 420 / 297));
  --bw1:min(94vw, calc(var(--bh) * 210 / 297));
  display:flex;flex-direction:column;align-items:center;gap:14px;padding:104px 16px 34px;background:${DEEP};min-height:100vh}
/* Book: transparent so a blank endpaper reads as "cover closed, one page showing".
   aspect-ratio keeps the two-page spread at exactly 2x A4. */
.mag-book{position:relative;width:var(--bw);aspect-ratio:420 / 297;margin:0 auto;perspective:2600px}
[data-per="1"] .mag-book{width:var(--bw1);aspect-ratio:210 / 297}
.mag-spread{position:absolute;inset:0;display:flex;transform-style:preserve-3d}
.mag-page{position:relative;height:100%;overflow:hidden;background:var(--cream);
  display:flex;flex-direction:column;justify-content:center;
  color:var(--ink);font-family:var(--font-manrope),system-ui,sans-serif}
.mag-page.full{display:block}
[data-per="2"] .mag-page{width:50%}
[data-per="1"] .mag-page{width:100%;border-radius:7px;box-shadow:0 40px 90px -34px rgba(0,0,0,.6)}
.mag-page.full{background:transparent}
.mag-endpaper{width:100%;height:100%;background:transparent}
[data-per="2"] .mag-page.left{border-radius:7px 0 0 7px;box-shadow:inset -26px 0 34px -26px rgba(16,26,32,.24),0 40px 90px -40px rgba(0,0,0,.55)}
[data-per="2"] .mag-page.right{border-radius:0 7px 7px 0;box-shadow:inset 26px 0 34px -26px rgba(16,26,32,.24),0 40px 90px -40px rgba(0,0,0,.55)}
/* A blank left endpaper carries no shadow, so the right page floats like a cover. */
[data-per="2"] .mag-page.left.full{box-shadow:none}
/* content scaled to fit the page (no scroll); centred so there is no dead space. */
.mag-fit{width:100%;transform:scale(var(--fit,1));transform-origin:center center}
.mag-fold{position:absolute;top:0;bottom:0;left:calc(50% - 30px);width:60px;pointer-events:none;z-index:3;
  background:linear-gradient(90deg,rgba(18,26,32,0) 0%,rgba(18,26,32,.05) 38%,rgba(18,26,32,.16) 50%,rgba(18,26,32,.05) 62%,rgba(18,26,32,0) 100%)}
.mag-fold::after{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(18,26,32,.14)}
/* Turning sheet */
.mag-sheet{position:absolute;top:0;height:100%;width:50%;transform-style:preserve-3d;z-index:5;
  transition:transform .66s cubic-bezier(.42,.02,.28,1);will-change:transform}
.mag-sheet.fwd{left:50%;transform-origin:left center}
.mag-sheet.bwd{left:0;transform-origin:right center}
.mag-sheet.fwd.go{transform:rotateY(-178deg)}
.mag-sheet.bwd.go{transform:rotateY(178deg)}
.mag-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:var(--cream)}
.mag-face.back{transform:rotateY(180deg)}
.mag-face .mag-page{width:100%}
.mag-sheet-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.16),rgba(0,0,0,0) 30%);opacity:0;transition:opacity .66s}
.mag-sheet.go .mag-sheet-shade{opacity:1}
/* Loupe */
.mag-loupe{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;transition:opacity .12s ease;
  clip-path:circle(var(--lr) at var(--lx) var(--ly))}
.mag-loupe-scale{position:absolute;inset:0;transform:scale(var(--lz));transform-origin:var(--lx) var(--ly)}
.mag-loupe-scale .mag-spread{transform-style:flat}
.mag-loupe-ring{position:absolute;z-index:7;pointer-events:none;width:calc(var(--lr) * 2);height:calc(var(--lr) * 2);
  left:var(--lx);top:var(--ly);transform:translate(-50%,-50%);border-radius:50%;opacity:0;transition:opacity .12s ease;
  border:2px solid rgba(255,255,255,.85);box-shadow:0 10px 34px rgba(0,0,0,.4),inset 0 0 22px rgba(16,26,32,.18)}
.mag-book.loupe-on .mag-loupe,.mag-book.loupe-on .mag-loupe-ring{opacity:1}
.mag-book.loupe-on{cursor:none}
/* content typography (rendered inside the fit wrapper) */
.mag-pad{padding:clamp(20px,2.4vw,36px)}
.mag-eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--terra);margin-bottom:12px}
.mag-h1{font-family:var(--font-archivo),sans-serif;font-weight:900;letter-spacing:-.03em;line-height:.98;
  font-size:clamp(30px,4.4vw,50px);margin:0 0 4px;color:var(--ink)}
.mag-h1 em{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-weight:400;color:var(--teal)}
.mag-standfirst{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-size:19px;
  line-height:1.5;color:#41535d;margin:14px 0 18px}
.mag-hero{margin:0 0 20px}
.mag-hero-img{border-radius:5px;overflow:hidden;aspect-ratio:16/9;background:#e9e3d8}
.mag-hero-img img{width:100%;height:100%;object-fit:cover;display:block}
.mag-hero-wide{margin-bottom:22px}
.mag-cap{font-size:12px;font-style:italic;color:var(--muted);margin:8px 2px 0;line-height:1.45}
/* Body flows in two magazine columns so it fills the A4 page. Headings,
   standfirst, hero and pull quote sit outside it and span the full width. */
.mag-body{columns:2;column-gap:26px;column-rule:1px solid var(--line);max-width:none}
.mag-p{font-size:16px;line-height:1.62;margin:0 0 12px;color:#28363f}
.mag-p:first-child{margin-top:0}
.mag-lead{color:var(--ink);font-weight:800}
.mag-sub{font-family:var(--font-archivo),sans-serif;font-weight:800;letter-spacing:-.01em;font-size:19px;margin:16px 0 9px;color:var(--ink);break-after:avoid}
.mag-ul{margin:2px 0 14px;padding-left:0;list-style:none;break-inside:avoid}
.mag-ul li{position:relative;padding-left:20px;margin:0 0 9px;font-size:15px;line-height:1.55;color:#28363f}
.mag-ul li::before{content:"";position:absolute;left:2px;top:8px;width:7px;height:7px;background:var(--teal);border-radius:2px;transform:rotate(45deg)}
.mag-note{background:#fff;border:1px solid var(--line);border-left:3px solid var(--terra);border-radius:4px;
  padding:14px 16px;margin:16px 0;font-size:14px;line-height:1.55;color:#3a4750;break-inside:avoid}
.mag-note-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--terra);margin-bottom:6px}
.mag-fig{margin:18px 0;break-inside:avoid}
.mag-fig svg{background:#fff;border:1px solid var(--line);border-radius:5px;padding:10px;display:block}
.mag-fig figcaption{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5}
.mag-pull{font-family:var(--font-archivo),sans-serif;font-weight:800;letter-spacing:-.02em;
  font-size:26px;line-height:1.2;color:var(--teal);border-top:2px solid var(--line);border-bottom:2px solid var(--line);
  padding:18px 0;margin:20px 0 0;text-align:center}
.mag-tie{margin:26px 0 4px;border-top:1px solid var(--line);padding-top:18px}
.mag-tie-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.mag-tie-row{display:flex;gap:13px;flex-wrap:wrap}
.mag-tie-card{display:flex;flex-direction:column;gap:7px;width:100px;text-decoration:none;color:var(--ink)}
.mag-tie-card img,.mag-tie-ph{width:100px;height:100px;object-fit:cover;border-radius:5px;background:#e9e3d8;display:block}
.mag-tie-card span{font-size:12px;line-height:1.3;font-weight:600}
.mag-tie-card:hover span{color:var(--terra)}
/* cover */
.mag-cover{position:relative;height:100%;width:100%;color:#fff;overflow:hidden;border-radius:7px}
.mag-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.mag-cover-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,26,32,.28) 0%,rgba(14,26,32,.14) 40%,rgba(14,26,32,.86) 100%)}
.mag-cover-inner{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(28px,3.4vw,54px)}
.mag-cover-eyebrow{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.24em;text-transform:uppercase;opacity:.92;margin-bottom:10px}
.mag-masthead{font-family:var(--font-archivo),sans-serif;font-weight:900;letter-spacing:-.04em;font-size:clamp(60px,9vw,116px);line-height:.9;margin-bottom:14px}
.mag-cover-sub{font-family:var(--font-newsreader),Georgia,serif;font-style:italic;font-size:clamp(18px,2.4vw,24px);max-width:26ch;opacity:.95}
.mag-cover-cue{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:24px;opacity:.75}
/* contents */
.mag-contents .mag-h1{margin-bottom:22px}
.mag-toc{list-style:none;margin:0;padding:0}
.mag-toc li{display:grid;grid-template-columns:44px 1fr auto;align-items:baseline;gap:14px;padding:14px 0;border-top:1px solid var(--line)}
.mag-toc li:last-child{border-bottom:1px solid var(--line)}
.mag-toc-n{font-family:'Space Mono',monospace;font-size:13px;color:var(--terra)}
.mag-toc-t{font-family:var(--font-archivo),sans-serif;font-weight:800;font-size:18px;letter-spacing:-.01em}
.mag-toc-s{font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
/* gallery */
.mag-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:11px;margin:6px 0}
.mag-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:5px;background:#e9e3d8;display:block}
.mag-gallery img:first-child{grid-column:1 / -1;aspect-ratio:16/9}
/* edges */
.mag-edge{position:absolute;top:0;bottom:0;width:11%;border:none;background:transparent;cursor:pointer;z-index:8}
.mag-edge:disabled{cursor:default}
.mag-edge-l{left:0}.mag-edge-r{right:0}
/* controls */
.mag-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;width:var(--bw)}
.mag-btn{appearance:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;
  font-family:var(--font-manrope),sans-serif;font-weight:700;font-size:14px;border-radius:999px;padding:10px 20px;cursor:pointer}
.mag-btn:hover:not(:disabled){background:var(--terra);border-color:var(--terra)}
.mag-btn:disabled{opacity:.3;cursor:default}
.mag-mid{display:flex;align-items:center;gap:16px}
.mag-count{font-family:'Space Mono',monospace;font-size:12.5px;color:#fff;opacity:.85;letter-spacing:.1em}
.mag-toc-btn{appearance:none;background:none;border:none;color:#fff;opacity:.8;font-family:'Space Mono',monospace;
  font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;padding:6px 4px}
.mag-toc-btn:hover{opacity:1;color:var(--terra)}
.mag-progress{width:var(--bw);height:3px;background:rgba(255,255,255,.14);border-radius:3px;overflow:hidden}
.mag-progress span{display:block;height:100%;background:var(--terra);transition:width .5s ease}
/* toc overlay */
.mag-toc-overlay{position:fixed;inset:0;background:rgba(14,26,32,.72);z-index:40;display:flex;align-items:center;justify-content:center;padding:20px}
.mag-toc-panel{background:var(--cream);border-radius:8px;padding:26px;width:min(92vw,460px);max-height:82vh;overflow:auto}
.mag-jump{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:center;width:100%;text-align:left;
  background:none;border:none;border-top:1px solid var(--line);padding:13px 2px;cursor:pointer;color:var(--ink)}
.mag-jump:hover .mag-toc-t{color:var(--terra)}
@media (max-width:560px){
  .mag-stage{padding-top:92px}
  .mag-gallery img:first-child{aspect-ratio:4/3}
  .mag-edge{display:none}
}
/* PRINT: stack every leaf as its own A4 page, natural size, no chrome */
@page{size:A4 portrait;margin:14mm}
@media print{
  .mag-stage{background:#fff;padding:0;display:block;min-height:0}
  .mag-book{width:100%;height:auto;perspective:none}
  .mag-spread{position:static;display:block}
  .mag-page{width:100% !important;height:auto;overflow:visible;page-break-after:always;break-after:page;box-shadow:none !important;border-radius:0 !important}
  .mag-fit{transform:none !important}
  .mag-controls,.mag-progress,.mag-edge,.mag-cover-cue,.mag-toc-overlay,.mag-fold,.mag-loupe,.mag-loupe-ring,.mag-sheet{display:none !important}
  .mag-cover{height:96vh}
  .mag-hero-img img,.mag-gallery img,.mag-tie-card img,.mag-cover-img{print-color-adjust:exact;-webkit-print-color-adjust:exact}
}
`;
