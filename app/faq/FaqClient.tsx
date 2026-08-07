"use client";

import { useState } from "react";
import { Markdown } from "../../lib/markdown";
import type { FaqCategory } from "../../lib/faq";

// Interactive layer for the FAQ page: a "Browse by topic" filter row + accessible
// single-open accordion. Content comes in as props (from lib/faq.ts) so this
// presentation can be swapped without touching the copy. On-brand tokens throughout.
export default function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [active, setActive] = useState<string>("all");
  const [openKey, setOpenKey] = useState<string | null>(null); // single-open

  const shown = active === "all" ? categories : categories.filter((c) => c.slug === active);
  const selectCat = (slug: string) => { setActive(slug); setOpenKey(null); };
  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));

  const chip = (slug: string, label: string) => {
    const on = active === slug;
    return (
      <button key={slug} type="button" onClick={() => selectCat(slug)} className="faq-chip" data-on={on ? "true" : "false"} aria-pressed={on}>
        {label}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px" }}>
      {/* Browse by topic */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 40, marginTop: 8 }}>
        <p className="faq-browse">Browse by topic</p>
        <div className="faq-chips" role="group" aria-label="Filter questions by topic">
          {chip("all", "All questions")}
          {categories.map((c) => chip(c.slug, c.title))}
        </div>
      </div>

      {/* Category groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 44, marginTop: 40 }}>
        {shown.map((cat) => (
          <section key={cat.slug}>
            <div className="faq-grouphead">
              <span className="faq-diamond" aria-hidden="true" />
              <h2 className="faq-cattitle">{cat.title}</h2>
              <span className="faq-catcount">{cat.items.length} questions</span>
            </div>

            <div className="faq-card">
              {cat.items.map((it, i) => {
                const key = `${cat.slug}:${i}`;
                const isOpen = openKey === key;
                const panelId = `faq-panel-${cat.slug}-${i}`;
                const btnId = `faq-btn-${cat.slug}-${i}`;
                return (
                  <div key={key}>
                    {i > 0 ? <div className="faq-div" /> : null}
                    <h3 style={{ margin: 0 }}>
                      <button type="button" id={btnId} className="faq-q" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(key)}>
                        <span className="faq-qtext">{it.q}</span>
                        <span className="faq-icon" data-open={isOpen ? "true" : "false"} aria-hidden="true">
                          <span className="faq-bar-h" />
                          <span className="faq-bar-v" />
                        </span>
                      </button>
                    </h3>
                    <div id={panelId} className="faq-panel" data-open={isOpen ? "true" : "false"} role="region" aria-labelledby={btnId}>
                      <div className="faq-panelclip">
                        <div className="faq-a">
                          <Markdown source={it.a} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        .faq-browse{margin:0 0 18px;font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
        .faq-chips{display:flex;flex-wrap:wrap;gap:10px}
        .faq-chip{font-family:var(--font-manrope),system-ui,sans-serif;font-size:13.5px;font-weight:600;letter-spacing:.01em;padding:10px 17px;border-radius:999px;cursor:pointer;line-height:1;background:var(--surface);color:var(--ink);border:1px solid var(--line);transition:transform .2s ease,box-shadow .2s ease,background .16s ease,color .16s ease,border-color .16s ease}
        .faq-chip:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(32,48,58,.08);border-color:color-mix(in srgb,var(--accent) 50%,var(--line));color:var(--accent)}
        .faq-chip[data-on="true"]{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:800}
        .faq-chip[data-on="true"]:hover{color:#fff;box-shadow:0 8px 18px rgba(208,106,69,.28)}
        .faq-chip:focus-visible{outline:2px solid var(--sea);outline-offset:2px}

        .faq-grouphead{display:flex;align-items:center;gap:14px;margin:0 0 18px;padding:0 2px}
        .faq-diamond{width:8px;height:8px;background:var(--accent);transform:rotate(45deg);flex:none}
        .faq-cattitle{margin:0;font-family:var(--font-archivo),sans-serif;font-weight:800;letter-spacing:-.02em;font-size:22px;color:var(--ink)}
        .faq-catcount{font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)}

        .faq-card{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:4px clamp(18px,3vw,30px);box-shadow:0 1px 2px rgba(32,48,58,.04);transition:box-shadow .24s ease}
        .faq-card:hover{box-shadow:0 12px 30px rgba(32,48,58,.07)}
        .faq-div{height:1px;background:var(--line)}
        .faq-q{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:22px;background:transparent;border:0;padding:22px 0;margin:0;cursor:pointer;text-align:left}
        .faq-qtext{font-family:var(--font-archivo),sans-serif;font-weight:700;font-size:clamp(16px,1.9vw,18.5px);line-height:1.42;letter-spacing:-.01em;color:var(--ink)}
        .faq-q:hover .faq-qtext{color:var(--accent)}
        .faq-q:focus-visible{outline:2px solid var(--sea);outline-offset:3px;border-radius:6px}
        .faq-icon{position:relative;flex:none;width:30px;height:30px;margin-top:2px;border-radius:999px;display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);background:var(--surface);transition:transform .32s cubic-bezier(.2,.7,.2,1),background .2s ease}
        .faq-icon[data-open="true"]{transform:rotate(45deg);background:color-mix(in srgb,var(--accent) 10%,var(--surface))}
        .faq-bar-h,.faq-bar-v{position:absolute;border-radius:2px;background:var(--accent)}
        .faq-bar-h{width:11px;height:1.8px}
        .faq-bar-v{width:1.8px;height:11px}

        .faq-panel{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .34s cubic-bezier(.2,.7,.2,1),opacity .24s ease}
        .faq-panel[data-open="true"]{grid-template-rows:1fr;opacity:1}
        .faq-panelclip{overflow:hidden}
        .faq-a{padding:0 0 26px;max-width:640px}
        .faq-a p{margin:0;font-family:var(--font-manrope),system-ui,sans-serif;font-size:16.5px;line-height:1.75;color:#3a444a}
        .faq-a a{color:var(--sea);font-weight:600;text-decoration:underline;text-underline-offset:2px}
        .faq-a a:hover{color:var(--accent);text-decoration:none}

        @media (prefers-reduced-motion:reduce){.faq-panel,.faq-icon,.faq-chip{transition:none}}
      `}</style>
    </div>
  );
}
