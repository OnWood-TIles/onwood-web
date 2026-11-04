// Generated line drawing of a product-options build (lib/configPricing.ts DrawMeta):
// width, basins, doors/drawers, wall-hung / kick / legs, mirror shape. Nothing is
// stored - it is drawn from the chosen options every time. Illustrative only.
// Copy of OnBase components/products/OptionsDrawing.tsx - keep the two in sync.
import type { ReactElement } from "react";
import type { DrawMeta, DrawingStyle } from "../../../lib/options";

const STROKE = "#2f3a3d";

export default function OptionsDrawing({ style, meta, size = 320 }: { style: DrawingStyle; meta: DrawMeta; size?: number }) {
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
  const tw = tall ? 70 : w; // a tallboy is a narrow tall cabinet
  const tx = (W - tw) / 2;
  // Real proportions (1 unit ~ 6mm): benchtop ~850mm off the floor; a wall-hung
  // cabinet is ~490mm high; one on legs / a kick is taller, with ~180mm legs.
  const mount = meta.mount ?? "wallmount";
  const floorY = 250;
  const onFloor = mount === "legs" || mount === "kick";
  const topY = tall ? 10 : 108;
  const topH = tall ? 0 : meta.topMm ? Math.round(4 + meta.topMm / 5) : 8; // 40mm / 60mm tops draw thicker
  const bodyY = topY + topH;
  const legH = onFloor ? (tall ? 40 : 30) : 0;
  const bodyH = tall ? 200 : onFloor ? floorY - legH - bodyY : 82;
  const viewY = tall ? 0 : 60; // crop the empty space above a vanity's taps
  const config = meta.config ?? "";

  // Fronts: doors full height, drawers stacked (2 columns when there are 4+).
  const doors = Number(config.match(/(\d)\s*door/i)?.[1] ?? (tall ? 1 : 0));
  const drawers = Number(config.match(/(\d)\s*drawer/i)?.[1] ?? (doors ? 0 : 2));
  const drawerCols = drawers === 0 ? 0 : drawers >= 4 ? 2 : 1;
  const perCol = drawerCols ? Math.ceil(drawers / drawerCols) : 0;
  const cols = Math.max(1, doors + drawerCols);
  const colW = tw / cols;
  const fronts: ReactElement[] = [];
  // Column order, left to right, as on the supplier's order form: drawers either side
  // of the doors, doors either side of the drawers, or drawers to one side (the
  // customer's left / right hand pick flips it).
  type Col = "door" | "drawer";
  const doorCols: Col[] = Array(doors).fill("door"), drwCols: Col[] = Array(drawerCols).fill("drawer");
  const offCentre = meta.basinLayout === "off centre";
  const drawersLeft = meta.drawerSide ? meta.drawerSide === "left" : meta.arrange === "side" ? !offCentre || meta.basinSide === "right" : !offCentre;
  const seq: Col[] =
    meta.arrange === "split-drawers" && drawerCols === 2 && doors ? ["drawer", ...doorCols, "drawer"]
    : meta.arrange === "split-doors" && doors >= 2 && drawerCols ? [...doorCols.slice(0, Math.floor(doors / 2)), ...drwCols, ...doorCols.slice(Math.floor(doors / 2))]
    : drawersLeft ? [...drwCols, ...doorCols] : [...doorCols, ...drwCols];
  seq.forEach((t, c) => {
    if (t === "door") {
      // Handle on the edge facing the middle of the cabinet (door pairs meet in the middle).
      const hx = tx + c * colW + ((c + 0.5) * colW <= tw / 2 ? colW - 10 : 10);
      fronts.push(<rect key={`d${c}`} x={tx + c * colW + 3} y={bodyY + 3} width={colW - 6} height={bodyH - 6} rx={2} fill="none" stroke={STROKE} strokeWidth={1.2} />);
      fronts.push(<line key={`dh${c}`} x1={hx} y1={bodyY + 14} x2={hx} y2={bodyY + 30} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" />);
    } else {
      const dh = (bodyH - 6) / perCol;
      for (let j = 0; j < perCol; j++) {
        const y = bodyY + 3 + j * dh;
        fronts.push(<rect key={`r${c}${j}`} x={tx + c * colW + 3} y={y} width={colW - 6} height={dh - 3} rx={2} fill="none" stroke={STROKE} strokeWidth={1.2} />);
        fronts.push(<line key={`rh${c}${j}`} x1={tx + c * colW + colW / 2 - 12} y1={y + 7} x2={tx + c * colW + colW / 2 + 12} y2={y + 7} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" />);
      }
    }
  });

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

  return (
    <svg viewBox={`0 ${viewY} ${W} ${262 - viewY}`} width={size} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label={tall ? "Tallboy illustration" : "Vanity illustration"}>
      <line x1={0} y1={floorY} x2={W} y2={floorY} stroke="#d4d7d2" strokeWidth={2} />
      {taps}
      {!tall && !bare && <rect x={tx - 4} y={topY} width={tw + 8} height={topH} rx={1.5} fill="#f4f1ea" stroke={STROKE} strokeWidth={1.6} />}
      <rect x={tx} y={bodyY} width={tw} height={bodyH} rx={2} fill="#e9e1d4" stroke={STROKE} strokeWidth={1.8} />
      {fronts}
      {basins}
      {mount === "kick" && legH > 0 && <rect x={tx + 8} y={bodyY + bodyH} width={tw - 16} height={legH} fill="#d4cabb" stroke={STROKE} strokeWidth={1.4} />}
      {mount === "legs" && legH > 0 && [tx + 8, tx + tw - 14].map((lx, i) => <rect key={i} x={lx} y={bodyY + bodyH} width={6} height={legH} fill="#b8a98f" stroke={STROKE} strokeWidth={1} />)}
    </svg>
  );
}
