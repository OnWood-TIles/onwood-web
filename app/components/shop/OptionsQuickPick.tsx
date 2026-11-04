"use client";

import { useEffect, useMemo, useState } from "react";
import type { WebsiteRange } from "../../../lib/onbase/client";
import {
  choicePrice, describeOptions, groupShown, isAvailable, many, normalizeSelection, priceOptions,
  type OptionGroup, type OptionSelection,
} from "../../../lib/options";
import SaveButton from "../wishlist/SaveButton";
import AddToQuoteButton from "../quote/AddToQuoteButton";

// Compact picker for a product with only a few options (e.g. a frameless mirror: 2-4
// sizes and an LED backlight). Sits beside the photos under the name, like the colour
// chips on a tile, instead of the full step-by-step builder (kept for vanities).

const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

export default function OptionsQuickPick({ range, query }: { range: WebsiteRange; query: Record<string, string> }) {
  const o = range.options!;
  const [sel, setSel] = useState<OptionSelection>(() => {
    const s: OptionSelection = {};
    for (const g of o.groups) { const v = query[`o_${g.key}`]; if (v != null) s[g.key] = g.type === "multi" ? v.split(",").filter(Boolean) : v; }
    return normalizeSelection(o, s);
  });
  const [url, setUrl] = useState("");
  useEffect(() => {
    const q = new URLSearchParams();
    for (const g of o.groups) { const v = sel[g.key]; const s = Array.isArray(v) ? v.join(",") : v; if (s) q.set(`o_${g.key}`, s); }
    const next = `${window.location.pathname}?${q.toString()}`;
    window.history.replaceState(null, "", next);
    setUrl(next);
  }, [sel, o.groups]);

  const priced = useMemo(() => priceOptions(o, sel), [o, sel]);
  const spec = describeOptions(o, sel);
  const pick = (g: OptionGroup, v: string | string[] | undefined) => setSel((s) => normalizeSelection(o, { ...s, [g.key]: v }));

  return (
    <div className="vb-qp">
      <div className="vb-qp-price"><strong>{fmt(priced.total)}</strong><span>incl. GST</span></div>
      {o.groups.filter((g) => groupShown(g, sel)).map((g) => {
        const avail = g.choices.filter((c) => isAvailable(o, g, c, sel));
        if (!avail.length) return null;
        const picked = many(sel[g.key]);
        // A single fixed choice (e.g. the only size) is shown as a fact, not a button.
        if (g.type === "single" && avail.length === 1 && g.required) {
          return <p key={g.key} className="vb-qp-fact"><span>{g.label}</span>{avail[0].label}{avail[0].detail ? ` (${avail[0].detail})` : ""}</p>;
        }
        return (
          <div key={g.key} className="vb-qp-g">
            <p className="vb-qp-l">{g.type === "multi" ? "Add" : g.label}</p>
            <div className="vb-qp-chips">
              {avail.map((c) => {
                const on = picked.includes(c.key);
                const p = choicePrice(c, sel);
                const tableish = g.type === "single" && g.required;
                return (
                  <button type="button" key={c.key} aria-pressed={on} className={`vb-qp-chip ${on ? "on" : ""}`}
                    onClick={() => pick(g, g.type === "multi" ? (on ? picked.filter((k) => k !== c.key) : [...picked, c.key]) : on && !g.required ? undefined : c.key)}>
                    {c.image && <img src={c.image} alt="" />}
                    <span>{c.label}</span>
                    {p ? <em>{tableish ? fmt(o.basePrice + p) : `+${fmt(p)}`}</em> : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!priced.ok && <p className="vb-fine" style={{ color: "#b42318" }}>{priced.errors[0]}</p>}
      <div className="vb-ctas">
        {priced.ok && (
          <AddToQuoteButton label="Add to quote" item={{
            kind: "options", href: url || `/product/${range.slug}`, name: range.name, image: range.heroImage ?? null, rangeId: range.id,
            unit: "Per Unit", boxQuantity: 1, coverageM2: null, unitPrice: priced.total, quantity: 1, options: sel, spec,
          }} />
        )}
        <SaveButton variant="inline" item={{ href: url || `/product/${range.slug}`, name: range.name }} />
      </div>
      <p className="vb-fine">{o.source?.supplier ? `Made to order by ${o.source.supplier}. ` : ""}We confirm stock, freight and timing with your quote.</p>
    </div>
  );
}
