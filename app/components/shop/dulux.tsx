"use client";
// Dulux colour match: the Dulux Australia colour range (name, specifier code, on-screen colour,
// from dulux.com.au, Nov 2026) in public/dulux-au.json, loaded only when a builder asks for it.
// The customer searches by name or code; the pick fills in both answers, and the drawing and the
// 3D model take the colour instead of the multi-colour "any Dulux colour" swatch.
import { useEffect, useState } from "react";
import { one, type OptionSelection, type ProductOptions } from "../../../lib/options";

export type DuluxColour = [name: string, code: string, hex: string];

let cache: Promise<DuluxColour[]> | null = null;
const load = () => (cache ??= fetch("/dulux-au.json").then((r) => (r.ok ? r.json() : [])).catch(() => []));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Is the build's cabinet finish "Dulux colour match"? */
export function duluxPicked(o: ProductOptions, sel: OptionSelection) {
  const fin = o.groups.find((g) => g.drawFill === "cabinet");
  const k = fin ? one(sel[fin.key]) : undefined;
  return !!k && /dulux colour match/i.test(fin?.choices.find((c) => c.key === k)?.label ?? "");
}

/** The Dulux range, once a Dulux colour match is picked. */
export function useDulux(on: boolean) {
  const [list, setList] = useState<DuluxColour[]>([]);
  useEffect(() => { if (on) load().then(setList); }, [on]);
  return list;
}

/** The colour the customer named (by code first, then by name). */
export function findDulux(list: DuluxColour[], sel: OptionSelection): DuluxColour | undefined {
  const code = norm(String(one(sel.duluxCode) ?? "")), name = norm(String(one(sel.duluxName) ?? ""));
  return (code && list.find((c) => norm(c[1]) === code)) || (name ? list.find((c) => norm(c[0]) === name) : undefined);
}

export const solidSwatch = (hex: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="${hex}"/></svg>`)}`;

/** The "Dulux colour name" answer: type to search the range; a pick fills the name and code. */
export function DuluxNameInput({ list, sel, setSel, className, id }: { list: DuluxColour[]; sel: OptionSelection; setSel: (f: (s: OptionSelection) => OptionSelection) => void; className?: string; id?: string }) {
  const value = String(one(sel.duluxName) ?? "");
  const hit = findDulux(list, sel);
  const listId = `${id ?? "dulux"}-list`;
  return (
    <div className="dlx">
      <div className="dlx-row">
        {hit && <span className="dlx-dot" style={{ background: hit[2] }} aria-hidden />}
        <input className={className} id={id} list={listId} value={value} placeholder="Start typing a Dulux colour, e.g. Natural White" autoComplete="off"
          onChange={(e) => {
            const v = e.target.value, m = v.match(/^(.*) \(([A-Z0-9]+)\)$/), c = m ? list.find((x) => x[0] === m[1] && x[1] === m[2]) : undefined;
            setSel((s) => (c ? { ...s, duluxName: c[0], duluxCode: c[1] } : { ...s, duluxName: v }));
          }} />
      </div>
      <datalist id={listId}>{list.map((c) => <option key={c[1]} value={`${c[0]} (${c[1]})`} />)}</datalist>
      <small className="dlx-note">{hit ? `Dulux ${hit[0]}, code ${hit[1]}. Colours on screen are a guide; check a real Dulux swatch.` : list.length ? "Pick from the list to fill in the code, or type any Dulux colour name." : ""}</small>
      <style>{`.dlx-row{display:flex;align-items:center;gap:8px}.dlx-row input{flex:1}.dlx-dot{width:28px;height:28px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}.dlx-note{display:block;margin-top:6px;font-size:12px;color:#5d6766}`}</style>
    </div>
  );
}
