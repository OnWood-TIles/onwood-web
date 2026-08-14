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

async function renderPdf(src: string, onProgress: (n: number, total: number) => void): Promise<string[]> {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument(src).promise;
  const out: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (ctx) await page.render({ canvasContext: ctx, viewport }).promise;
    out.push(canvas.toDataURL("image/jpeg", 0.82));
    onProgress(i, pdf.numPages);
  }
  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEEP = "#0e1a20";
const CREAM = "#fbfaf6";
const TERRA = "#d06a45";

export default function PdfMagazine({ src }: { src: string }) {
  const [pages, setPages] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [prog, setProg] = useState({ n: 0, total: 0 });

  const [per, setPer] = useState(2);
  const [index, setIndex] = useState(0);
  const [loupe, setLoupe] = useState(false);
  const [flip, setFlip] = useState<null | { dir: 1 | -1; from: number }>(null);

  const bookRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    renderPdf(src, (n, total) => alive && setProg({ n, total }))
      .then((p) => alive && setPages(p))
      .catch((e) => alive && setErr(e.message || "could not open the PDF"));
    return () => {
      alive = false;
    };
  }, [src]);

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

  // Prepend a blank endpaper in book mode so the cover opens alone on the right.
  const leaves: (string | null)[] = pages
    ? per === 2
      ? [null, ...pages]
      : pages
    : [];
  const n = leaves.length;
  const at = (p: number) => (p >= 0 && p < n ? leaves[p] : null);
  const step = per;
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
  let leftLeaf: string | null;
  let rightLeaf: string | null;
  let sheetFront: string | null = null;
  let sheetBack: string | null = null;
  if (per === 2 && flip) {
    const f = flip.from;
    if (flip.dir === 1) {
      leftLeaf = at(f); rightLeaf = at(f + 3); sheetFront = at(f + 1); sheetBack = at(f + 2);
    } else {
      leftLeaf = at(f - 2); rightLeaf = at(f + 1); sheetFront = at(f); sheetBack = at(f - 1);
    }
  } else {
    leftLeaf = at(index);
    rightLeaf = per === 2 ? at(index + 1) : null;
  }

  const pad2 = (v: number) => String(v).padStart(2, "0");
  const total = pages ? pages.length : 0;
  const label = (() => {
    if (!pages) return "--";
    if (per !== 2) return pad2(index + 1);
    const l = index; // pages index of left leaf = index-1 in pages, +1 for 1-based = index
    const r = index + 1;
    const showL = l >= 1 ? l : null; // leaves[index] maps to pages[index-1]
    const showR = r - 1 < total ? r - 1 + 1 : null;
    if (showL && showR) return `${pad2(showL)}–${pad2(showR)}`;
    return pad2(showR || showL || 1);
  })();

  const PageImg = ({ url }: { url: string | null }) =>
    url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="pdf-img" src={url} alt="" draggable={false} />
    ) : (
      <div className="pdf-blank" />
    );

  const spread = (key: string) => (
    <div className="pdf-spread" key={key}>
      <div className="pdf-page left"><PageImg url={leftLeaf} /></div>
      {per === 2 && <div className="pdf-page right"><PageImg url={rightLeaf} /></div>}
    </div>
  );

  return (
    <div className="pdf-stage" data-per={per}>
      <style>{css}</style>

      {!pages && !err && (
        <div className="pdf-loading">
          <div className="pdf-spin" />
          <div className="pdf-loadtxt">
            Preparing the magazine{prog.total ? ` · ${prog.n}/${prog.total}` : ""}
          </div>
        </div>
      )}
      {err && (
        <div className="pdf-loading">
          <div className="pdf-loadtxt">The magazine could not be opened. {err}</div>
        </div>
      )}

      {pages && (
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
                <div className="pdf-face front"><PageImg url={sheetFront} /></div>
                <div className="pdf-face back"><PageImg url={sheetBack} /></div>
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
              <span className="pdf-count">{label} / {pad2(total)}</span>
              <a className="pdf-toc-btn" href={src} target="_blank" rel="noopener">Download PDF</a>
            </div>
            <button className="pdf-btn" onClick={() => go(1)} disabled={atEnd}>Next &rsaquo;</button>
          </div>
          <div className="pdf-progress"><span style={{ width: `${total ? (Math.min(per === 2 ? index : index + 1, total) / total) * 100 : 0}%` }} /></div>
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
@keyframes pdfspin{to{transform:rotate(360deg)}}
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
