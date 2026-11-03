"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { WebsiteRange } from "../../../lib/onbase/client";
import {
  choicePrice, describeOptions, drawMeta, isAvailable, many, normalizeSelection, one, priceOptions,
  type OptionChoice, type OptionGroup, type OptionSelection, type ProductOptions,
} from "../../../lib/options";
import SaveButton from "../wishlist/SaveButton";
import OptionsDrawing from "./OptionsDrawing";

// Customer price builder for any product with options (set up on the OnBase Pricing
// tab), e.g. a Marquis vanity range: one step per option group, a live GST-inclusive
// total and the generated drawing. A calculator only (no checkout): the build lives in
// the URL so it can be saved, shared or sent to us via "Enquire".

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

export default function OptionsBuilder({ range, query }: { range: WebsiteRange; query: Record<string, string> }) {
  const o = range.options!;
  const [sel, setSel] = useState<OptionSelection>(() => readQuery(o, query));
  const [width, setWidth] = useState<number | null>(null);
  const [url, setUrl] = useState("");

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

  const priced = useMemo(() => priceOptions(o, sel), [o, sel]);
  const spec = describeOptions(o, sel);
  const meta = drawMeta(o, sel);
  const pick = (g: OptionGroup, v: string | string[] | undefined) => setSel((s) => normalizeSelection(o, { ...s, [g.key]: v }));
  const lead = o.groups[0];
  const sizeCards = !!lead && lead.type === "single" && o.drawing !== "none" && lead.choices.some((c) => c.draw?.width);
  const widths = sizeCards ? [...new Set(lead.choices.map((c) => c.draw?.width).filter((w): w is number => !!w))].sort((a, b) => a - b) : [];
  const supplier = o.source?.supplier;
  const enquire = `/contact?product=${encodeURIComponent(range.name)}&build=${encodeURIComponent([...spec, `Price shown: ${fmt(priced.total)} incl. GST`, url ? `https://onwoodtiles.com.au${url}` : ""].filter(Boolean).join("\n"))}`;
  let n = 0;

  const priceLabel = (g: OptionGroup, c: OptionChoice) => {
    if (o.table?.groups.includes(g.key)) {
      const p = priceOptions(o, normalizeSelection(o, { ...sel, [g.key]: c.key }));
      return p.ok ? fmt(p.total) : "";
    }
    const p = choicePrice(c, sel);
    return p ? `+${fmt(p)}` : g.type === "single" && !g.required ? "Included" : "";
  };

  return (
    <div className="vb">
      <div className="vb-main">
        {o.groups.map((g, gi) => {
          if (g.type === "text") {
            return (
              <section className="vb-step" key={g.key}>
                <Head n={++n} title={g.label} hint={g.help} />
                <input className="vb-text" value={String(one(sel[g.key]) ?? "")} placeholder={g.placeholder} onChange={(e) => setSel((s) => ({ ...s, [g.key]: e.target.value }))} />
              </section>
            );
          }
          const avail = g.choices.filter((c) => isAvailable(o, g, c, sel));
          if (!avail.length) return null;
          const picked = many(sel[g.key]);

          if (gi === 0 && sizeCards) {
            const shown = width ? avail.filter((c) => c.draw?.width === width) : avail;
            return (
              <section className="vb-step" key={g.key}>
                <Head n={++n} title={`Choose your ${g.label.toLowerCase()}`} hint={g.help} />
                {widths.length > 1 && (
                  <div className="vb-chips" role="group" aria-label="Filter by width">
                    <button type="button" className={`vb-chip ${width === null ? "on" : ""}`} onClick={() => setWidth(null)}>All</button>
                    {widths.map((w) => <button type="button" key={w} className={`vb-chip ${width === w ? "on" : ""}`} onClick={() => setWidth(w)}>{w}mm</button>)}
                  </div>
                )}
                <div className="vb-models">
                  {shown.map((c) => {
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
              </section>
            );
          }

          const long = g.choices.length > 10 || g.choices.some((c) => c.section);
          if (long) {
            const sections = [...new Set(avail.map((c) => c.section ?? ""))];
            const cur = avail.find((c) => picked.includes(c.key));
            return (
              <section className="vb-step" key={g.key}>
                <Head n={++n} title={g.label} hint={g.help} />
                {cur && <p className="vb-picked">Selected: <strong>{cur.label}</strong>{cur.section ? ` (${cur.section})` : ""} {priceLabel(g, cur) && <span>{priceLabel(g, cur)}</span>}</p>}
                {sections.map((sec) => (
                  <div key={sec || "all"} className="vb-sec">
                    {sec && <p className="vb-sec-h">{sec}</p>}
                    <div className="vb-swatches">
                      {avail.filter((c) => (c.section ?? "") === sec).map((c) => {
                        const on = picked.includes(c.key);
                        const p = choicePrice(c, sel);
                        return (
                          <button type="button" key={c.key} aria-pressed={on} title={c.detail ?? c.label}
                            onClick={() => pick(g, g.type === "multi" ? (on ? picked.filter((k) => k !== c.key) : [...picked, c.key]) : on && !g.required ? undefined : c.key)}
                            className={`vb-sw ${on ? "on" : ""} ${c.image ? "img" : ""}`}>
                            {c.image && <img src={c.image} alt="" />}
                            <span>{c.label}{p ? ` +${fmt(p)}` : ""}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            );
          }

          return (
            <section className="vb-step" key={g.key}>
              <Head n={++n} title={g.label} hint={g.help} />
              <div className="vb-opts">
                {avail.map((c) => {
                  const on = picked.includes(c.key);
                  return (
                    <button type="button" key={c.key} aria-pressed={on}
                      onClick={() => pick(g, g.type === "multi" ? (on ? picked.filter((k) => k !== c.key) : [...picked, c.key]) : on && !g.required ? undefined : c.key)}
                      className={`vb-opt ${on ? "on" : ""}`}>
                      {c.image && <img src={c.image} alt="" className="vb-opt-img" />}
                      <strong>{c.label}</strong>
                      {c.detail && <small>{c.detail}</small>}
                      <span>{priceLabel(g, c)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="vb-side">
        <div className="vb-summary" id="vb-summary">
          {o.drawing !== "none" ? (
            <div className="vb-draw"><OptionsDrawing style={o.drawing} meta={meta} size={300} /><small>Illustration only</small></div>
          ) : range.heroImage ? (
            <div className="vb-draw"><img src={range.heroImage} alt={range.name} style={{ maxWidth: "100%", borderRadius: 12 }} /></div>
          ) : null}
          <h3>{range.name}</h3>
          <ul>{spec.map((s) => <li key={s}>{cap(s)}</li>)}</ul>
          <div className="vb-total"><span>Your build</span><strong>{fmt(priced.total)}</strong></div>
          {!priced.ok && <p className="vb-fine" style={{ color: "#b42318" }}>{priced.errors[0]}</p>}
          <p className="vb-fine">Price includes GST.{supplier ? ` Made to order by ${supplier}.` : ""}</p>
          <div className="vb-ctas">
            <Link href={enquire} className="vb-primary">Enquire about this build →</Link>
            <SaveButton variant="inline" item={{ href: url || `/product/${range.slug}`, name: `${range.name} (your build)` }} />
          </div>
          <Link href="/book" className="vb-link">See it in the showroom</Link>
        </div>
      </aside>

      <a href="#vb-summary" className="vb-bar"><span>{range.name}</span><strong>{fmt(priced.total)}</strong><em>View build</em></a>
    </div>
  );
}

function Head({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return <div className="vb-step-h"><span className="vb-num">{n}</span><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div></div>;
}
