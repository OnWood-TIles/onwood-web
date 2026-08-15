"use client";

// Kiln reader, PDF edition. Renders the pages of a designed magazine PDF (laid
// out by Claude Design) into the flick-through book: two-page spread with the
// cover alone on the right, a real page-turn on flick, a hover magnifier, and a
// print button. No code-drawn layout, the pages ARE the designed PDF.
//
// pdf.js is loaded from a CDN (UMD build, sets window.pdfjsLib) and each page is
// rasterised to a high-res image so the magnifier stays crisp.

import { useCallback, useEffect, useRef, useState } from "react";

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

/* eslint-disable @typescript-eslint/no-explicit-any */
function loadPdfJs(): Promise<any> {
  const w = window as any;
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `${PDFJS}/pdf.min.js`;
    s.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (!lib) return reject(new Error("pdfjsLib missing"));
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.js`;
      resolve(lib);
    };
    s.onerror = () => reject(new Error("failed to load pdf.js"));
    document.head.appendChild(s);
  });
}

/* eslint-enable @typescript-eslint/no-explicit-any */

const DEEP = "#0e1a20";
const CREAM = "#fbfaf6";
const TERRA = "#d06a45";

export default function PdfMagazine({ src }: { src: string }) {
  const [total, setTotal] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [, bump] = useState(0); // re-render when the page cache changes

  const [per, setPer] = useState(2);
  const [index, setIndex] = useState(0);
  const [loupe, setLoupe] = useState(false);
  const [flip, setFlip] = useState<null | { dir: 1 | -1; from: number }>(null);

  const bookRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const pdfRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const cacheRef = useRef<Map<number, string>>(new Map()); // 0-based pdf page -> jpeg dataURL
  const inflightRef = useRef<Set<number>>(new Set());
  const viewCenterRef = useRef(0); // current pdf page in view, for safe eviction

  // Open the PDF (fast) - pages are rasterised lazily on demand below, so a big
  // magazine shows its cover immediately instead of pre-rendering every page.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const lib = await loadPdfJs();
        const pdf = await lib.getDocument(src).promise;
        if (!alive) return;
        pdfRef.current = pdf;
        setTotal(pdf.numPages);
      } catch (e) {
        if (alive) setErr((e as Error)?.message || "could not open the PDF");
      }
    })();
    return () => { alive = false; };
  }, [src]);

  // Render one PDF page (0-based) to a cached JPEG dataURL, evicting far pages so
  // memory stays bounded no matter how many pages the magazine has.
  const ensure = useCallback(
    async (pi: number) => {
      const pdf = pdfRef.current;
      if (!pdf || total == null || pi < 0 || pi >= total) return;
      if (cacheRef.current.has(pi) || inflightRef.current.has(pi)) return;
      inflightRef.current.add(pi);
      try {
        const page = await pdf.getPage(pi + 1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvasContext: ctx, viewport }).promise;
        cacheRef.current.set(pi, canvas.toDataURL("image/jpeg", 0.82));
        // Evict only pages far from the CURRENT view (never a visible/prefetched one).
        if (cacheRef.current.size > 24) {
          const c = viewCenterRef.current;
          const far = [...cacheRef.current.keys()].sort((a, b) => Math.abs(b - c) - Math.abs(a - c))[0];
          if (far != null && Math.abs(far - c) > 12) cacheRef.current.delete(far);
        }
        bump((x) => x + 1);
      } catch {
        /* a failed page render just shows a placeholder */
      } finally {
        inflightRef.current.delete(pi);
      }
    },
    [total]
  );

  // Book (2-up) on wide screens, single page on phones.
  useEffect(() => {
    const apply = () => {
      const two = window.innerWidth >= 900;
      setPer(two ? 2 : 1);
      setIndex((i) => (two ? i - (i % 2) : i));
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // Book mode prepends a blank endpaper so the cover opens alone on the right.
  const nPages = total ?? 0;
  const n = total == null ? 0 : per === 2 ? nPages + 1 : nPages;
  const pdfIndexOf = (leafPos: number) => (per === 2 ? leafPos - 1 : leafPos);
  type Slot = { blank: boolean; url: string | null };
  const at = (leafPos: number): Slot => {
    const pi = pdfIndexOf(leafPos);
    if (pi < 0 || pi >= nPages) return { blank: true, url: null };
    return { blank: false, url: cacheRef.current.get(pi) ?? null };
  };
  const step = per;

  // Render the pages around the current view (+ a small prefetch ahead).
  useEffect(() => {
    if (total == null) return;
    const center = per === 2 ? index - 1 : index;
    viewCenterRef.current = Math.max(0, center);
    for (let pi = center - 2; pi <= center + per + 5; pi++) ensure(pi);
  }, [index, per, total, ensure]);
  const atStart = index <= 0;
  const atEnd = index + step >= n;

  const commit = useCallback((to: number) => {
    setIndex(Math.max(0, to));
    setFlip(null);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flip) return;
      const target = index + dir * step;
      if (target < 0 || target >= n) return;
      if (per === 1) {
        setIndex(target);
        return;
      }
      setFlip({ dir, from: index });
    },
    [flip, index, step, n, per]
  );

  useEffect(() => {
    if (!flip) return;
    const el = sheetRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.classList.add("go"));
    const t = window.setTimeout(() => commit(flip.from + flip.dir * step), 900);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [flip, commit, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

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
  const onMove = (e: React.MouseEvent) => {
    const el = bookRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  // Static left/right and the turning sheet (same model as the content edition).
  const BLANK: Slot = { blank: true, url: null };
  let leftLeaf: Slot, rightLeaf: Slot, sheetFront: Slot = BLANK, sheetBack: Slot = BLANK;
  if (per === 2 && flip) {
    const f = flip.from;
    if (flip.dir === 1) {
      leftLeaf = at(f); rightLeaf = at(f + 3); sheetFront = at(f + 1); sheetBack = at(f + 2);
    } else {
      leftLeaf = at(f - 2); rightLeaf = at(f + 1); sheetFront = at(f); sheetBack = at(f - 1);
    }
  } else {
    leftLeaf = at(index);
    rightLeaf = per === 2 ? at(index + 1) : BLANK;
  }

  const pad2 = (v: number) => String(v).padStart(2, "0");
  const tot = total ?? 0;
  const label = (() => {
    if (total == null) return "--";
    if (per !== 2) return pad2(index + 1);
    const showL = index >= 1 ? index : null; // left leaf -> pdf page (index-1) -> 1-based = index
    const showR = index < tot ? index + 1 : null;
    if (showL && showR) return `${pad2(showL)}–${pad2(showR)}`;
    return pad2(showR || showL || 1);
  })();

  const PageImg = ({ slot }: { slot: Slot }) =>
    slot.blank ? (
      <div className="pdf-blank" />
    ) : slot.url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="pdf-img" src={slot.url} alt="" draggable={false} />
    ) : (
      <div className="pdf-page-loading"><div className="pdf-spin small" /></div>
    );

  const spread = (key: string) => (
    <div className="pdf-spread" key={key}>
      <div className="pdf-page left"><PageImg slot={leftLeaf} /></div>
      {per === 2 && <div className="pdf-page right"><PageImg slot={rightLeaf} /></div>}
    </div>
  );

  return (
    <div className="pdf-stage" data-per={per}>
      <style>{css}</style>

      {total == null && !err && (
        <div className="pdf-loading">
          <div className="pdf-spin" />
          <div className="pdf-loadtxt">Opening the magazine</div>
        </div>
      )}
      {err && (
        <div className="pdf-loading">
          <div className="pdf-loadtxt">The magazine could not be opened. {err}</div>
        </div>
      )}

      {total != null && (
        <>
          <div
            className={`pdf-book${loupe && !flip ? " loupe-on" : ""}`}
            ref={bookRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseMove={onMove}
            onMouseEnter={() => setLoupe(true)}
            onMouseLeave={() => setLoupe(false)}
          >
            {spread("static")}

            {per === 2 && flip && (
              <div
                className={`pdf-sheet ${flip.dir === 1 ? "fwd" : "bwd"}`}
                ref={sheetRef}
                onTransitionEnd={(e) => {
                  if (e.propertyName === "transform") commit(flip.from + flip.dir * step);
                }}
              >
                <div className="pdf-face front"><PageImg slot={sheetFront} /></div>
                <div className="pdf-face back"><PageImg slot={sheetBack} /></div>
                <div className="pdf-shade" />
              </div>
            )}

            {per === 2 && <div className="pdf-fold" aria-hidden="true" />}

            <div className="pdf-loupe" aria-hidden="true">
              <div className="pdf-loupe-scale">{spread("loupe")}</div>
            </div>
            <div className="pdf-loupe-ring" aria-hidden="true" />

            <button className="pdf-edge l" aria-label="Previous page" onClick={() => go(-1)} disabled={atStart} />
            <button className="pdf-edge r" aria-label="Next page" onClick={() => go(1)} disabled={atEnd} />
          </div>

          <div className="pdf-controls">
            <button className="pdf-btn" onClick={() => go(-1)} disabled={atStart}>&lsaquo; Prev</button>
            <div className="pdf-mid">
              <span className="pdf-count">{label} / {pad2(tot)}</span>
              <a className="pdf-toc-btn" href={src} target="_blank" rel="noopener">Download PDF</a>
            </div>
            <button className="pdf-btn" onClick={() => go(1)} disabled={atEnd}>Next &rsaquo;</button>
          </div>
          <div className="pdf-progress"><span style={{ width: `${tot ? (Math.min(per === 2 ? index : index + 1, tot) / tot) * 100 : 0}%` }} /></div>
        </>
      )}
    </div>
  );
}

const css = `
.pdf-stage{--deep:${DEEP};--cream:${CREAM};--terra:${TERRA};--lx:50%;--ly:50%;--lr:120px;--lz:2.35;
  --bh:min(980px, calc(100vh - 172px));
  --bw:min(97vw, calc(var(--bh) * 420 / 297));
  --bw1:min(94vw, calc(var(--bh) * 210 / 297));
  display:flex;flex-direction:column;align-items:center;gap:12px;padding:78px 12px 22px;background:${DEEP};min-height:100vh}
.pdf-loading{display:flex;flex-direction:column;align-items:center;gap:16px;color:#fff;opacity:.85;padding:120px 0}
.pdf-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:${TERRA};animation:pdfspin 1s linear infinite}
.pdf-spin.small{width:22px;height:22px;border-width:2px}
@keyframes pdfspin{to{transform:rotate(360deg)}}
.pdf-page-loading{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#efeae1,#e4ded3)}
.pdf-loadtxt{font-family:'Space Mono',var(--font-manrope),monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.pdf-book{position:relative;width:var(--bw);aspect-ratio:420 / 297;margin:0 auto;perspective:2600px}
[data-per="1"] .pdf-book{width:var(--bw1);aspect-ratio:210 / 297}
.pdf-spread{position:absolute;inset:0;display:flex;transform-style:preserve-3d}
.pdf-page{position:relative;height:100%;overflow:hidden;background:var(--cream)}
[data-per="2"] .pdf-page{width:50%}
[data-per="1"] .pdf-page{width:100%;border-radius:7px;box-shadow:0 40px 90px -34px rgba(0,0,0,.6)}
.pdf-img{width:100%;height:100%;object-fit:cover;display:block;user-select:none}
.pdf-blank{width:100%;height:100%;background:transparent}
[data-per="2"] .pdf-page.left{border-radius:7px 0 0 7px;box-shadow:inset -26px 0 34px -26px rgba(16,26,32,.24),0 40px 90px -40px rgba(0,0,0,.55)}
[data-per="2"] .pdf-page.right{border-radius:0 7px 7px 0;box-shadow:inset 26px 0 34px -26px rgba(16,26,32,.24),0 40px 90px -40px rgba(0,0,0,.55)}
.pdf-fold{position:absolute;top:0;bottom:0;left:calc(50% - 30px);width:60px;pointer-events:none;z-index:3;
  background:linear-gradient(90deg,rgba(18,26,32,0),rgba(18,26,32,.05) 38%,rgba(18,26,32,.16) 50%,rgba(18,26,32,.05) 62%,rgba(18,26,32,0))}
.pdf-fold::after{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(18,26,32,.14)}
.pdf-sheet{position:absolute;top:0;height:100%;width:50%;transform-style:preserve-3d;z-index:5;
  transition:transform .66s cubic-bezier(.42,.02,.28,1);will-change:transform}
.pdf-sheet.fwd{left:50%;transform-origin:left center}
.pdf-sheet.bwd{left:0;transform-origin:right center}
.pdf-sheet.fwd.go{transform:rotateY(-178deg)}
.pdf-sheet.bwd.go{transform:rotateY(178deg)}
.pdf-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:var(--cream)}
.pdf-face.back{transform:rotateY(180deg)}
.pdf-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.16),rgba(0,0,0,0) 30%);opacity:0;transition:opacity .66s}
.pdf-sheet.go .pdf-shade{opacity:1}
.pdf-loupe{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;transition:opacity .12s ease;clip-path:circle(var(--lr) at var(--lx) var(--ly))}
.pdf-loupe-scale{position:absolute;inset:0;transform:scale(var(--lz));transform-origin:var(--lx) var(--ly)}
.pdf-loupe-ring{position:absolute;z-index:7;pointer-events:none;width:calc(var(--lr) * 2);height:calc(var(--lr) * 2);
  left:var(--lx);top:var(--ly);transform:translate(-50%,-50%);border-radius:50%;opacity:0;transition:opacity .12s ease;
  border:2px solid rgba(255,255,255,.85);box-shadow:0 10px 34px rgba(0,0,0,.4),inset 0 0 22px rgba(16,26,32,.18)}
