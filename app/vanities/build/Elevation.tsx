// Front-elevation line drawing of a configurable product, generated from its
// width, basin layout, door/drawer configuration and mounting. Illustrative only
// (proportions are real: width vs a 460mm-ish cabinet), so the builder reads well
// before any product photography exists.
type Props = {
  kind: "vanity" | "tallboy" | "shaver" | "mirror";
  width: number | null;
  basinLayout?: string | null;
  config?: string;
  mount?: "wallmount" | "kick" | "legs" | null;
  basin?: "above" | "under" | "moulded";
  name?: string;
  size?: number; // rendered width in px
};

const STROKE = "#2f3a3d";

export default function Elevation({ kind, width, basinLayout, config = "", mount, basin = "above", name = "", size = 320 }: Props) {
  const W = 300; // drawing units across the widest (1800mm) product
  const w = Math.max(90, Math.min(W, ((width ?? 900) / 1800) * W));
  const x0 = (W - w) / 2;

  if (kind === "mirror") {
    const round = /orbit|deco|round|dia/i.test(name);
    const oval = /oval/i.test(name);
    return (
      <svg viewBox={`0 0 ${W} 220`} width={size} role="img" aria-label="Mirror illustration">
        {round ? <circle cx={W / 2} cy={110} r={Math.min(w, 200) / 2} fill="#eef3f4" stroke={STROKE} strokeWidth={2} />
          : oval ? <ellipse cx={W / 2} cy={110} rx={Math.min(w, 160) / 2.4} ry={100} fill="#eef3f4" stroke={STROKE} strokeWidth={2} />
          : <rect x={x0} y={20} width={w} height={180} rx={14} fill="#eef3f4" stroke={STROKE} strokeWidth={2} />}
        <path d={`M${W / 2 - 30} 70 l40 -30 M${W / 2 - 10} 95 l40 -30`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      </svg>
    );
  }
  if (kind === "shaver") {
    const doors = Number(config.match(/(\d) door/i)?.[1] ?? (/left|right/i.test(name) ? 1 : 2));
    const dw = w / doors;
    return (
      <svg viewBox={`0 0 ${W} 200`} width={size} role="img" aria-label="Shaving cabinet illustration">
        <rect x={x0} y={20} width={w} height={160} rx={4} fill="#eef3f4" stroke={STROKE} strokeWidth={2} />
        {Array.from({ length: doors - 1 }, (_, i) => <line key={i} x1={x0 + dw * (i + 1)} y1={20} x2={x0 + dw * (i + 1)} y2={180} stroke={STROKE} strokeWidth={1.5} />)}
      </svg>
    );
  }

  const tall = kind === "tallboy";
  const topY = tall ? 10 : 70;
  const bodyH = tall ? 210 : 82;
  const topH = tall ? 0 : 8;
  const bodyY = topY + topH;
  const floorY = 250;
  const legH = mount === "legs" || mount === "kick" ? floorY - (bodyY + bodyH) : 0;

  // Fronts: doors full height, drawers stacked (2 columns when there are 4+).
  const doors = Number(config.match(/(\d)\s*door/i)?.[1] ?? 0);
  const drawers = Number(config.match(/(\d)\s*drawer/i)?.[1] ?? (doors ? 0 : tall ? 0 : 2));
  const drawerCols = drawers === 0 ? 0 : drawers >= 4 ? 2 : 1;
  const perCol = drawerCols ? Math.ceil(drawers / drawerCols) : 0;
  const cols = Math.max(1, doors + drawerCols + (tall && !doors && !drawers ? 1 : 0));
  const colW = w / cols;
  const fronts: React.ReactElement[] = [];
  let c = 0;
  const doorFirst = basinLayout === "off centre";
  const order = doorFirst ? ["door", "drawer"] : ["drawer", "door"];
  for (const t of order) {
    if (t === "door") for (let i = 0; i < doors; i++, c++) {
      fronts.push(<rect key={`d${c}`} x={x0 + c * colW + 3} y={bodyY + 3} width={colW - 6} height={bodyH - 6} rx={2} fill="none" stroke={STROKE} strokeWidth={1.2} />);
      fronts.push(<line key={`dh${c}`} x1={x0 + c * colW + (i % 2 ? 10 : colW - 10)} y1={bodyY + 14} x2={x0 + c * colW + (i % 2 ? 10 : colW - 10)} y2={bodyY + 30} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" />);
    }
    if (t === "drawer") for (let k = 0; k < drawerCols; k++, c++) {
      const dh = (bodyH - 6) / perCol;
      for (let j = 0; j < perCol; j++) {
        const y = bodyY + 3 + j * dh;
        fronts.push(<rect key={`r${c}${j}`} x={x0 + c * colW + 3} y={y} width={colW - 6} height={dh - 3} rx={2} fill="none" stroke={STROKE} strokeWidth={1.2} />);
        fronts.push(<line key={`rh${c}${j}`} x1={x0 + c * colW + colW / 2 - 12} y1={y + 7} x2={x0 + c * colW + colW / 2 + 12} y2={y + 7} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" />);
      }
    }
  }
  if (tall && !doors && !drawers) fronts.push(<rect key="tb" x={x0 + 3} y={bodyY + 3} width={w - 6} height={bodyH - 6} rx={2} fill="none" stroke={STROKE} strokeWidth={1.2} />);

  // Basins: centre / off centre / double.
  const centres = basinLayout === "double" ? [x0 + w * 0.27, x0 + w * 0.73] : basinLayout === "off centre" ? [x0 + w * 0.7] : [x0 + w / 2];
  const bw = Math.min(110, w * (basinLayout === "double" ? 0.34 : 0.45));
  const basins = tall ? null : centres.map((cx, i) => basin === "above"
    ? <ellipse key={i} cx={cx} cy={topY - 13} rx={bw / 2} ry={13} fill="#fff" stroke={STROKE} strokeWidth={1.8} />
    : <path key={i} d={`M${cx - bw / 2} ${bodyY} q0 26 ${bw / 2} 26 q${bw / 2} 0 ${bw / 2} -26`} fill="none" stroke={STROKE} strokeWidth={1.4} strokeDasharray="4 3" />);
  const tap = tall ? null : centres.map((cx, i) => <path key={`t${i}`} d={`M${cx} ${topY} v${basin === "above" ? -36 : -22} h${basin === "above" ? 12 : 10}`} fill="none" stroke="#8a9294" strokeWidth={3} strokeLinecap="round" />);

  return (
    <svg viewBox={`0 0 ${W} 262`} width={size} role="img" aria-label="Vanity illustration">
      {mount === "wallmount" || kind === "tallboy" && mount !== "legs" && mount !== "kick" ? <line x1={0} y1={floorY} x2={W} y2={floorY} stroke="#d9dcd8" strokeWidth={2} /> : <line x1={0} y1={floorY} x2={W} y2={floorY} stroke="#c9ccc7" strokeWidth={2} />}
      {tap}
      {!tall && <rect x={x0 - 4} y={topY} width={w + 8} height={topH} rx={1.5} fill="#f4f1ea" stroke={STROKE} strokeWidth={1.6} />}
      <rect x={x0} y={bodyY} width={w} height={bodyH} rx={2} fill="#e9e1d4" stroke={STROKE} strokeWidth={1.8} />
      {fronts}
      {basins}
      {mount === "kick" && legH > 0 && <rect x={x0 + 10} y={bodyY + bodyH} width={w - 20} height={legH} fill="#d4cabb" stroke={STROKE} strokeWidth={1.4} />}
      {mount === "legs" && legH > 0 && [x0 + 10, x0 + w - 16].map((lx, i) => <rect key={i} x={lx} y={bodyY + bodyH} width={6} height={legH} fill="#b8a98f" stroke={STROKE} strokeWidth={1} />)}
    </svg>
  );
}
