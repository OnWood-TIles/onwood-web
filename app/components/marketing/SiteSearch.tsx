"use client";

import { useEffect, useRef, useState } from "react";

// Global storefront search: a nav trigger that opens an overlay searching
// products, guides and pages via /api/search (debounced, grouped results).
type Result = { name: string; url: string; sub?: string; image?: string | null };
type Res = { products: Result[]; guides: Result[]; pages: Result[] };
const EMPTY: Res = { products: [], guides: [], pages: [] };

function Magnifier({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function SiteSearch({ variant = "icon" }: { variant?: "icon" | "mobile" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Res>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRes(EMPTY); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        setRes(await r.json());
      } catch { setRes(EMPTY); }
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const close = () => { setOpen(false); setQ(""); setRes(EMPTY); };
  const total = res.products.length + res.guides.length + res.pages.length;
  const short = q.trim().length < 2;

  const Group = ({ title, items, thumb }: { title: string; items: Result[]; thumb?: boolean }) =>
    items.length ? (
      <div className="ss-group">
        <div className="ss-gtitle">{title}</div>
        {items.map((it) => (
          <a key={it.url} href={it.url} className="ss-row" onClick={close}>
            {thumb ? (
              <span className="ss-thumb">
                {it.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.image} alt="" /> : null}
              </span>
            ) : (
              <span className="ss-dot" aria-hidden />
            )}
            <span className="ss-rtext">
              <span className="ss-rname">{it.name}</span>
              {it.sub ? <span className="ss-rsub">{it.sub}</span> : null}
            </span>
            <span className="ss-arrow" aria-hidden>→</span>
          </a>
        ))}
      </div>
    ) : null;

  return (
    <>
      {variant === "icon" ? (
        <button type="button" aria-label="Search the website" onClick={() => setOpen(true)} className="ss-trigger">
          <Magnifier />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="ss-mtrigger">
          <Magnifier size={17} /> Search the website
        </button>
      )}

      {open && (
        <div className="ss-overlay" onMouseDown={close}>
          <div className="ss-panel" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ss-inputwrap">
              <span className="ss-inico"><Magnifier /></span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tiles, guides and pages…"
                aria-label="Search the website"
              />
              <button type="button" className="ss-esc" onClick={close} aria-label="Close search">Esc</button>
            </div>
            <div className="ss-results">
              {short ? (
                <p className="ss-hint">Start typing to search across products, guides and pages.</p>
              ) : total === 0 && !loading ? (
                <p className="ss-hint">No matches for &ldquo;{q}&rdquo;. Try another word.</p>
              ) : (
                <>
                  <Group title="Products" items={res.products} thumb />
                  <Group title="Guides & inspiration" items={res.guides} thumb />
                  <Group title="Pages" items={res.pages} />
                </>
              )}
            </div>
          </div>
          <style>{css}</style>
        </div>
      )}
    </>
  );
}

const css = `
.ss-trigger{display:grid;place-items:center;width:38px;height:38px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;margin-left:2px}
.ss-trigger:hover{background:color-mix(in srgb,var(--ink) 6%,transparent)}
.ss-mtrigger{display:inline-flex;align-items:center;gap:10px;width:100%;justify-content:center;padding:13px 18px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-family:inherit;font-weight:700;font-size:16px;cursor:pointer}
.ss-overlay{position:fixed;inset:0;z-index:400;background:rgba(16,26,32,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;justify-content:center;padding:12vh 16px 16px;animation:ssfade .15s ease}
@keyframes ssfade{from{opacity:0}to{opacity:1}}
.ss-panel{width:min(640px,100%);max-height:76vh;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 40px 90px -30px rgba(16,26,32,.6)}
.ss-inputwrap{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}
.ss-inico{color:var(--muted);display:grid;place-items:center}
.ss-inputwrap input{flex:1;border:none;outline:none;background:transparent;font-family:inherit;font-size:17px;color:var(--ink)}
.ss-esc{border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:7px;font-size:11px;font-weight:800;letter-spacing:.06em;padding:5px 9px;cursor:pointer}
.ss-results{overflow-y:auto;padding:8px 8px 12px}
.ss-hint{color:var(--muted);font-size:14.5px;padding:22px 12px;text-align:center;margin:0}
.ss-group{padding:6px 4px}
.ss-gtitle{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);padding:8px 10px 4px}
.ss-row{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:11px;text-decoration:none;color:var(--ink)}
.ss-row:hover{background:color-mix(in srgb,var(--accent) 9%,transparent)}
.ss-thumb{flex-shrink:0;width:40px;height:40px;border-radius:8px;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--surface));display:block}
.ss-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.ss-dot{flex-shrink:0;width:7px;height:7px;margin:0 16px 0 10px;border-radius:2px;background:var(--accent);transform:rotate(45deg)}
.ss-rtext{flex:1;min-width:0;display:flex;flex-direction:column}
.ss-rname{font-weight:700;font-size:15px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ss-rsub{font-size:12.5px;color:var(--muted)}
.ss-arrow{color:var(--muted);opacity:0;transition:opacity .15s ease}
.ss-row:hover .ss-arrow{opacity:1}
@media(max-width:560px){.ss-overlay{padding:8vh 10px 10px}.ss-panel{max-height:84vh}}
`;
