"use client";

import { useState } from "react";
import { CRITERIA, FLOORS, overall, band, type Floor } from "../../lib/floorScores";

// The interactive part of the floor-score editor (client). Seeded from
// lib/floorScores.ts; the public guide table only changes once the copied
// scores are pasted back into that file.
const SCORE_COLOUR: Record<number, string> = { 1: "#c65b4e", 2: "#d98a4b", 3: "#d9b23a", 4: "#7fa65a", 5: "#4a8f6b" };

export default function Editor() {
  const [floors, setFloors] = useState<Floor[]>(() => FLOORS.map((f) => ({ ...f, scores: [...f.scores] })));
  const [copied, setCopied] = useState(false);

  const setScore = (r: number, c: number, v: number) =>
    setFloors((fs) => fs.map((f, i) => (i !== r ? f : { ...f, scores: f.scores.map((s, j) => (j !== c ? s : Math.max(1, Math.min(5, Number.isFinite(v) ? v : s)))) })));
  const reset = () => setFloors(FLOORS.map((f) => ({ ...f, scores: [...f.scores] })));
  const copy = async () => {
    const out = JSON.stringify(floors.map((f) => ({ name: f.name, tag: f.tag, scores: f.scores })), null, 1);
    try { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* clipboard blocked */ }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <button onClick={copy} className="fe-btn fe-btn-primary">{copied ? "Copied to clipboard ✓" : "Copy scores"}</button>
        <button onClick={reset} className="fe-btn">Reset to current</button>
      </div>

      <div className="fe-tablewrap">
        <table className="fe-table">
          <thead>
            <tr>
              <th className="fe-name">Floor type</th>
              {CRITERIA.map((c) => <th key={c} className="fe-crit">{c}</th>)}
              <th className="fe-ovh">Overall</th>
            </tr>
          </thead>
          <tbody>
            {floors.map((f, r) => {
              const ov = overall(f.scores);
              return (
                <tr key={f.name}>
                  <th className="fe-name" scope="row"><span className="fe-fn">{f.name}</span><span className="fe-ft">{f.tag}</span></th>
                  {f.scores.map((s, c) => (
                    <td key={c} className="fe-cell">
                      <input
                        type="number" min={1} max={5} step={1} value={s}
                        onChange={(e) => setScore(r, c, parseInt(e.target.value, 10))}
                        aria-label={`${f.name} ${CRITERIA[c]}`}
                        className="fe-in"
                        style={{ background: `color-mix(in srgb, ${SCORE_COLOUR[s]} 22%, #fff)`, borderColor: SCORE_COLOUR[s] }}
                      />
                    </td>
                  ))}
                  <td className="fe-ov"><span className="fe-badge" data-b={band(ov)}>{ov}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .fe-btn{appearance:none;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-family:inherit;font-weight:800;font-size:14px;border-radius:999px;padding:11px 22px;cursor:pointer}
        .fe-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}
        .fe-btn:hover{filter:brightness(.97)}
        .fe-tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px;background:var(--surface);-webkit-overflow-scrolling:touch}
        .fe-table{border-collapse:collapse;width:100%;min-width:1120px;font-family:var(--font-manrope),system-ui,sans-serif}
        .fe-table thead th{position:sticky;top:0;background:var(--deep);color:#f6f1e8;font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:12px 8px;text-align:center;white-space:nowrap}
        .fe-table th.fe-name{position:sticky;left:0;z-index:2;text-align:left;padding:12px 14px;min-width:200px;border-right:1px solid var(--line);background:var(--surface)}
        .fe-table thead th.fe-name{background:var(--deep)}
        .fe-fn{display:block;font-family:var(--font-archivo);font-weight:800;font-size:15.5px;color:var(--ink)}
        .fe-ft{display:block;font-size:11.5px;color:var(--muted);margin-top:2px;font-weight:600}
        .fe-table tbody tr{border-top:1px solid var(--line)}
        .fe-cell{padding:8px 6px;text-align:center}
        .fe-in{width:48px;height:34px;text-align:center;font-size:15px;font-weight:800;color:#3a3a36;border:2px solid;border-radius:9px;font-family:inherit}
        .fe-in:focus{outline:2px solid var(--accent);outline-offset:1px}
        .fe-ov{padding:8px 12px;text-align:center}
        .fe-badge{display:inline-block;min-width:44px;padding:6px 10px;border-radius:10px;font-family:var(--font-archivo);font-weight:900;font-size:16px;color:#fff}
        .fe-badge[data-b="a"]{background:#4a8f6b}.fe-badge[data-b="b"]{background:#7fa65a}.fe-badge[data-b="c"]{background:#d9a83a;color:#3a2f12}.fe-badge[data-b="d"]{background:#c67f4e}
      `}</style>
    </>
  );
}
