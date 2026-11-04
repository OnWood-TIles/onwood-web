// Generated line drawing of a product-options build (lib/configPricing.ts DrawMeta):
// width, basins, doors/drawers, wall-hung / kick / legs, mirror shape. Nothing is
// stored - it is drawn from the chosen options every time. Illustrative only.
// Vanities also take the range's look (ProductOptions.drawBase: front style such as
// arches, flutes or Shaker panels, open shelves, real heights), the picked handle, and
// the chosen cabinet / benchtop colour photos laid over the cabinet.
// Copy of OnBase components/products/OptionsDrawing.tsx - keep the two in sync.
import { useId, type ReactElement } from "react";
import type { DrawMeta, DrawingStyle } from "../../../lib/options";

const STROKE = "#2f3a3d";
const MM = 6; // 1 drawing unit = 6mm (300 units = an 1800mm vanity)

// Colour pattern ids: unique per drawing (useId), because the page can hold several drawings
// and a hidden one (the mobile mini drawing) would otherwise own the shared id.
function hashId(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export default function OptionsDrawing({ style, meta, size = 320, dims }: { style: DrawingStyle; meta: DrawMeta; size?: number; dims?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (style === "none") return null;
  const W = 300; // drawing units across the widest (1800mm) product
  const w = Math.max(90, Math.min(W, ((meta.width ?? 900) / 1800) * W));
  const x0 = (W - w) / 2;

  if (style === "mirror") {
    const shape = meta.shape ?? "rect";
    const h = 180, cx = W / 2, cy = 110;
    const glass = "#eef3f4";
    const body =
      shape === "round" ? <circle cx={cx} cy={cy} r={Math.min(w, 200) / 2} fill={glass} stroke={STROKE} strokeWidth={2} />
      : shape === "oval" ? <ellipse cx={cx} cy={cy} rx={Math.min(w, 170) / 2.2} ry={100} fill={glass} stroke={STROKE} strokeWidth={2} />
      : shape === "arch" ? <path d={`M${cx - 60} 205 V75 a60 60 0 0 1 120 0 V205 Z`} fill={glass} stroke={STROKE} strokeWidth={2} />
      : shape === "capsule" ? <rect x={cx - 55} y={15} width={110} height={190} rx={55} fill={glass} stroke={STROKE} strokeWidth={2} />
      : shape === "hexagon" ? <path d={`M${cx - 45} 18 h90 l45 92 l-45 92 h-90 l-45 -92 Z`} fill={glass} stroke={STROKE} strokeWidth={2} />
      : <rect x={x0} y={cy - h / 2} width={w} height={h} rx={12} fill={glass} stroke={STROKE} strokeWidth={2} />;
    return (
      <svg viewBox={`0 0 ${W} 220`} width={size} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label="Mirror illustration">
        {body}
        <path d={`M${cx - 30} 72 l40 -30 M${cx - 10} 97 l40 -30`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      </svg>
    );
  }
  if (style === "shaver") {
    const doors = Math.max(1, meta.doors ?? 2);
    const dw = w / doors;
    return (
      <svg viewBox={`0 0 ${W} 200`} width={size} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label="Shaving cabinet illustration">
        <rect x={x0} y={20} width={w} height={160} rx={4} fill="#eef3f4" stroke={STROKE} strokeWidth={2} />
        {Array.from({ length: doors - 1 }, (_, i) => <line key={i} x1={x0 + dw * (i + 1)} y1={20} x2={x0 + dw * (i + 1)} y2={180} stroke={STROKE} strokeWidth={1.5} />)}
      </svg>
    );
  }

  const tall = style === "tallboy";
  const showDims = (dims ?? size >= 260) && !tall && !!meta.width;
  const tw = tall ? 70 : w; // a tallboy is a narrow tall cabinet
  const tx = (W - tw) / 2;
  const face = meta.face ?? "plain";
  // Real proportions: benchtop ~850mm off the floor; a wall-hung cabinet uses the range's
  // own height; a kick base is a recessed ~100mm plinth, legs ~180mm.
  const mount = meta.mount ?? "wallmount";
  const floorY = 250;
  const onFloor = mount === "legs" || mount === "kick";
  const topH = tall ? 0 : meta.topMm ? Math.round(4 + meta.topMm / 5) : 8; // 40mm / 60mm tops draw thicker
  const topY = tall ? 10 : onFloor && meta.floorMm ? floorY - meta.floorMm / MM : 108;
  const bodyY = topY + topH;
  const legH = !onFloor ? 0 : tall ? 40 : mount === "kick" ? 17 : 30;
  const bodyH = tall ? 200 : onFloor ? floorY - legH - bodyY : meta.wallMm ? Math.max(40, meta.wallMm / MM - topH) : 82;
  const config = meta.config ?? "";

  // ── Ids + fills: the chosen cabinet / benchtop photos tile over the drawing ──────────
  const id = `${uid}${hashId(`${meta.cabinetImage ?? ""}|${meta.topImage ?? ""}`)}`;
  const cabFill = meta.cabinetImage ? `url(#cab-${id})` : "#e9e1d4";
  const topFill = meta.topImage ? `url(#top-${id})` : "#f4f1ea";
  const tinted = !!meta.cabinetImage; // lines get a light halo so they read on dark colours

  // ── Front layout ────────────────────────────────────────────────────────────────────
  // Open shelf ends (Avion) take a column at one or both ends; curved end panels (Reef,
  // Shore) a narrow column each side; an open shelf below (Oxford, Merewether) the lower
  // half; a frieze (Phoenix, Riviera) or a fixed rail panel (Bowral, Kiama) a band on top.
  const ends = meta.shelf === "ends" ? (/2 shelf ends/.test(config) ? ["left", "right"] : [meta.shelfSide ?? "right"]) : [];
  const endW = ends.length ? Math.max(16, tw * 0.15) : 0;
  const sideW = meta.curved ? Math.max(9, tw * 0.065) : 0;
  const inset = face === "framed" ? 6 : 3;
  const frieze = face === "frieze" ? 7 : 0;
  const railH = meta.rail && !tall ? Math.max(9, Math.min(13, bodyH * 0.13)) : 0;
  const fx0 = tx + inset + sideW + (ends.includes("left") ? endW : 0);
  const fx1 = tx + tw - inset - sideW - (ends.includes("right") ? endW : 0);
  const fy0 = bodyY + inset + frieze + railH;
  const fyFull = bodyY + bodyH - inset;
  const fy1 = meta.shelf === "below" ? fy0 + (fyFull - fy0) * 0.52 : fyFull;

  // Fronts: doors full height, drawers stacked (2 columns when there are 4+), unless the
  // range stacks a set number high (rows: Chifley 1, Anna 2) or splits wide all-drawer
  // cabinets into two columns (splitFrom, e.g. Nelson from 1500mm).
  const doors = Number(config.match(/(\d)\s*door/i)?.[1] ?? (tall ? 1 : 0));
  const drawers = Number(config.match(/(\d)\s*drawer/i)?.[1] ?? (doors ? 0 : meta.shelf === "below" ? 1 : 2));
  const forced = !!meta.splitFrom && !doors && (meta.width ?? 0) >= meta.splitFrom;
  let drawerCols = drawers === 0 ? 0 : meta.rows ? Math.ceil(drawers / meta.rows) : drawers >= 4 ? 2 : 1;
  if (forced && drawerCols < 2) drawerCols = 2;
  const perCol = !drawerCols ? 0 : meta.rows ? (forced ? meta.rows : Math.min(meta.rows, drawers)) : Math.ceil(drawers / drawerCols);
  const cols = Math.max(1, doors + drawerCols);
  const colW = (fx1 - fx0) / cols;
  // Column order, left to right, as on the supplier's order form: drawers either side
  // of the doors, doors either side of the drawers, or drawers to one side (the
  // customer's left / right hand pick flips it).
  type Col = "door" | "drawer";
  const doorCols: Col[] = Array(doors).fill("door"), drwCols: Col[] = Array(drawerCols).fill("drawer");
  const offCentre = meta.basinLayout === "off centre";
  // Single-side drawers default to the right, as drawn on the order forms.
  const drawersLeft = meta.drawerSide ? meta.drawerSide === "left" : meta.basinSide ? meta.basinSide === "right" : false;
  const seq: Col[] =
    meta.arrange === "split-drawers" && drawerCols === 2 && doors ? ["drawer", ...doorCols, "drawer"]
    : meta.arrange === "split-doors" && doors >= 2 && drawerCols ? [...doorCols.slice(0, Math.floor(doors / 2)), ...drwCols, ...doorCols.slice(Math.floor(doors / 2))]
    : drawersLeft ? [...drwCols, ...doorCols] : [...doorCols, ...drwCols];

  // Handle: the customer's pick, else the range's own (fingerpull fronts have none).
  const handle = meta.handle ?? (face === "fingerpull" ? "none" : "bar");
  const lines: { d: string; w: number; op: number }[] = []; // stroked details (drawn twice when tinted: halo + line)
  const solids: ReactElement[] = []; // filled details (knobs, recesses)
  let n = 0;
  const L = (d: string, wdt = 1.2, op = 1) => { lines.push({ d, w: wdt, op }); };
  const R = (x: number, y: number, ww: number, hh: number, rx = 2, wdt = 1.2) => L(`M${x + rx} ${y} H${x + ww - rx} Q${x + ww} ${y} ${x + ww} ${y + rx} V${y + hh - rx} Q${x + ww} ${y + hh} ${x + ww - rx} ${y + hh} H${x + rx} Q${x} ${y + hh} ${x} ${y + hh - rx} V${y + rx} Q${x} ${y} ${x + rx} ${y} Z`, wdt);
  const vLines = (x: number, y: number, ww: number, hh: number, gap: number, op = 0.55) => {
    for (let lx = x + gap; lx < x + ww - gap / 2; lx += gap) L(`M${lx} ${y + 1} V${y + hh - 1}`, 0.8, op);
  };

  // Port: one rounded (capsule) shape per column, drawers split inside it, not one per drawer.
  const colShape = face === "rounded";
  function front(x: number, y: number, ww: number, hh: number, kind: Col, towardsCentre: number) {
    if (!colShape) R(x, y, ww, hh, 2);
    const i = Math.max(3, Math.min(6, ww * 0.12, hh * 0.2));
    if (face === "shaker" || face === "shaker-v" || face === "shaker-round") {
      R(x + i, y + i, ww - 2 * i, hh - 2 * i, face === "shaker-round" ? Math.min(6, i) : 1, 1);
      if (face === "shaker-v") vLines(x + i, y + i, ww - 2 * i, hh - 2 * i, 5, 0.5);
    }
    if (face === "shiplap") vLines(x, y, ww, hh, 7, 0.5);
    if (face === "fluted") vLines(x, y, ww, hh, 3, 0.45);
    if (face === "sawtooth") { vLines(x, y, ww, hh, 4, 0.75); vLines(x + 2, y, ww - 2, hh, 4, 0.3); }
    if (face === "fingerpull") { solids.push(<rect key={`f${n++}`} x={x + 1} y={y + 1} width={ww - 2} height={3.5} fill="rgba(20,30,34,.32)" />); L(`M${x + 1} ${y + 4.5} H${x + ww - 1}`, 0.8); }
    // Handle
    if (handle === "none") return;
    const doorX = towardsCentre > 0 ? x + ww - 8 : x + 8; // near the edge facing the middle
    if (handle === "knob") {
      const cx = kind === "door" ? doorX : x + ww / 2, cy = kind === "door" ? y + 16 : y + Math.min(9, hh / 2);
      solids.push(<circle key={`k${n++}`} cx={cx} cy={cy} r={2.6} fill={STROKE} />);
    } else if (handle === "top") {
      if (kind === "door") L(`M${doorX - 5} ${y + 2.5} H${doorX + 5}`, 2.4); else L(`M${x + ww / 2 - 9} ${y + 2.5} H${x + ww / 2 + 9}`, 2.4);
    } else if (kind === "door" && meta.doorHandle === "top") L(`M${x + ww / 2 - 9} ${y + 6} H${x + ww / 2 + 9}`, 2.2);
    else if (kind === "door") L(`M${doorX} ${y + 11} V${y + 27}`, 2.2);
    else L(`M${x + ww / 2 - 12} ${y + Math.min(7, hh / 3)} H${x + ww / 2 + 12}`, 2.2);
  }

  seq.forEach((t, c) => {
    const x = fx0 + c * colW;
    const towardsCentre = x + colW / 2 <= tx + tw / 2 ? 1 : -1;
    if (colShape) R(x + 1.5, fy0, colW - 3, fy1 - fy0, Math.min(colW - 3, fy1 - fy0) * 0.3);
    if (t === "door") front(x + 1.5, fy0, colW - 3, fy1 - fy0, "door", towardsCentre);
    else {
      const dh = (fy1 - fy0) / perCol;
      for (let j = 0; j < perCol; j++) {
        if (colShape && j) L(`M${x + 1.5} ${fy0 + j * dh - 1} H${x + colW - 1.5}`, 1.2);
        front(x + 1.5, fy0 + j * dh, colW - 3, dh - (colShape ? 0 : 2), "drawer", towardsCentre);
      }
    }
    // Arco: the arch runs the full height of each column, drawers sit inside it.
    if (face === "arch") {
      const ax = x + 1.5, aw = colW - 3, ah = fy1 - fy0;
      for (let k = 0; k < 3; k++) {
        const o = 4 + k * 2.6, r = aw / 2 - o;
        if (r < 4) break;
        L(`M${ax + o} ${fy0 + ah - 1} V${fy0 + o + r} A${r} ${r} 0 0 1 ${ax + aw - o} ${fy0 + o + r} V${fy0 + ah - 1}`, k ? 0.8 : 1.1, k ? 0.7 : 1);
      }
    }
  });
  if (frieze) { solids.push(<rect key="frz" x={tx + 3} y={bodyY + 3} width={tw - 6} height={frieze - 1.5} fill="rgba(20,30,34,.24)" />); L(`M${tx + 3} ${bodyY + 3} H${tx + tw - 3} M${tx + 3} ${bodyY + 1.5 + frieze} H${tx + tw - 3}`, 0.9); }
  if (face === "framed") R(tx + 3, bodyY + 3, tw - 6, bodyH - 6, 1, 1);
  // Fixed rail panel under the benchtop, finished like the fronts.
  if (railH) {
    const ry = bodyY + inset + frieze, rx0 = fx0 + 1.5, rw = fx1 - fx0 - 3, rh = railH - 2;
    R(rx0, ry, rw, rh, 1.5);
    if (face === "shaker-v") { R(rx0 + 3, ry + 2.5, rw - 6, rh - 5, 1, 0.9); vLines(rx0 + 3, ry + 2.5, rw - 6, rh - 5, 5, 0.5); }
    else if (face.startsWith("shaker")) R(rx0 + 3, ry + 2.5, rw - 6, rh - 5, 1, 0.9);
    else if (face === "shiplap" || face === "fluted") vLines(rx0, ry, rw, rh, face === "fluted" ? 3 : 7, 0.5);
  }
  // Curved end panels (Reef, Shore): a rounded side each end, shaded to read as a curve.
  if (sideW) for (const left of [true, false]) {
    const sx = left ? tx + inset : tx + tw - inset - sideW;
    R(sx, bodyY + inset, sideW, bodyH - 2 * inset, 1.5, 1);
    L(`M${sx + (left ? sideW * 0.4 : sideW * 0.6)} ${bodyY + inset + 1} V${bodyY + bodyH - inset - 1}`, 0.7, 0.6);
    if (face === "fluted") vLines(sx, bodyY + inset, sideW, bodyH - 2 * inset, 3, 0.45);
  }
  // Open shelves: a shadowed recess with a shelf line.
  const recess = (x: number, y: number, ww: number, hh: number, round?: "left" | "right") => {
    solids.push(<rect key={`s${n++}`} x={x} y={y} width={ww} height={hh} rx={round ? 6 : 1.5} fill="rgba(20,30,34,.16)" />);
    R(x, y, ww, hh, round ? 6 : 1.5, 1);
    if (round && hh > 26) L(`M${x + 1} ${y + hh / 2} H${x + ww - 1}`, 1.4); // shelf ends carry a middle shelf
  };
  if (meta.shelf === "below") {
    // Wider cabinets divide the open shelf: 3 bays on a centre basin from 1500mm, else 2 (order forms).
    const bays = (meta.width ?? 0) >= 1500 ? (meta.basinLayout === "centre" || !meta.basinLayout ? 3 : 2) : 1;
    const bw0 = (fx1 - fx0 - 3) / bays;
    for (let b = 0; b < bays; b++) recess(fx0 + 1.5 + b * bw0, fy1 + 2, bw0 - (b < bays - 1 ? 2 : 0), fyFull - fy1 - 2);
  }
  for (const e of ends) recess(e === "left" ? tx + inset : tx + tw - inset - endW + 2, fy0, endW - 2, fyFull - fy0, e as "left" | "right");

  // Basins: centre / off centre (the customer's side, else away from the drawers) / double.
  const basin = meta.basin ?? "above";
  const split = seq[0] === seq[seq.length - 1] && seq.length > 2 && new Set(seq).size > 1;
  const basinLeft = meta.basinSide ? meta.basinSide === "left" : !split && !!drawerCols && !drawersLeft;
  const centres = meta.basinLayout === "double" ? [tx + tw * 0.27, tx + tw * 0.73] : offCentre ? [tx + tw * (basinLeft ? 0.25 : 0.75)] : [tx + tw / 2];
  const bw = Math.min(110, tw * (meta.basinLayout === "double" ? 0.34 : 0.45));
  const bare = basin === "none"; // cabinet only: no top, basin or tap
  const basins = tall || bare ? null : centres.map((cx, i) => basin === "above"
    ? <ellipse key={i} cx={cx} cy={topY - 13} rx={bw / 2} ry={13} fill="#fff" stroke={STROKE} strokeWidth={1.8} />
    : <path key={i} d={`M${cx - bw / 2} ${bodyY} q0 26 ${bw / 2} 26 q${bw / 2} 0 ${bw / 2} -26`} fill="none" stroke={STROKE} strokeWidth={1.4} strokeDasharray="4 3" />);
  const taps = tall || bare ? null : centres.map((cx, i) => <path key={`t${i}`} d={`M${cx} ${topY} v${basin === "above" ? -36 : -22} h${basin === "above" ? 12 : 10}`} fill="none" stroke="#8a9294" strokeWidth={3} strokeLinecap="round" />);

  // Dimension lines (larger drawings): overall width above, height at the side.
  const bottom = onFloor ? floorY : bodyY + bodyH;
  const heightMm = onFloor ? meta.floorMm ?? Math.round((floorY - topY) * MM / 10) * 10 : meta.wallMm ?? Math.round((bodyH + topH) * MM / 10) * 10;
  const dimY = topY - 50, dimX = tx - 13;
  const dimText = { fontSize: 10, fontFamily: "Arial, Helvetica, sans-serif", fill: "#5b6366" } as const;

  const vb = showDims ? `-46 ${topY - 66} ${W + 52} ${floorY - topY + 74}` : tall ? `0 0 ${W} 262` : `0 60 ${W} 202`;
  return (
    <svg viewBox={vb} width={size} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label={tall ? "Tallboy illustration" : "Vanity illustration"}>
      <defs>
        {meta.cabinetImage && <pattern id={`cab-${id}`} patternUnits="userSpaceOnUse" width={90} height={90}><image href={meta.cabinetImage} width={90} height={90} preserveAspectRatio="xMidYMid slice" /></pattern>}
        {meta.topImage && <pattern id={`top-${id}`} patternUnits="userSpaceOnUse" width={120} height={40}><image href={meta.topImage} width={120} height={120} y={-40} preserveAspectRatio="xMidYMid slice" /></pattern>}
        {meta.curved && (
          <linearGradient id={`cv-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity=".2" /><stop offset=".22" stopColor="#000" stopOpacity="0" />
            <stop offset=".78" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".2" />
          </linearGradient>
        )}
      </defs>
      <line x1={-46} y1={floorY} x2={W + 6} y2={floorY} stroke="#d4d7d2" strokeWidth={2} />
      {taps}
      {!tall && !bare && <rect x={tx - 4} y={topY} width={tw + 8} height={topH} rx={1.5} fill={topFill} stroke={STROKE} strokeWidth={1.6} />}
      <rect x={tx} y={bodyY} width={tw} height={bodyH} rx={face === "rounded" || meta.curved ? 4 : 2} fill={cabFill} stroke={STROKE} strokeWidth={1.8} />
      {meta.curved && [tx + inset, tx + tw - inset - sideW].map((sx, i) => <rect key={i} x={sx} y={bodyY + inset} width={sideW} height={bodyH - 2 * inset} fill={`url(#cv-${id})`} />)}
      {solids}
      {tinted && <g fill="none" stroke="#fff" strokeLinecap="round">{lines.map((l, i) => <path key={i} d={l.d} strokeWidth={l.w + 1.4} opacity={0.5 * l.op} />)}</g>}
      <g fill="none" stroke={STROKE} strokeLinecap="round">{lines.map((l, i) => <path key={i} d={l.d} strokeWidth={l.w} opacity={l.op} />)}</g>
      {basins}
      {mount === "kick" && legH > 0 && <rect x={tx + 8} y={bodyY + bodyH} width={tw - 16} height={legH} fill={tinted ? cabFill : "#d4cabb"} stroke={STROKE} strokeWidth={1.4} />}
      {mount === "legs" && legH > 0 && [tx + 8, tx + tw - 14].map((lx, i) => <rect key={i} x={lx} y={bodyY + bodyH} width={6} height={legH} fill="#b8a98f" stroke={STROKE} strokeWidth={1} />)}
      {showDims && (
        <g stroke="#8a9294" strokeWidth={0.9}>
          <path d={`M${tx - 4} ${dimY} H${tx + tw + 4} M${tx - 4} ${dimY - 4} v8 M${tx + tw + 4} ${dimY - 4} v8`} />
          <text x={tx + tw / 2} y={dimY - 5} textAnchor="middle" stroke="none" {...dimText}>{meta.width}mm</text>
          <path d={`M${dimX} ${topY} V${bottom} M${dimX - 4} ${topY} h8 M${dimX - 4} ${bottom} h8`} />
          <text x={dimX - 4} y={(topY + bottom) / 2 + 3} textAnchor="end" stroke="none" {...dimText}>{heightMm}</text>
        </g>
      )}
    </svg>
  );
}
