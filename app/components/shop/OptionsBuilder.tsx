"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { WebsiteRange } from "../../../lib/onbase/client";
import {
  choicePrice, describeOptions, drawMeta, isAvailable, many, normalizeSelection, one, priceOptions,
  type OptionChoice, type OptionGroup, type OptionSelection, type ProductOptions,
} from "../../../lib/options";
import SaveButton from "../wishlist/SaveButton";
import AddToQuoteButton from "../quote/AddToQuoteButton";
import OptionsDrawing from "./OptionsDrawing";

// Customer price builder for any product with options (set up on the OnBase Pricing
// tab), e.g. a Marquis vanity range: one collapsible step per option group (picking
// a choice closes the step and opens the next), a live GST-inclusive total and the
// generated drawing. Choices that change the drawing (mounting, benchtop) show it;
// choices with photos (colours, basins, handles) open larger in a pop-up. A
// calculator only (no checkout): the build lives in the URL so it can be saved,
// shared or sent to us via "Enquire".

const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function readQuery(o: ProductOptions, q: Record<string, string>): OptionSelection {
  const sel: OptionSelection = {};
  for (const g of o.groups) {
    const v = q[`o_${g.key}`];
    if (v == null) continue;
    sel[g.key] = g.type === "multi" ? v.split(",").filter(Boolean) : v;
  }
  return normalizeSelection(o, sel);
}

/** Cheapest price that includes this choice ("from"). */
function choiceFrom(o: ProductOptions, g: OptionGroup, c: OptionChoice): number | null {
  const t = o.table;
  if (t?.groups.includes(g.key)) {
    const idx = t.groups.indexOf(g.key);
    const vals = Object.entries(t.cells).filter(([k, v]) => v != null && k.split("|")[idx] === c.key).map(([, v]) => v as number);
    return vals.length ? o.basePrice + Math.min(...vals) : null;
  }
  const p = choicePrice(c, {});
  return p == null ? null : o.basePrice + p;
}

/** Groups shown for this selection (a group with nothing on offer is skipped). */
const visibleGroups = (o: ProductOptions, sel: OptionSelection) =>
  o.groups.filter((g) => g.type === "text" || g.choices.some((c) => isAvailable(o, g, c, sel)));

