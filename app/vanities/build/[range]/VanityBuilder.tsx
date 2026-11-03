"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Builder, BuilderModel, BuilderRow } from "../../../../lib/onbase/client";
import SaveButton from "../../../components/wishlist/SaveButton";
import Elevation from "../Elevation";

// Customer price builder for one configurable range (e.g. a Marquis vanity range):
// size -> mounting -> top & basin -> extras, with a live GST-inclusive total. A
// calculator only (no checkout): the build lives in the URL so it can be saved,
// shared or sent to us via "Enquire". All prices come GST-inclusive from OnBase.

const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
const MOUNT: Record<string, string> = { wallmount: "Wall-hung", kick: "Kick base", legs: "On legs" };
const TOP_NOTE: Record<string, string> = {
  symphony: "20mm acrylic. Hard wearing and repairable.",
  stone: "Premium stone or porcelain top.",
  acrylic: "One-piece acrylic top with the basin moulded in.",
  ceramic: "One-piece ceramic top with the basin moulded in.",
  polymarble: "One-piece polymarble top with the basin moulded in.",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const tidy = (s: string) => s.replace(/(\d)(door|drawer)/gi, "$1 $2").replace(/,?\s*left or right/i, "").trim();
const rowLabel = (r: BuilderRow) => [r.mount ? MOUNT[r.mount] : "", tidy(r.config)].filter(Boolean).join(", ");
const cheapestCol = (m: BuilderModel, r: BuilderRow) => m.columns.filter((c) => r.prices[c.key] != null).sort((a, b) => r.prices[a.key]! - r.prices[b.key]!)[0]?.key ?? "";
const addonsFor = (m: BuilderModel, r?: BuilderRow) => m.addons.filter((a) => !a.mounts || (r && a.mounts.includes(r.mount)));

type Sel = { m: string; r: string; c: string; x: string[]; t: string; o: Record<string, string> };

function readQuery(b: Builder, q: URLSearchParams): Sel {
  const m = b.list.find((x) => x.slug === q.get("m")) ?? b.list[0];
  const r = m.rows.find((x) => x.key === q.get("r")) ?? m.rows[0];
  const c = m.columns.some((x) => x.key === q.get("c") && r.prices[x.key] != null) ? q.get("c")! : cheapestCol(m, r);
  const x = (q.get("x") ?? "").split(",").filter((k) => addonsFor(m, r).some((a) => a.key === k));
  const t = m.topUpgrades.some((u) => u.key === q.get("t")) ? q.get("t")! : "";
  const o: Record<string, string> = {};
  for (const g of b.optionGroups) { const v = q.get(`o_${g.key}`); if (v && g.options.some((op) => op.value === v)) o[g.key] = v; }
  return { m: m.slug, r: r.key, c, x, t, o };
}

// `query` = the page's search params (server-provided, so a shared build link renders
// the same on the server and the client).
export default function VanityBuilder({ builder, query }: { builder: Builder; query: Record<string, string> }) {
  const b = builder;
  const [sel, setSel] = useState<Sel>(() => readQuery(b, new URLSearchParams(query)));
  const [width, setWidth] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  const model = b.list.find((m) => m.slug === sel.m) ?? b.list[0];
  const row = model.rows.find((r) => r.key === sel.r) ?? model.rows[0];
  const col = model.columns.find((c) => c.key === sel.c);
  const offered = addonsFor(model, row);
  const upgrades = col?.top === "stone" ? model.topUpgrades : [];
  const widths = useMemo(() => [...new Set(b.list.map((m) => m.width).filter((w): w is number => !!w))].sort((a, z) => a - z), [b.list]);
  const shown = width ? b.list.filter((m) => m.width === width) : b.list;
  const isVanity = model.kind === "vanity";
  const legsOn = sel.x.includes("legs");
  const mountShown = legsOn ? "legs" : row.mount;

  // Keep the build in the URL (shareable / saveable), without adding history entries.
  useEffect(() => {
    const q = new URLSearchParams();
    q.set("m", sel.m); q.set("r", sel.r); if (sel.c) q.set("c", sel.c);
    if (sel.x.length) q.set("x", sel.x.join(",")); if (sel.t) q.set("t", sel.t);
    for (const [k, v] of Object.entries(sel.o)) q.set(`o_${k}`, v);
    const next = `${window.location.pathname}?${q.toString()}`;
    window.history.replaceState(null, "", next);
    setUrl(next);
  }, [sel]);

  function pickModel(m: BuilderModel) {
    const r = m.rows.find((x) => x.mount === row.mount && tidy(x.config) === tidy(row.config)) ?? m.rows.find((x) => x.mount === row.mount) ?? m.rows[0];
    const c = r.prices[sel.c] != null ? sel.c : cheapestCol(m, r);
    setSel((s) => ({ ...s, m: m.slug, r: r.key, c, x: s.x.filter((k) => addonsFor(m, r).some((a) => a.key === k)), t: m.topUpgrades.some((u) => u.key === s.t) && m.columns.find((x) => x.key === c)?.top === "stone" ? s.t : "" }));
  }
  function pickRow(r: BuilderRow) {
    const c = r.prices[sel.c] != null ? sel.c : cheapestCol(model, r);
    setSel((s) => ({ ...s, r: r.key, c, x: s.x.filter((k) => addonsFor(model, r).some((a) => a.key === k)) }));
  }

  // Price
  const lines: { label: string; amount: number }[] = [];
  const base = col ? row.prices[col.key] : null;
  if (base != null && col) lines.push({ label: `${model.model}, ${rowLabel(row)}`, amount: base });
  for (const k of sel.x) { const a = offered.find((z) => z.key === k); if (a) lines.push({ label: a.label, amount: a.price }); }
  const up = upgrades.find((u) => u.key === sel.t); if (up) lines.push({ label: up.label, amount: up.price });
  for (const g of b.optionGroups) {
    const o = g.options.find((z) => z.value === sel.o[g.key]);
    if (o?.surcharge) lines.push({ label: `${g.label}: ${o.label}`, amount: o.surcharge });
    if (o?.addon) { const a = model.addons.find((z) => z.key === o.addon); if (a && !sel.x.includes(a.key)) lines.push({ label: a.label, amount: a.price }); }
  }
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const spec = [
    `${model.name}`,
    [model.width ? `${model.width}mm` : "", model.basinLayout ? `${model.basinLayout} basin` : "", tidy(row.config), mountShown ? MOUNT[mountShown] : ""].filter(Boolean).join(", "),
    col?.label ?? "",
    ...b.optionGroups.flatMap((g) => { const o = g.options.find((z) => z.value === sel.o[g.key]); return o ? [`${g.label}: ${o.label}`] : []; }),
    ...lines.slice(1).filter((l) => !l.label.includes(":")).map((l) => `+ ${l.label}`),
  ].filter(Boolean);
  const enquire = `/contact?product=${encodeURIComponent(model.name)}&build=${encodeURIComponent([...spec.slice(1), `Price shown: ${fmt(total)} incl. GST`, url ? `https://onwoodtiles.com.au${url}` : ""].filter(Boolean).join("\n"))}`;

  const step = (n: number, title: string, hint?: string) => (
    <div className="vb-step-h"><span className="vb-num">{n}</span><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div></div>
  );
  let n = 0;

  return (
    <div className="vb">
      <div className="vb-main">
        {b.list.length > 1 && (
          <section className="vb-step">
            {step(++n, isVanity ? "Choose your size" : "Choose your model", isVanity ? "Width, basin position and drawer layout." : undefined)}
            {widths.length > 1 && (
              <div className="vb-chips" role="group" aria-label="Filter by width">
                <button type="button" className={`vb-chip ${width === null ? "on" : ""}`} onClick={() => setWidth(null)}>All sizes</button>
                {widths.map((w) => <button type="button" key={w} className={`vb-chip ${width === w ? "on" : ""}`} onClick={() => setWidth(w)}>{w}mm</button>)}
              </div>
            )}
            <div className="vb-models">
              {shown.map((m) => {
                const r0 = m.rows.find((x) => x.mount === "wallmount") ?? m.rows[0];
                return (
                  <button type="button" key={m.slug} onClick={() => pickModel(m)} className={`vb-card ${m.slug === model.slug ? "on" : ""}`}>
                    <Elevation kind={m.kind} width={m.width} basinLayout={m.basinLayout} config={r0.config} mount={r0.mount} name={m.name} size={150} />
                    <strong>{m.model}</strong>
                    <span>{[m.width ? `${m.width}mm` : "", m.basinLayout ? `${m.basinLayout} basin` : "", tidy(r0.config)].filter(Boolean).join(" · ")}</span>
                    <em>from {fmt(m.from)}</em>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {model.rows.length > 1 && (
          <section className="vb-step">
            {step(++n, "Mounting", "Wall-hung floats off the floor; kick base and legs stand on it.")}
            <div className="vb-opts">
              {model.rows.map((r) => {
                const min = Math.min(...Object.values(r.prices).filter((v): v is number => v != null));
                return (
                  <button type="button" key={r.key} onClick={() => pickRow(r)} className={`vb-opt ${r.key === row.key ? "on" : ""}`}>
                    <strong>{rowLabel(r)}</strong><span>from {fmt(min)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {model.columns.length > 1 && (
          <section className="vb-step">
            {step(++n, isVanity ? "Benchtop & basin" : "Finish")}
            <div className="vb-opts">
              {model.columns.map((c) => {
                const v = row.prices[c.key];
                return (
                  <button type="button" key={c.key} disabled={v == null} onClick={() => setSel((s) => ({ ...s, c: c.key, t: c.top === "stone" ? s.t : "" }))} className={`vb-opt ${c.key === sel.c ? "on" : ""}`}>
                    <strong>{c.label}</strong>
                    {c.top && TOP_NOTE[c.top] && <small>{TOP_NOTE[c.top]}</small>}
                    <span>{v == null ? "Not available in this layout" : fmt(v)}</span>
                  </button>
                );
              })}
            </div>
            {upgrades.length > 0 && (
              <label className="vb-select">
                <span>Benchtop thickness</span>
                <select value={sel.t} onChange={(e) => setSel((s) => ({ ...s, t: e.target.value }))}>
                  <option value="">Standard thickness</option>
                  {upgrades.map((u) => <option key={u.key} value={u.key}>{u.label} (+{fmt(u.price)})</option>)}
                </select>
              </label>
            )}
          </section>
        )}

        {offered.length > 0 && (
          <section className="vb-step">
            {step(++n, "Extras")}
            <div className="vb-opts">
              {offered.map((a) => {
                const on = sel.x.includes(a.key);
                return (
                  <button type="button" key={a.key} aria-pressed={on} onClick={() => setSel((s) => ({ ...s, x: on ? s.x.filter((k) => k !== a.key) : [...s.x, a.key] }))} className={`vb-opt ${on ? "on" : ""}`}>
                    <strong>{a.label}</strong><span>+{fmt(a.price)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="vb-step">
          {step(++n, "Finishes & handles")}
          {b.optionGroups.length > 0 ? (
            <div className="vb-groups">
              {b.optionGroups.map((g) => (
                <label key={g.key} className="vb-select">
                  <span>{g.label}</span>
                  <select value={sel.o[g.key] ?? ""} onChange={(e) => setSel((s) => ({ ...s, o: { ...s.o, [g.key]: e.target.value } }))}>
                    <option value="">Choose...</option>
                    {g.options.map((o) => <option key={o.value} value={o.value}>{o.label}{o.surcharge ? ` (+${fmt(o.surcharge)})` : ""}</option>)}
                  </select>
                </label>
              ))}
            </div>
          ) : (
            <p className="vb-note">
              {isVanity ? "Cabinet finish, benchtop colour, basin and handle" : "Your finish"} are chosen with our team, in the showroom or over the phone. Most finishes are included in the price shown; we will confirm any that carry a surcharge before you order.
            </p>
          )}
        </section>
      </div>

      <aside className="vb-side">
        <div className="vb-summary" id="vb-summary">
          <div className="vb-draw">
            <Elevation kind={model.kind} width={model.width} basinLayout={model.basinLayout} config={row.config} mount={mountShown} basin={col?.basin} name={model.name} size={300} />
            <small>Illustration only</small>
          </div>
          <h3>{model.name}</h3>
          <ul>{spec.slice(1).map((s) => <li key={s}>{cap(s)}</li>)}</ul>
          <div className="vb-total">
            <span>Your build</span>
            <strong>{fmt(total)}</strong>
          </div>
          <p className="vb-fine">Price includes GST. Made to order in Australia by {b.supplier}.</p>
          <div className="vb-ctas">
            <Link href={enquire} className="vb-primary">Enquire about this build →</Link>
            <SaveButton variant="inline" item={{ href: url || `/vanities/build/${b.slug}`, name: `${model.name} (your build)` }} />
          </div>
          <Link href="/book" className="vb-link">See vanities in the showroom</Link>
        </div>
      </aside>

      {/* Phones: the running total stays in view while choosing. */}
      <a href="#vb-summary" className="vb-bar"><span>{model.model}</span><strong>{fmt(total)}</strong><em>View build</em></a>
    </div>
  );
}