.pdf-book.loupe-on .pdf-loupe,.pdf-book.loupe-on .pdf-loupe-ring{opacity:1}
.pdf-book.loupe-on{cursor:none}
.pdf-edge{position:absolute;top:0;bottom:0;width:11%;border:none;background:transparent;cursor:pointer;z-index:8}
.pdf-edge:disabled{cursor:default}
.pdf-edge.l{left:0}.pdf-edge.r{right:0}
.pdf-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;width:var(--bw)}
[data-per="1"] .pdf-controls,[data-per="1"] .pdf-progress{width:min(94vw,var(--bw1))}
.pdf-btn{appearance:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;
  font-family:var(--font-manrope),sans-serif;font-weight:700;font-size:14px;border-radius:999px;padding:10px 20px;cursor:pointer}
.pdf-btn:hover:not(:disabled){background:${TERRA};border-color:${TERRA}}
.pdf-btn:disabled{opacity:.3;cursor:default}
.pdf-mid{display:flex;align-items:center;gap:16px}
.pdf-count{font-family:'Space Mono',monospace;font-size:12.5px;color:#fff;opacity:.85;letter-spacing:.1em}
.pdf-toc-btn{color:#fff;opacity:.8;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none}
.pdf-toc-btn:hover{opacity:1;color:${TERRA}}
.pdf-progress{width:var(--bw);height:3px;background:rgba(255,255,255,.14);border-radius:3px;overflow:hidden}
.pdf-progress span{display:block;height:100%;background:${TERRA};transition:width .5s ease}
@media (max-width:560px){.pdf-stage{padding-top:92px}.pdf-edge{display:none}}
`;