export default function OptionsBuilder({ range, query }: { range: WebsiteRange; query: Record<string, string> }) {
  const o = range.options!;
  const [sel, setSel] = useState<OptionSelection>(() => readQuery(o, query));
  const [width, setWidth] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState<string | null>(o.groups[0]?.key ?? null);
  const [popup, setPopup] = useState<string | null>(null);
  const scrollTo = useRef<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams();
    for (const g of o.groups) {
      const v = sel[g.key];
      const s = Array.isArray(v) ? v.join(",") : v;
      if (s) q.set(`o_${g.key}`, s);
    }
    const next = `${window.location.pathname}?${q.toString()}`;
    window.history.replaceState(null, "", next);
    setUrl(next);
  }, [sel, o.groups]);

  // After a pick moves on to the next step, bring that step into view.
  useEffect(() => {
    if (!open || scrollTo.current !== open) return;
    scrollTo.current = null;
    document.getElementById(`vb-step-${open}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  const priced = useMemo(() => priceOptions(o, sel), [o, sel]);
  const spec = describeOptions(o, sel);
  const meta = drawMeta(o, sel);
  const steps = visibleGroups(o, sel);
  const draws = o.drawing !== "none";
  const lead = o.groups[0];
  const sizeCards = !!lead && lead.type === "single" && draws && lead.choices.some((c) => c.draw?.width);
  const widths = sizeCards ? [...new Set(lead.choices.map((c) => c.draw?.width).filter((w): w is number => !!w))].sort((a, b) => a - b) : [];
  const supplier = o.source?.supplier;
  const enquire = `/contact?product=${encodeURIComponent(range.name)}&build=${encodeURIComponent([...spec, `Price shown: ${fmt(priced.total)} incl. GST`, url ? `https://onwoodtiles.com.au${url}` : ""].filter(Boolean).join("\n"))}`;

  /** Set a group's value; a single pick closes this step and opens the next one. */
  const pick = (g: OptionGroup, v: string | string[] | undefined, advance = g.type === "single") => {
    const next = normalizeSelection(o, { ...sel, [g.key]: v });
    setSel(next);
    if (!advance) return;
    const after = visibleGroups(o, next);
    const k = after[after.findIndex((x) => x.key === g.key) + 1]?.key ?? null;
    scrollTo.current = k;
    setOpen(k);
  };
  const toggle = (g: OptionGroup, c: OptionChoice, picked: string[]) => {
    const on = picked.includes(c.key);
    if (g.type === "multi") pick(g, on ? picked.filter((k) => k !== c.key) : [...picked, c.key]);
    else pick(g, on && !g.required ? undefined : c.key);
  };

  const priceLabel = (g: OptionGroup, c: OptionChoice) => {
    if (o.table?.groups.includes(g.key)) {
      const p = priceOptions(o, normalizeSelection(o, { ...sel, [g.key]: c.key }));
      return p.ok ? fmt(p.total) : "";
    }
    const p = choicePrice(c, sel);
    return p ? `${p > 0 ? "+" : "-"}${fmt(Math.abs(p))}` : g.type === "single" && !g.required ? "Included" : "";
  };

  /** What the closed step shows: the current choice(s). */
  const summary = (g: OptionGroup) => {
    if (g.type === "text") return String(one(sel[g.key]) ?? "").trim() || "Optional";
    const cs = many(sel[g.key]).map((k) => g.choices.find((c) => c.key === k)).filter((c): c is OptionChoice => !!c);
    if (!cs.length) return g.type === "multi" ? "None added" : g.required ? "Choose one" : "Standard";
    return cs.map((c) => (c.section && g.type === "single" && !c.label.includes(c.section) ? `${c.label} (${c.section})` : c.label)).join(", ");
  };
  const summaryImg = (g: OptionGroup) => g.choices.find((c) => c.key === one(sel[g.key]))?.image ?? null;

  const popGroup = popup ? o.groups.find((g) => g.key === popup) ?? null : null;

  return (
    <div className="vb">
      <div className="vb-main">
        {draws && (
          <div className="vb-mini" aria-hidden="true">
            <OptionsDrawing style={o.drawing} meta={meta} size={130} />
            <div>
              <span>{range.name}</span>
              <strong>{fmt(priced.total)}</strong>
              <em>Updates as you choose</em>
            </div>
          </div>
        )}
        {steps.map((g, gi) => {
          const isOpen = open === g.key;
          const avail = g.type === "text" ? [] : g.choices.filter((c) => isAvailable(o, g, c, sel));
          const picked = many(sel[g.key]);
          const hasImages = avail.some((c) => c.image);
          const img = !isOpen ? summaryImg(g) : null;
          return (
            <section className={`vb-step ${isOpen ? "open" : ""}`} key={g.key} id={`vb-step-${g.key}`}>
              <button type="button" className="vb-step-h" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.key)}>
                <span className={`vb-num ${picked.length || (g.type === "text" && one(sel[g.key])) ? "done" : ""}`}>{gi + 1}</span>
                <span className="vb-step-t">
                  <strong>{gi === 0 && sizeCards ? `Choose your ${g.label.toLowerCase()}` : g.label}</strong>
                  {!isOpen && <small>{img && <img src={img} alt="" />}{summary(g)}</small>}
                  {isOpen && g.help && <small>{g.help}</small>}
                </span>
                <span className="vb-step-c">{isOpen ? "Close" : picked.length ? "Change" : "Choose"}</span>
              </button>

              {isOpen && (
                <div className="vb-step-b">
                  {g.type === "text" ? (
                    <input className="vb-text" value={String(one(sel[g.key]) ?? "")} placeholder={g.placeholder} onChange={(e) => setSel((s) => ({ ...s, [g.key]: e.target.value }))} />
                  ) : gi === 0 && sizeCards ? (
                    <>
                      {widths.length > 1 && (
                        <div className="vb-chips" role="group" aria-label="Filter by width">
                          <button type="button" className={`vb-chip ${width === null ? "on" : ""}`} onClick={() => setWidth(null)}>All</button>
                          {widths.map((w) => <button type="button" key={w} className={`vb-chip ${width === w ? "on" : ""}`} onClick={() => setWidth(w)}>{w}mm</button>)}
                        </div>
                      )}
                      <div className="vb-models">
                        {(width ? avail.filter((c) => c.draw?.width === width) : avail).map((c) => {
                          const from = choiceFrom(o, g, c);
                          return (
                            <button type="button" key={c.key} onClick={() => pick(g, c.key)} className={`vb-card ${picked.includes(c.key) ? "on" : ""}`}>
                              {c.image ? <img src={c.image} alt="" className="vb-card-img" /> : <OptionsDrawing style={o.drawing} meta={drawMeta(o, normalizeSelection(o, { [g.key]: c.key }))} size={150} />}
                              <strong>{c.label}</strong>
                              {c.detail && <span>{c.detail}</span>}
                              {from != null && <em>from {fmt(from)}</em>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : hasImages ? (
                    <Swatches g={g} avail={avail} picked={picked} priceOf={(c) => { const p = choicePrice(c, sel); return p ? `${p > 0 ? "+" : "-"}${fmt(Math.abs(p))}` : ""; }}
                      onPick={(c) => toggle(g, c, picked)} onLarger={() => setPopup(g.key)} />
                  ) : draws && g.type === "single" && avail.some((c) => c.draw) ? (
                    // Choices that change the drawing: show each one drawn on the current build.
                    <div className="vb-opts vb-drawn">
                      {!g.required && (
                        <button type="button" aria-pressed={!picked.length} onClick={() => pick(g, undefined)} className={`vb-opt ${!picked.length ? "on" : ""}`}>
                          <OptionsDrawing style={o.drawing} meta={drawMeta(o, normalizeSelection(o, { ...sel, [g.key]: undefined }))} size={170} />
                          <strong>Standard</strong>
                          <span>Included</span>
                        </button>
                      )}
                      {avail.map((c) => {
                        const on = picked.includes(c.key);
                        return (
                          <button type="button" key={c.key} aria-pressed={on} onClick={() => pick(g, c.key)} className={`vb-opt ${on ? "on" : ""}`}>
                            <OptionsDrawing style={o.drawing} meta={drawMeta(o, normalizeSelection(o, { ...sel, [g.key]: c.key }))} size={170} />
                            <strong>{c.label}</strong>
                            {c.detail && <small>{c.detail}</small>}
                            <span>{priceLabel(g, c)}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="vb-opts">
                      {avail.map((c) => {
                        const on = picked.includes(c.key);
                        return (
                          <button type="button" key={c.key} aria-pressed={on} onClick={() => toggle(g, c, picked)} className={`vb-opt ${on ? "on" : ""}`}>
                            <strong>{c.label}</strong>
                            {c.detail && <small>{c.detail}</small>}
                            <span>{priceLabel(g, c)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {(g.type !== "single" || !g.required) && g.type !== "text" && (
                    <button type="button" className="vb-next" onClick={() => { const k = steps[gi + 1]?.key ?? null; scrollTo.current = k; setOpen(k); }}>
                      {steps[gi + 1] ? `Next: ${steps[gi + 1].label}` : "Done"}
                    </button>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <aside className="vb-side">
        <div className="vb-summary" id="vb-summary">
          {draws ? (
            <div className="vb-draw"><OptionsDrawing style={o.drawing} meta={meta} size={300} /><small>Your build (illustration only)</small></div>
          ) : range.heroImage ? (
            <div className="vb-draw"><img src={range.heroImage} alt={range.name} style={{ maxWidth: "100%", borderRadius: 12 }} /></div>
          ) : null}
          <h3>{range.name}</h3>
          <ul>{spec.map((s) => <li key={s}>{cap(s)}</li>)}</ul>
          <div className="vb-total"><span>Your build</span><strong>{fmt(priced.total)}</strong></div>
          {!priced.ok && <p className="vb-fine" style={{ color: "#b42318" }}>{priced.errors[0]}</p>}
          <p className="vb-fine">Price includes GST.{supplier ? ` Made to order by ${supplier}.` : ""}</p>
          <div className="vb-ctas">
            {priced.ok && (
              <AddToQuoteButton label="Add build to quote" item={{
                kind: "options", href: url || `/product/${range.slug}`, name: range.name, image: range.heroImage ?? null, rangeId: range.id,
                unit: "Per Unit", boxQuantity: 1, coverageM2: null, unitPrice: priced.total, quantity: 1, options: sel, spec,
              }} />
            )}
            <SaveButton variant="inline" item={{ href: url || `/product/${range.slug}`, name: `${range.name} (your build)` }} />
          </div>
          <Link href={enquire} className="vb-link" style={{ display: "block" }}>Or ask us a question about this build</Link>
          <Link href="/book" className="vb-link">See it in the showroom</Link>
        </div>
      </aside>

      <a href="#vb-summary" className="vb-bar"><span>{range.name}</span><strong>{fmt(priced.total)}</strong><em>View build</em></a>

      {popGroup && (
        <SwatchPopup g={popGroup} avail={popGroup.choices.filter((c) => isAvailable(o, popGroup, c, sel))} picked={many(sel[popGroup.key])}
          priceOf={(c) => { const p = choicePrice(c, sel); return p ? `${p > 0 ? "+" : "-"}${fmt(Math.abs(p))}` : ""; }}
          onPick={(c) => { setPopup(null); toggle(popGroup, c, many(sel[popGroup.key])); }} onClose={() => setPopup(null)} />
      )}
    </div>
  );
}

type SwatchProps = { g: OptionGroup; avail: OptionChoice[]; picked: string[]; priceOf: (c: OptionChoice) => string; onPick: (c: OptionChoice) => void };
const sectionsOf = (avail: OptionChoice[]) => [...new Set(avail.map((c) => c.section ?? ""))];
const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Small swatches inside the step, with a button to see them larger. */
function Swatches({ avail, picked, priceOf, onPick, onLarger }: SwatchProps & { onLarger: () => void }) {
  return (
    <>
      <button type="button" className="vb-larger" onClick={onLarger}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        View all {avail.length} larger
      </button>
      {sectionsOf(avail).map((sec) => (
        <div key={sec || "all"} className="vb-sec">
          {sec && <p className="vb-sec-h">{sec}</p>}
          <div className="vb-swatches">
            {avail.filter((c) => (c.section ?? "") === sec).map((c) => {
              const on = picked.includes(c.key);
              const p = priceOf(c);
              return (
                <button type="button" key={c.key} aria-pressed={on} title={c.detail ?? c.label} onClick={() => onPick(c)} className={`vb-sw img ${on ? "on" : ""}`}>
                  {c.image ? <img src={c.image} alt="" loading="lazy" /> : <i>{initials(c.label)}</i>}
                  <span>{c.label}{p ? ` ${p}` : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

/** Larger swatches in a pop-up, so colours, basins and handles are easy to compare. */
function SwatchPopup({ g, avail, picked, priceOf, onPick, onClose }: SwatchProps & { onClose: () => void }) {
  const secs = sectionsOf(avail);
  const [tab, setTab] = useState<string | null>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [onClose]);
  const shown = secs.filter((s) => tab === null || s === tab);
  return (
    <div className="vb-pop" role="dialog" aria-modal="true" aria-label={g.label} onClick={onClose}>
      <div className="vb-pop-panel" onClick={(e) => e.stopPropagation()}>
        <div className="vb-pop-h">
          <h2>{g.label}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {secs.length > 1 && (
          <div className="vb-chips vb-pop-tabs" role="group" aria-label="Filter">
            <button type="button" className={`vb-chip ${tab === null ? "on" : ""}`} onClick={() => setTab(null)}>All</button>
            {secs.map((s) => <button type="button" key={s} className={`vb-chip ${tab === s ? "on" : ""}`} onClick={() => setTab(s)}>{s || "Other"}</button>)}
          </div>
        )}
        <div className="vb-pop-body">
          {shown.map((sec) => (
            <div key={sec || "all"} className="vb-sec">
              {sec && secs.length > 1 && <p className="vb-sec-h">{sec}</p>}
              <div className="vb-pop-grid">
                {avail.filter((c) => (c.section ?? "") === sec).map((c) => {
                  const on = picked.includes(c.key);
                  const p = priceOf(c);
                  return (
                    <button type="button" key={c.key} aria-pressed={on} onClick={() => onPick(c)} className={`vb-pop-tile ${on ? "on" : ""}`}>
                      {c.image ? <img src={c.image} alt="" loading="lazy" /> : <i>{initials(c.label)}</i>}
                      <strong>{c.label}</strong>
                      {c.detail && <small>{c.detail}</small>}
                      {p && <span>{p}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
