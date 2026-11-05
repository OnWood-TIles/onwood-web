/* eslint-disable @typescript-eslint/no-explicit-any */
// Builds a 3D vanity from a product-options build: the same data as the 2D line drawing
// (lib/options drawMeta: layout, arrangement, range look, spec-sheet measurements, chosen
// finish / benchtop photos) plus the picked basin, handle, legs, tap and extras. Every
// vanity range works from its OnBase data; nothing here is per-range except the basin and
// handle libraries (Marquis spec sheets / Bathroom Book). Units: metres.
import * as THREE from "three";
import { drawMeta, many, one, type ProductOptions, type OptionSelection, type DrawMeta } from "../../../../lib/options";

export type Mover = { obj: THREE.Object3D; kind: "door" | "drawer"; dir?: number; z0?: number; t: number };
export type Built = { group: THREE.Group; movers: Mover[]; led: boolean; dims: string; focusY: number; widthM: number };
type Imgs = Map<string, HTMLImageElement>;

const mm = (v: number) => v / 1000;
const TILE = 320; // one swatch photo covers ~320mm of cabinet

// ── Materials ─────────────────────────────────────────────────────────────────────
const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
const carcassInner = std({ color: 0xcfc9be, roughness: 0.85, envMapIntensity: 0.15 });
const boxWhite = std({ color: 0xf5f3ef, roughness: 0.7, envMapIntensity: 0.2 });
const chrome = std({ color: 0xdfe2e4, roughness: 0.12, metalness: 1 });
const shadowMat = std({ color: 0x1a1816, roughness: 0.9 });
const metal = ([c, m, r]: number[]) => std({ color: c, metalness: m, roughness: r });
const HFIN: Record<string, number[]> = {
  "Brushed Aluminium": [0xc5c9cc, 0.9, 0.38], "Brushed Brass": [0xc8a564, 1, 0.32], "Gun Metal": [0x4b4e52, 1, 0.35],
  "Black Matte": [0x1b1c1d, 0.3, 0.62], "White Matte": [0xefefec, 0.1, 0.6], "Polished Stainless Steel": [0xe2e5e7, 1, 0.12],
  "Stainless Steel": [0xcfd2d4, 0.95, 0.28], "Polished Brass": [0xd9b45f, 1, 0.12], "Polished Chrome": [0xe6e9eb, 1, 0.06],
  "Matte Nickel": [0xb3b1a9, 0.9, 0.45], "Brushed Nickel": [0xbbb8af, 0.9, 0.35], "Champagne": [0xd8c79f, 0.85, 0.3],
  "Graphite": [0x4a4a4d, 0.7, 0.4], "Timber": [0xb98b5c, 0, 0.55], "Timber Finish": [0xb98b5c, 0, 0.55], "Black": [0x1e1e1e, 0.1, 0.5],
  "Aluminium Matte": [0xb9bcbf, 0.9, 0.45], "Aluminium": [0xb9bcbf, 0.9, 0.45], "Chrome": [0xe2e5e7, 1, 0.08], "White Gloss": [0xf2f2f0, 0.1, 0.2],
  "Polished Copper": [0xb87348, 1, 0.15], "Brushed Chrome": [0xc9ccce, 1, 0.3],
};
const finOf = (f: string) => metal(HFIN[f] || HFIN["Black Matte"]);

function swatchCanvas(img: HTMLImageElement | undefined, wMm: number, hMm: number, fallback: string): HTMLCanvasElement {
  const pxPerMm = Math.min(1.2, 1024 / Math.max(wMm, hMm));
  const W = Math.max(8, Math.round(wMm * pxPerMm)), H = Math.max(8, Math.round(hMm * pxPerMm));
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d")!;
  g.fillStyle = fallback; g.fillRect(0, 0, W, H);
  if (img && img.naturalWidth) { const t = TILE * pxPerMm; for (let y = 0; y < H; y += t) for (let x = 0; x < W; x += t) g.drawImage(img, x, y, t, t); }
  return c;
}
function canvasTex(c: HTMLCanvasElement, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }

// ── Front relief: per-range face styles baked into colour (with groove shading) + normals
// h(x, y) in mm on the front (or its column, for arches / capsules spanning drawers).
type HFn = (x: number, y: number) => number;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
function sdRoundRect(x: number, y: number, w: number, h: number, r: number) { // inside negative
  const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
function faceHeight(face: string, w: number, h: number, colX: number, colY: number, colW: number, colH: number): HFn | null {
  switch (face) {
    case "fluted": return (x) => Math.sqrt(Math.abs(Math.sin(Math.PI * x / 16)));
    case "shiplap": return (x) => { const d = x % 70; return d < 4 ? d / 4 : d > 66 ? (70 - d) / 4 : 1; }; // 70mm boards, V-grooves
    case "sawtooth": return (x) => (x % 30) / 30;
    case "shaker": case "shaker-round": case "shaker-v": {
      const fw = Math.max(28, Math.min(70, Math.min(w, h) * 0.14)), r = face === "shaker-round" ? 28 : 2, bev = 7;
      return (x, y) => {
        const d = sdRoundRect(x - fw, y - fw, w - 2 * fw, h - 2 * fw, r); // <0 inside panel
        let v = clamp01(d / bev) * 0.6 + 0.4 * (d > 0 ? 1 : 0.0);
        if (face === "shaker-v" && d < -2) { const g = x % 25; if (g < 3.6) v -= 0.5 * (1 - Math.abs(g - 1.8) / 1.8); }
        return v;
      };
    }
    case "arch": return (x, y) => { // three concentric arch grooves running the full column
      const cx = colX + x, cy = colY + y, r0 = colW / 2;
      let v = 1;
      for (let k = 0; k < 3; k++) {
        const o = 20 + k * 15, r = r0 - o; if (r < 20) break;
        const top = o + r; // arch centre height from the column top
        const d = cy < top ? Math.abs(Math.hypot(cx - colW / 2, cy - top) - r) : Math.min(Math.abs(cx - o), Math.abs(cx - (colW - o)));
        if (cy > o - 2 && d < 3.5) v = Math.min(v, d / 3.5);
      }
      return v;
    };
    case "rounded": return (x, y) => { // one capsule groove around each column (drawers share it)
      const d = Math.abs(sdRoundRect(colX + x - 10, colY + y - 10, colW - 20, colH - 20, Math.min(colW, colH) * 0.3));
      return d < 4 ? d / 4 : 1;
    };
    case "fingerpull": return (_x, y) => (y < 26 ? (y < 20 ? 0 : (y - 20) / 6) : 1);
    default: return null;
  }
}
function bakeFront(face: string, img: HTMLImageElement | undefined, fallback: string, wMm: number, hMm: number, col: [number, number, number, number]) {
  const albedo = swatchCanvas(img, wMm, hMm, fallback);
  const fn = faceHeight(face, wMm, hMm, ...col);
  if (!fn) return { map: canvasTex(albedo), normal: null as THREE.Texture | null };
  const W = albedo.width, H = albedo.height, sx = wMm / W, sy = hMm / H;
  const hgt = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) hgt[j * W + i] = fn(i * sx, j * sy);
  const nc = document.createElement("canvas"); nc.width = W; nc.height = H;
  const ng = nc.getContext("2d")!, nd = ng.createImageData(W, H);
  const ag = albedo.getContext("2d")!, ad = ag.getImageData(0, 0, W, H);
  const k = face === "fluted" || face === "sawtooth" ? 2.2 : 3.2;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const p = j * W + i, l = hgt[j * W + Math.max(0, i - 1)], r = hgt[j * W + Math.min(W - 1, i + 1)], u = hgt[Math.max(0, j - 1) * W + i], d = hgt[Math.min(H - 1, j + 1) * W + i];
    let nx = (l - r) * k / (sx * 2), ny = (d - u) * k / (sy * 2), nz = 1; const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    nd.data[p * 4] = (nx * 0.5 + 0.5) * 255; nd.data[p * 4 + 1] = (ny * 0.5 + 0.5) * 255; nd.data[p * 4 + 2] = nz * 255; nd.data[p * 4 + 3] = 255;
    const ao = 1 - 0.55 * (1 - nz) - (face === "fluted" || face === "sawtooth" ? 0.12 * (1 - hgt[p]) : face === "shiplap" ? 0.3 * (1 - hgt[p]) : 0); // slopes + grooves read darker, flat panels keep their colour
    ad.data[p * 4] *= ao; ad.data[p * 4 + 1] *= ao; ad.data[p * 4 + 2] *= ao;
  }
  ng.putImageData(nd, 0, 0); ag.putImageData(ad, 0, 0);
  return { map: canvasTex(albedo), normal: canvasTex(nc, false) };
}

// ── Basins (each Marquis basin spec sheet) ─────────────────────────────────────────
type BSpec = { plan: string; n?: number; W: number; D: number; H: number; above: number; bowl: string; base?: number; pattern?: string; deck?: any; twoTone?: boolean; metal?: boolean; glass?: boolean; speckle?: boolean };
const BASIN_SHAPE: [RegExp, any][] = [
  [/^Paco Semi-Inset/, { plan: "round", W: 365, D: 365, H: 115, above: 50, bowl: "straight" }],
  [/^Paco Fluted/, { plan: "round", W: 360, D: 360, H: 120, bowl: "straight", pattern: "flutes" }],
  [/^Paco Mini/, { plan: "round", W: 320, D: 320, H: 105, bowl: "straight" }],
  [/^Paco/, { plan: "round", W: 360, D: 360, H: 120, bowl: "straight" }],
  [/^Ottimo/, { plan: "super", n: 4, W: 375, D: 375, H: 120, bowl: "taper", base: 0.62 }],
  [/^Palma/, { plan: "super", n: 4.5, W: 465, D: 330, H: 135, bowl: "tub" }],
  [/^Liso/, { plan: "round", W: 385, D: 385, H: 145, bowl: "curved", base: 0.39 }],
  [/^Vaso/, { plan: "round", W: 420, D: 420, H: 160, above: 70, bowl: "flare" }],
  [/^Dayton/, { plan: "super", n: 3.6, W: 465, D: 375, H: 120, bowl: "taper", base: 0.72 }],
  [/^Delgado/, { plan: "super", n: 3.6, W: 415, D: 415, H: 150, bowl: "taper", base: 0.66 }],
  [/^Stadia Fluted/, { plan: "stadium", W: 500, D: 320, H: 120, bowl: "straight", pattern: "flutes" }],
  [/^Stadia/, { plan: "stadium", W: 510, D: 345, H: 120, bowl: "straight" }],
  [/^Bacino/, { plan: "super", n: 16, W: 480, D: 430, H: 120, above: 80, bowl: "straight", deck: { W: 390, D: 265, dz: 47.5, n: 10 } }],
  [/^Arco Fluted/, { plan: "super", n: 3.2, W: 415, D: 370, H: 120, bowl: "straight", pattern: "flutes" }],
  [/^Chevron/, { plan: "round", W: 360, D: 360, H: 120, bowl: "straight", pattern: "chevron" }],
  [/^Jewel/, { plan: "round", W: 360, D: 360, H: 120, bowl: "straight", pattern: "jewel" }],
  [/^Cresta/, { plan: "round", W: 390, D: 390, H: 145, bowl: "curved", base: 0.38, pattern: "rings" }],
  [/^Regio/, { plan: "round", W: 380, D: 380, H: 130, bowl: "straight", speckle: true }],
  [/^Indi/, { plan: "super", n: 14, W: 380, D: 380, H: 130, bowl: "straight" }],
  [/^Nero Blanco/, { plan: "stadium", W: 575, D: 380, H: 113, bowl: "straight", twoTone: true }],
  [/^Forge/, { plan: "round", W: 360, D: 360, H: 120, bowl: "straight", metal: true }],
  [/^Wow/, { plan: "round", W: 360, D: 360, H: 100, bowl: "straight", glass: true }],
];
function basinSpec(label: string): BSpec | null {
  const sh = BASIN_SHAPE.find(([re]) => re.test(label))?.[1];
  if (!sh) return null;
  return { ...sh, W: sh.W / 1000, D: sh.D / 1000, H: sh.H / 1000, above: sh.above ? sh.above / 1000 : 0, deck: sh.deck ? { plan: "super", n: sh.deck.n, W: sh.deck.W / 1000, D: sh.deck.D / 1000, dz: sh.deck.dz / 1000 } : null };
}
function planPt(sp: { plan: string; n?: number; W: number; D: number }, t: number): [number, number] {
  const a = sp.W / 2, b = sp.D / 2;
  if (sp.plan === "stadium") {
    const r = Math.min(a, b), L = Math.max(0, a - r) * 2, P = 2 * L + 2 * Math.PI * r; let s = t * P;
    if (s < Math.PI * r) { const an = -Math.PI / 2 + s / r; return [L / 2 + r * Math.cos(an), r * Math.sin(an)]; } s -= Math.PI * r;
    if (s < L) return [L / 2 - s, r]; s -= L;
    if (s < Math.PI * r) { const an = Math.PI / 2 + s / r; return [-L / 2 + r * Math.cos(an), r * Math.sin(an)]; } s -= Math.PI * r;
    return [-L / 2 + s, -r];
  }
  const n = sp.plan === "round" ? 2 : sp.n!, th = t * Math.PI * 2, c = Math.cos(th), si = Math.sin(th);
  return [a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), b * Math.sign(si) * Math.pow(Math.abs(si), 2 / n)];
}
function bowlScale(sp: BSpec, u: number) {
  switch (sp.bowl) {
    case "taper": { const b = sp.base ?? 0.7; return b + (1 - b) * Math.sin(u * Math.PI / 2); }
    case "curved": { const b = sp.base ?? 0.45; return b + (1 - b) * Math.sqrt(1 - (1 - u) * (1 - u)); }
    case "tub": return 1 - 0.22 * Math.pow(1 - u, 4);
    case "flare": return 0.5 + 0.5 * u * u;
    default: return 0.97 + 0.03 * u;
  }
}
function basinGeometry(sp: BSpec) {
  const SEG = sp.pattern && sp.pattern !== "rings" ? 300 : 128, ROWS = sp.pattern ? 40 : 18, wall = 0.008, base = 0.012, rmin = Math.min(sp.W, sp.D) / 2;
  const k = wall / rmin, prof: number[][] = [[0, 0, 1, 0]];
  for (let i = 0; i <= ROWS; i++) { const u = i / ROWS; prof.push([bowlScale(sp, u), u * sp.H, 1, u]); }
  for (let i = ROWS; i >= 0; i--) { const u = i / ROWS; prof.push([Math.max(0.03, bowlScale(sp, u) - k), base + u * (sp.H - base - 0.002), 0, u]); }
  prof.push([0, base, 0, 0]);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], rimRow = ROWS + 2;
  prof.forEach(([s, y, outer, u], r) => {
    for (let j = 0; j <= SEG; j++) {
      const t = j / SEG; let [x, z] = planPt(sp as any, t); let m = s, oz = 0;
      if (!outer && sp.deck) { const [ix, iz] = planPt(sp.deck, t); x = ix; z = iz; m = r === rimRow ? 1 : 0.82 + 0.18 * u; oz = sp.deck.dz; }
      if (outer && sp.pattern && u > 0) {
        const fade = Math.max(0, Math.min(1, u / 0.1, (1 - u) / 0.07)), dd = (sp.pattern === "rings" ? 0.002 : 0.0055) / rmin; let p: number;
        if (sp.pattern === "flutes") p = Math.sqrt(Math.abs(Math.sin(Math.PI * 64 * t)));
        else if (sp.pattern === "rings") p = Math.sqrt(Math.abs(Math.sin(Math.PI * 26 * u)));
        else if (sp.pattern === "chevron") { const q = (((24 * t + 0.55 * Math.abs(2 * ((u * 2.5) % 1) - 1)) % 1) + 1) % 1; p = 1 - Math.abs(2 * q - 1); }
        else { const q1 = (20 * t + u * 2) % 1, q2 = (((20 * t - u * 2) % 1) + 1) % 1; p = Math.min(1 - Math.abs(2 * q1 - 1), 1 - Math.abs(2 * q2 - 1)); }
        m = s * (1 + dd * p * fade);
      }
      pos.push(x * m, y, z * m + oz); uv.push(t * 6, y * 8);
    }
  });
  const rowN = SEG + 1;
  for (let r = 0; r < prof.length - 1; r++) for (let j = 0; j < SEG; j++) { const a = r * rowN + j, c = a + rowN; idx.push(a, c, a + 1, c, c + 1, a + 1); }
  let g: THREE.BufferGeometry = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const nOuter = (ROWS + 1) * SEG * 6; g.addGroup(0, nOuter, 0); g.addGroup(nOuter, idx.length - nOuter, 1);
  if (sp.pattern === "jewel") { g = g.toNonIndexed(); g.clearGroups(); g.addGroup(0, nOuter, 0); g.addGroup(nOuter, Infinity, 1); }
  g.computeVertexNormals();
  return g;
}
const BASIN_COLOUR: Record<string, number> = { Khaki: 0x9e9478, Tuscan: 0x8f7d6d, Clay: 0x998d80, Brushed: 0x9d9b96 };
function basinMats(label: string, sp: BSpec): THREE.Material[] {
  const mk = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, envMapIntensity: 0.6, ...o });
  if (sp.metal) { const m = mk({ color: /Gun/.test(label) ? 0x575852 : 0xbcb8ae, metalness: 1, roughness: 0.3 }); return [m, m]; }
  if (sp.glass) { const m = mk({ color: 0xc8804f, roughness: 0.1, transmission: 0.7, thickness: 0.01, transparent: true, opacity: 0.88 }); return [m, m]; }
  const gloss = mk({ color: 0xcdcecc, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.45 });
  if (sp.twoTone) return [mk({ color: 0x0b0b0c, roughness: 0.6, envMapIntensity: 0.12 }), gloss];
  if (/Black Matte/.test(label)) { const m = mk({ color: 0x2a2a2b, roughness: 0.6 }); return [m, m]; }
  const tint = Object.entries(BASIN_COLOUR).find(([k]) => label.includes(k));
  if (tint) { const m = mk({ color: tint[1], roughness: 0.6 }); return [m, m]; }
  if (/White Matte|Cloud/.test(label)) { const m = mk({ color: 0xc8c8c4, roughness: 0.62, envMapIntensity: 0.3 }); return [m, m]; }
  return [gloss, gloss];
}

// ── Handles (Bathroom Book p.122) ──────────────────────────────────────────────────
function pullGeo(curved: boolean, len: number) {
  const s = new THREE.Shape();
  if (curved) { s.moveTo(-0.016, 0); s.lineTo(0.004, 0); s.quadraticCurveTo(0.016, 0, 0.0175, -0.013); s.lineTo(0.0195, -0.013); s.quadraticCurveTo(0.0185, 0.0022, 0.004, 0.0022); s.lineTo(-0.016, 0.0022); s.lineTo(-0.016, 0); }
  else { s.moveTo(-0.016, 0); s.lineTo(0.013, 0); s.lineTo(0.013, -0.012); s.lineTo(0.015, -0.012); s.lineTo(0.015, 0.002); s.lineTo(-0.016, 0.002); s.lineTo(-0.016, 0); }
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0005, bevelSegments: 2, curveSegments: 12 });
  g.rotateY(-Math.PI / 2); g.translate(len / 2, 0, 0); return g;
}
function handleObj(type: string, fin: string, len: number, vertical: boolean): THREE.Group {
  const g = new THREE.Group(), m = finOf(fin), L = len / 1000;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  if (/Lounge|Pinta/.test(type)) {
    const r = /Pinta/.test(type) ? 0.008 : 0.0055, out = 0.032, span = L - 0.02;
    add(new THREE.CylinderGeometry(r, r, L, 24), m, 0, 0, out, 0, 0, Math.PI / 2);
    [-1, 1].forEach((s) => add(new THREE.CylinderGeometry(0.004, 0.0045, out, 16), m, s * span / 2, 0, out / 2, Math.PI / 2));
    if (/Pinta/.test(type)) [-1, 1].forEach((s) => add(new THREE.SphereGeometry(r, 16, 12), m, s * L / 2, 0, out));
  } else if (/Flat D/.test(type)) {
    add(new THREE.BoxGeometry(L, 0.012, 0.004), m, 0, 0, 0.03);
    [-1, 1].forEach((s) => add(new THREE.BoxGeometry(0.008, 0.012, 0.03), m, s * (L / 2 - 0.006), 0, 0.015));
  } else if (/Trim/.test(type)) add(new THREE.BoxGeometry(L, 0.02, 0.012), m, 0, 0, 0.006);
  else if (/Shell/.test(type)) {
    const hood = m.clone(); hood.side = THREE.DoubleSide;
    const cup = add(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI, 0, Math.PI / 2), hood, 0, -0.012, 0); cup.scale.set(0.032, 0.03, 0.022); // upper-front quarter sphere, open below
    add(new THREE.BoxGeometry(0.07, 0.012, 0.003), m, 0, 0.012, 0.0015); // the fixing plate with its two screw tabs
  }
  else if (/Luna/.test(type)) { add(new THREE.CylinderGeometry(0.0375, 0.0375, 0.005, 40, 1, false, Math.PI / 2, Math.PI), m, 0, 0, 0.02, Math.PI / 2); add(new THREE.BoxGeometry(0.075, 0.006, 0.02), m, 0, 0, 0.01); }
  else if (/Bell Knob/.test(type)) { const pts = [[0.004, 0], [0.006, 0.004], [0.0075, 0.016], [0.015, 0.026], [0.014, 0.029], [0, 0.03]].map(([r, y]) => new THREE.Vector2(r, y)); add(new THREE.LatheGeometry(pts, 32), m, 0, 0, 0, Math.PI / 2); }
  else if (/Clover/.test(type)) {
    const R0 = 0.024, pts: THREE.Vector3[] = [];
    for (let i = 0; i < 96; i++) { const t = i / 96 * Math.PI * 2, r = R0 * (0.7 + 0.3 * Math.abs(Math.cos(2 * t)) ** 0.6) * 1.12; pts.push(new THREE.Vector3(Math.cos(t) * r, Math.sin(t) * r - R0, 0.016)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 200, 0.0029, 12, true), m); // 55mm clover ring
    add(new THREE.CylinderGeometry(0.004, 0.006, 0.016, 20), m, 0, 0, 0.008, Math.PI / 2); // the post it hangs from
    add(new THREE.SphereGeometry(0.0045, 16, 12), m, 0, 0, 0.016);
  }
  else if (/Knob/.test(type)) {
    const body = /Black Matte & Brass/.test(fin) ? finOf("Black Matte") : m;
    add(new THREE.CylinderGeometry(0.025, 0.023, 0.014, 40), body, 0, 0, 0.02, Math.PI / 2); add(new THREE.CylinderGeometry(0.006, 0.008, 0.014, 20), body, 0, 0, 0.007, Math.PI / 2);
    if (/Brass/.test(fin)) add(new THREE.TorusGeometry(0.0245, 0.0018, 10, 48), finOf("Polished Brass"), 0, 0, 0.026);
  } else add(new THREE.BoxGeometry(Math.max(0.08, L), 0.012, 0.02), m, 0, 0, 0.012); // unknown style: a simple bar
  if (vertical && /Lounge|Flat D|Pinta|Trim/.test(type)) g.rotation.z = Math.PI / 2;
  return g;
}

// ── Helpers ────────────────────────────────────────────────────────────────────────
const contactTex = (() => {
  if (typeof document === "undefined") return null as any;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(0.62, "rgba(0,0,0,0.32)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
export const ledGlowTex = (() => {
  if (typeof document === "undefined") return null as any;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,196,120,0.95)"); gr.addColorStop(0.5, "rgba(255,180,100,0.35)"); gr.addColorStop(1, "rgba(255,170,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
const picked = (o: ProductOptions, sel: OptionSelection, key: string) => { const g = o.groups.find((x) => x.key === key); const k = one(sel[key]); return g && k ? g.choices.find((c) => c.key === k) : undefined; };
/** The handle shown before one is picked: the range's own default (spec drawing look). */
function handleFromSel(o: ProductOptions, sel: OptionSelection, meta: DrawMeta): { type: string; fin: string; len: number } {
  const c = picked(o, sel, "handle");
  const lenC = picked(o, sel, "handleLength"); const len = lenC ? parseInt(lenC.label) || 200 : 200;
  if (c) {
    const type = /fingerpull|shark/i.test(c.label) ? (/recess/i.test(c.label) ? "Recessed Fingerpull" : "Reverse Fingerpull") : c.section || c.label;
    return { type, fin: c.label, len: /Shell/.test(type) ? 64 : /Luna/.test(type) ? 75 : /Pinta/.test(type) ? 192 : /Trim/.test(type) ? 168 : len };
  }
  if (meta.face === "fingerpull") return { type: "Recessed Fingerpull", fin: "", len };
  const d = meta.handle;
  return d === "none" ? { type: "No handle", fin: "", len } : d === "knob" ? { type: "Bell Knob", fin: "Black Matte", len } : d === "top" ? { type: "Curved Top Pull", fin: "Brushed Aluminium", len } : { type: "Lounge Handle", fin: "Stainless Steel", len: 160 };
}

// ── The vanity ─────────────────────────────────────────────────────────────────────
/** cabinetHex: a Dulux colour match picked by name, painted instead of the finish swatch. */
export function buildVanity(o: ProductOptions, sel: OptionSelection, imgs: Imgs, cabinetHex?: string): Built {
  const meta = drawMeta(o, sel);
  const group = new THREE.Group(), movers: Mover[] = [];
  const widthMm = meta.width ?? 900, W = mm(widthMm), Wc = mm(widthMm - (meta.cabInsetMm ?? 0)), Dp = mm(meta.depthMm ?? 460);
  const tMm = meta.topMm ?? meta.topBaseMm ?? 20, T = mm(tMm);
  const mount = meta.mount ?? "wallmount", onFloor = mount !== "wallmount";
  const plinth = onFloor ? mm(meta.plinthMm ?? 150) : 0;
  const H = onFloor ? mm(meta.floorMm ?? 840) - plinth : mm(meta.wallMm ?? 490);
  const y0 = onFloor ? plinth : mm(850) - H;
  const frontT = 0.018, carD = Dp - 0.016 - frontT, zBack = -0.6 + 0.001, zFront = zBack + carD;
  const face = meta.face ?? "plain";
  const cabImg = !cabinetHex && meta.cabinetImage ? imgs.get(meta.cabinetImage) : undefined, cabCol = cabinetHex ?? "#d8cfc2";
  const finishPlain = (wM: number, hM: number) => new THREE.MeshStandardMaterial({ map: canvasTex(swatchCanvas(cabImg, wM * 1000, hM * 1000, cabCol)), roughness: 0.75, envMapIntensity: 0.15 });
  const P = 0.016;
  const slab = (w: number, h: number, d: number, x: number, y: number, z: number, mats: THREE.Material | THREE.Material[] = carcassInner) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m; };

  // Bands across the top: recessed frieze or fixed rail panel; curved / open shelf ends.
  const recess = mm(meta.topRecessMm ?? (face === "frieze" ? 12 : 0));
  const rail = meta.railMm ? mm(meta.railMm) : meta.rail ? 0.06 : 0;
  // Curved ends (Reef, Shore): a big front radius, as in the product photos.
  const sideW = meta.curved ? Math.min(carD / 2, Math.max(0.12, Wc * 0.16)) : 0;
  const cfg = meta.config ?? "";
  const ends = meta.shelf === "ends" ? (/2 shelf ends/.test(cfg) ? [-1, 1] : [meta.shelfSide === "left" ? -1 : 1]) : [];
  const endW = ends.length ? Math.max(0.1, Wc * 0.15) : 0;
  const endR = Math.min(endW, carD) * 0.92; // open shelf ends round off at the front (Avion)
  const xL = -Wc / 2 + (sideW || (ends.includes(-1) ? endW : 0)), xR = Wc / 2 - (sideW || (ends.includes(1) ? endW : 0));

  // Carcass: open box, finished outside, melamine inside (cut back where a curved or open end takes over).
  const fSide = face === "shiplap" ? (() => { const bk = bakeFront("shiplap", cabImg, cabCol, carD * 1000, H * 1000, [0, 0, carD * 1000, H * 1000]); return new THREE.MeshStandardMaterial({ map: bk.map, normalMap: bk.normal ?? null, roughness: 0.72, envMapIntensity: 0.15 }); })() : finishPlain(carD, H), fEdge = finishPlain(P, H);
  const openL = ends.includes(-1), openR = ends.includes(1), bx0 = xL + (openL ? 0 : P), bx1 = xR - (openR ? 0 : P);
  if (!openL) slab(P, H, carD, xL + P / 2, y0 + H / 2, zBack + carD / 2, [carcassInner, fSide, fEdge, carcassInner, fEdge, carcassInner]);
  if (!openR) slab(P, H, carD, xR - P / 2, y0 + H / 2, zBack + carD / 2, [fSide, carcassInner, fEdge, carcassInner, fEdge, carcassInner]);
  slab(bx1 - bx0, P, carD, (bx0 + bx1) / 2, y0 + P / 2, zBack + carD / 2, [carcassInner, carcassInner, carcassInner, finishPlain(Wc, carD), finishPlain(Wc, P), carcassInner]);
  slab(bx1 - bx0, P, carD, (bx0 + bx1) / 2, y0 + H - P / 2, zBack + carD / 2);
  slab(bx1 - bx0, H - 2 * P, 0.006, (bx0 + bx1) / 2, y0 + H / 2, zBack + 0.003);
  // A flat plan shape (x outward from 0, outer front corner rounded by r) extruded up by h, at an end of the cabinet.
  const endPiece = (wd: number, r: number, h: number, side: number, x: number, y: number, mat: THREE.MeshStandardMaterial) => {
    const sh = new THREE.Shape(); r = Math.min(r, wd, carD);
    sh.moveTo(0, 0); sh.lineTo(wd, 0); sh.lineTo(wd, -carD + r); sh.absarc(wd - r, -carD + r, r, 0, -Math.PI / 2, true); sh.lineTo(0, -carD); sh.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 24 }); geo.rotateX(-Math.PI / 2);
    const pos = geo.getAttribute("position") as THREE.BufferAttribute, nor = geo.getAttribute("normal") as THREE.BufferAttribute, uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (Math.abs(nor.getY(i)) > 0.5) uv.setXY(i, x / wd, z / carD); // top / underside
      else uv.setXY(i, (x + z) / (wd + carD), y / h); // round the edge
    }
    const m = new THREE.Mesh(geo, mat); if (side < 0) m.scale.x = -1; // mirrored for the left end (three flips the face winding)
    m.position.set(x, y, zBack); m.castShadow = m.receiveShadow = true; group.add(m); return m;
  };
  const fx0 = -Wc / 2 + sideW + (ends.includes(-1) ? endW : 0), fx1 = Wc / 2 - sideW - (ends.includes(1) ? endW : 0);
  const fyTop = y0 + H - recess - rail, fyFull = y0;
  const shelfBelow = meta.shelf === "below";
  const fyBot = shelfBelow ? fyFull + (fyTop - fyFull) * 0.47 : fyFull;

  // Doors / drawers: same rules as the line drawing.
  const doors = +(cfg.match(/(\d)\s*door/)?.[1] ?? 0);
  const drawers = +(cfg.match(/(\d)\s*drawer/)?.[1] ?? (doors ? 0 : shelfBelow ? 1 : 2));
  const forced = !!meta.splitFrom && !doors && widthMm >= meta.splitFrom;
  let drawerCols = drawers === 0 ? 0 : meta.rows ? Math.ceil(drawers / meta.rows) : drawers >= 4 ? 2 : 1;
  if (forced && drawerCols < 2) drawerCols = 2;
  const perCol = !drawerCols ? 0 : meta.rows ? (forced ? meta.rows : Math.min(meta.rows, drawers)) : forced ? drawers : Math.ceil(drawers / drawerCols);
  const dc: string[] = Array(doors).fill("door"), wc: string[] = Array(drawerCols).fill("drawer");
  const drawersLeft = meta.drawerSide ? meta.drawerSide === "left" : meta.basinSide ? meta.basinSide === "right" : false;
  let seq: string[] = meta.arrange === "split-drawers" && drawerCols === 2 && doors ? ["drawer", ...dc, "drawer"]
    : meta.arrange === "split-doors" && doors >= 2 && drawerCols ? [...dc.slice(0, Math.floor(doors / 2)), ...wc, ...dc.slice(Math.floor(doors / 2))]
    : drawersLeft ? [...wc, ...dc] : [...dc, ...wc];
  if (!seq.length) seq = ["drawer"];
  const gap = 0.003, colW = (fx1 - fx0 - gap * (seq.length + 1)) / seq.length, colH = fyTop - fyBot;
  const off = meta.basinLayout === "off centre";
  const split = seq.length > 2 && seq[0] === seq[seq.length - 1] && new Set(seq).size > 1;
  const basinLeft = meta.basinSide ? meta.basinSide === "left" : !split && drawerCols > 0 && !drawersLeft;
  const centres = meta.basinLayout === "double" ? [-W * 0.25, W * 0.25] : off ? [(basinLeft ? -1 : 1) * W * 0.25] : [0];

  const hnd = handleFromSel(o, sel, meta);
  const gapMat = finishPlain(0.2, 0.2); gapMat.color.set(0x55514b); gapMat.side = THREE.DoubleSide;
  const slotMat = finishPlain(0.3, 0.03); slotMat.color.set(0x6d6861);
  const topPull = /Top Pull/.test(hnd.type), curvedPull = /Curved/.test(hnd.type), hMat = finOf(hnd.fin);
  // slotDrop: a routed groove this far below the top (Rossi). Recessed fingerpull = a round-ended slot
  // routed into the front just under its top edge; reverse fingerpull = the back of the top edge bevelled away
  // (as pictured in the Marquis Bathroom Book, p122).
  function frontPanel(parent: THREE.Object3D, w: number, h: number, colRect: [number, number, number, number], slotDrop = 0) {
    const rev = hnd.type === "Reverse Fingerpull" ? Math.min(0.035, h * 0.3) : 0;
    const slot = hnd.type === "Recessed Fingerpull" && face !== "fingerpull" ? { top: 0.014, hh: 0.026 } : slotDrop ? { top: Math.max(0.01, slotDrop - 0.009), hh: 0.018 } : null;
    const ph = h - rev;
    const baked = bakeFront(face, cabImg, cabCol, w * 1000, ph * 1000, colRect);
    const fm = new THREE.MeshStandardMaterial({ map: baked.map, normalMap: baked.normal ?? null, normalScale: new THREE.Vector2(1, 1), roughness: 0.72, envMapIntensity: 0.15 });
    const side = finishPlain(0.02, h);
    let p: THREE.Mesh;
    if (slot && w > 0.1 && ph > slot.top + slot.hh + 0.02) {
      const sh = new THREE.Shape(); sh.moveTo(-w / 2, -ph / 2); sh.lineTo(w / 2, -ph / 2); sh.lineTo(w / 2, ph / 2); sh.lineTo(-w / 2, ph / 2); sh.lineTo(-w / 2, -ph / 2);
      const sw = w - 2 * Math.min(0.03, w * 0.08), r = slot.hh / 2, cy = ph / 2 - slot.top - r;
      const hole = new THREE.Path(); hole.moveTo(-sw / 2 + r, cy - r); hole.lineTo(sw / 2 - r, cy - r); hole.absarc(sw / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2, false);
      hole.lineTo(-sw / 2 + r, cy + r); hole.absarc(-sw / 2 + r, cy, r, Math.PI / 2, Math.PI * 1.5, false); sh.holes.push(hole);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: frontT, bevelEnabled: false, curveSegments: 16 }); geo.translate(0, 0, -frontT / 2);
      const pos = geo.getAttribute("position") as THREE.BufferAttribute, nor = geo.getAttribute("normal") as THREE.BufferAttribute, uv = geo.getAttribute("uv") as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) if (Math.abs(nor.getZ(i)) > 0.5) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / ph + 0.5); // the face photo across the front
      p = new THREE.Mesh(geo, [fm, side]);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(sw, slot.hh), slotMat); back.position.set(0, cy, -frontT / 2 + 0.004); p.add(back); // the slot's floor, 14mm in
    } else p = new THREE.Mesh(new THREE.BoxGeometry(w, ph, frontT), [side, side, side, side, fm, carcassInner]);
    p.position.y = -rev / 2; p.castShadow = p.receiveShadow = true; parent.add(p);
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.003, h + 0.003), gapMat); bk.position.z = -frontT / 2 - 0.0015; parent.add(bk);
    if (rev) { // the face runs straight up to a thin top edge; the back is bevelled away into the vanity for your fingers
      const sh = new THREE.Shape(); sh.moveTo(-frontT / 2, 0); sh.lineTo(frontT / 2, 0); sh.lineTo(frontT / 2, rev); sh.lineTo(frontT / 2 - 0.005, rev); sh.lineTo(-frontT / 2, 0);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(w / 2, 0, 0);
      const wedge = new THREE.Mesh(geo, finishPlain(w, rev)); wedge.position.y = h / 2 - rev; wedge.castShadow = wedge.receiveShadow = true; parent.add(wedge);
    }
  }
  function addHandle(parent: THREE.Object3D, w: number, h: number, kind: string, towardsCentre: number) {
    if (/Fingerpull|No handle/.test(hnd.type)) return;
    if (topPull) { const len = Math.min(hnd.len / 1000, w - 0.03); const m = new THREE.Mesh(pullGeo(curvedPull, len), hMat); m.position.set(0, h / 2, frontT / 2); m.castShadow = true; parent.add(m); return; }
    const obj = handleObj(hnd.type, hnd.fin, hnd.len, kind === "door" && !meta.doorHandle);
    if (kind === "door") obj.position.set(meta.doorHandle ? 0 : towardsCentre * (w / 2 - 0.045), h / 2 - (meta.doorHandle ? 0.04 : Math.min(0.14, h * 0.25)), frontT / 2);
    else obj.position.set(0, h / 2 - Math.min(0.05, h * 0.28), frontT / 2);
    parent.add(obj);
  }
  // Dividers between drawer stacks / door compartments.
  for (let c = 0; c < seq.length - 1; c++) {
    if (seq[c] === "door" && seq[c + 1] === "door") continue;
    slab(P, H - 2 * P, carD - 0.02, fx0 + gap + (c + 1) * (colW + gap) - gap / 2, y0 + H / 2, zBack + 0.006 + (carD - 0.02) / 2);
  }
  // A drawer box (the top one under a basin notched round the plumbing: 90 x 200mm).
  function drawerBox(parent: THREE.Object3D, w: number, h: number, notchX: number | null) {
    const bw = w - 0.04, bh = Math.max(0.05, h - 0.06), dd = carD - 0.05, t = 0.012, z0 = -frontT / 2 - 0.004, yb = -h / 2 + 0.025;
    const add = (gw: number, gh: number, gd: number, x: number, y: number, z: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), boxWhite); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); };
    add(bw, bh, t, 0, yb + bh / 2, z0 - t / 2);
    add(t, bh, dd, -bw / 2 + t / 2, yb + bh / 2, z0 - dd / 2); add(t, bh, dd, bw / 2 - t / 2, yb + bh / 2, z0 - dd / 2);
    if (notchX == null) { add(bw, bh, t, 0, yb + bh / 2, z0 - dd + t / 2); add(bw - 2 * t, 0.008, dd, 0, yb + 0.004, z0 - dd / 2); return; }
    const nw = 0.09, nd = 0.2, L = -bw / 2, R = bw / 2, nl = Math.max(L + 0.03, notchX - nw / 2), nr = Math.min(R - 0.03, notchX + nw / 2);
    add(nl - L, bh, t, (L + nl) / 2, yb + bh / 2, z0 - dd + t / 2); add(R - nr, bh, t, (R + nr) / 2, yb + bh / 2, z0 - dd + t / 2);
    add(t, bh, nd, nl + t / 2, yb + bh / 2, z0 - dd + nd / 2); add(t, bh, nd, nr - t / 2, yb + bh / 2, z0 - dd + nd / 2);
    add(nr - nl, bh, t, (nl + nr) / 2, yb + bh / 2, z0 - dd + nd);
    add(nl - L - t, 0.008, dd, (L + t + nl) / 2, yb + 0.004, z0 - dd / 2); add(R - t - nr, 0.008, dd, (nr + R - t) / 2, yb + 0.004, z0 - dd / 2);
    add(nr - nl, 0.008, dd - nd, (nl + nr) / 2, yb + 0.004, z0 - (dd - nd) / 2);
  }
  const pull = mm(meta.pullRecessMm ?? 0);
  seq.forEach((kind, c) => {
    const cx = fx0 + gap + c * (colW + gap) + colW / 2, towardsCentre = cx <= 0 ? 1 : -1;
    if (kind === "door") {
      const fh = colH - 2 * gap, hinge = new THREE.Group(), hx = cx - towardsCentre * colW / 2;
      hinge.position.set(hx, fyBot + gap + fh / 2, zFront + frontT / 2);
      const door = new THREE.Group(); door.position.x = towardsCentre * colW / 2; hinge.add(door);
      frontPanel(door, colW, fh, [0, 0, colW * 1000, fh * 1000]);
      addHandle(door, colW, fh, "door", towardsCentre);
      group.add(hinge); movers.push({ obj: hinge, kind: "door", dir: -towardsCentre, t: 0 });
      const sd = carD * 0.45; slab(colW - 0.004, P, sd, cx, fyBot + colH * 0.45, zBack + carD - sd / 2 - 0.01, boxWhite);
    } else {
      const dh = (colH - gap * (perCol + 1)) / perCol;
      for (let j = 0; j < perCol; j++) {
        const drawer = new THREE.Group(), cy = fyTop - gap - j * (dh + gap) - dh / 2;
        drawer.position.set(cx, cy, zFront + frontT / 2);
        if (pull) { const r = new THREE.Mesh(new THREE.BoxGeometry(colW, pull, 0.006), shadowMat); r.position.set(0, dh / 2 - pull / 2, -frontT / 2 + 0.003); drawer.add(r); }
        const fGroup = new THREE.Group(); fGroup.position.y = -pull / 2; drawer.add(fGroup);
        frontPanel(fGroup, colW, dh - pull, [0, (j * (dh + gap) + pull) * 1000, colW * 1000, colH * 1000], meta.grooveMm && hnd.type === "No handle" ? mm(meta.grooveMm) : 0);
        const bx = j === 0 ? centres.find((b) => Math.abs(b - cx) < colW / 2) : undefined;
        drawerBox(drawer, colW, dh, bx == null ? null : bx - cx);
        addHandle(fGroup, colW, dh - pull, "drawer", towardsCentre);
        group.add(drawer); movers.push({ obj: drawer, kind: "drawer", z0: drawer.position.z, t: 0 });
      }
    }
  });
  // Top band: recessed finger-pull channel, or a fixed rail panel in the range's face.
  if (recess) { const fm = finishPlain(Wc, recess); fm.color.set(0x77726b); slab(xR - xL - 2 * P, recess, 0.012, (xL + xR) / 2, y0 + H - recess / 2, zFront - 0.002, fm); }
  if (rail) {
    const ry = y0 + H - recess - rail / 2, rp = new THREE.Group(); rp.position.set(0, ry, zFront + frontT / 2);
    frontPanel(rp, fx1 - fx0 - 2 * gap, rail - gap, [0, 0, (fx1 - fx0) * 1000, rail * 1000]); group.add(rp);
  }
  // Framed front (Palm): stiles and rails standing proud round the fronts.
  if (face === "framed") {
    const fr = finishPlain(0.03, H), z = zFront + frontT + 0.004;
    slab(0.02, H, 0.012, -Wc / 2 + 0.01, y0 + H / 2, z, fr); slab(0.02, H, 0.012, Wc / 2 - 0.01, y0 + H / 2, z, fr);
    slab(Wc, 0.02, 0.012, 0, y0 + H - 0.01, z, fr); slab(Wc, 0.02, 0.012, 0, y0 + 0.01, z, fr);
  }
  // Curved end panels (Reef, Shore): rounded front corners each side.
  if (sideW) for (const s of [-1, 1]) endPiece(sideW, sideW, H, s, s * (Wc / 2 - sideW), y0, finishPlain(carD, H));
  // Open shelves: ends (Avion: no outer side; top, shelf and base round off at the front) or under the drawers (Oxford, Merewether).
  for (const e of ends) {
    const b = e * (Wc / 2 - endW);
    slab(P, H, carD, b - e * P / 2, y0 + H / 2, zBack + carD / 2, finishPlain(carD, H)); // the drawer section's side
    slab(endW, H, 0.006, b + e * endW / 2, y0 + H / 2, zBack + 0.003, finishPlain(endW, H)); // back
    for (const y of [y0, y0 + H / 2 - P / 2, y0 + H - P]) endPiece(endW, endR, P, e, b, y, finishPlain(endW, carD));
  }
  if (shelfBelow) {
    const bays = widthMm >= 1500 ? (meta.basinLayout === "centre" || !meta.basinLayout ? 3 : 2) : 1;
    slab(Wc - 2 * P, P, carD - 0.01, 0, fyBot, zBack + carD / 2, boxWhite);
    for (let b = 1; b < bays; b++) slab(P, fyBot - y0 - P, carD - 0.02, -Wc / 2 + b * Wc / bays, y0 + (fyBot - y0) / 2, zBack + carD / 2);
  }
  // Kick / legs.
  if (mount === "kick") slab(Wc - 0.06, plinth, carD - 0.06, 0, plinth / 2, zBack + (carD - 0.06) / 2, finishPlain(Wc, plinth));
  else if (mount === "legs") {
    const lc = picked(o, sel, "legStyle"), lab = lc?.label ?? "Square Leg, Black Matte", fin = lab.split(", ")[1] || "Black Matte", m = finOf(fin);
    const ix = Wc / 2 - 0.04, zf = zBack + carD - 0.04, zb = zBack + 0.04;
    [[-ix, zf], [ix, zf], [-ix, zb], [ix, zb]].forEach(([x, z]) => {
      const leg = new THREE.Group(); leg.position.set(x, 0, z);
      const add = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => { const q = new THREE.Mesh(geo, mat); q.position.y = y; q.castShadow = true; leg.add(q); };
      if (/Square/.test(lab)) add(new THREE.BoxGeometry(0.035, plinth, 0.035), m, plinth / 2);
      else if (/Timber/.test(lab)) { add(new THREE.CylinderGeometry(0.024, 0.014, plinth - 0.006, 28), finOf("Timber"), (plinth - 0.006) / 2); add(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 28), finOf("Black Matte"), plinth - 0.003); }
      else { add(new THREE.CylinderGeometry(0.02, 0.02, plinth - 0.01, 32), m, (plinth - 0.01) / 2 + 0.01); add(new THREE.CylinderGeometry(0.017, 0.019, 0.01, 32), finOf("Black Matte"), 0.005); }
      group.add(leg);
    });
  }

  // Benchtop + basin(s).
  const topChoice = picked(o, sel, "top"), bare = meta.basin === "none";
  const basinChoice = picked(o, sel, "basin");
  const sp = meta.basin === "above" && basinChoice && basinChoice.key !== "own-basin" ? basinSpec(basinChoice.label) ?? basinSpec("Paco") : meta.basin === "above" && !basinChoice ? basinSpec("Paco") : null;
  const moulded = meta.basin === "moulded" || meta.basin === "under";
  const topSurf = y0 + H + T, zTop = zBack + Dp / 2;
  const cz = zTop + (sp ? Math.min(0.02, Dp / 2 - sp.D / 2 - 0.012) : 0.02);
  if (!bare) {
    const topImg = meta.topImage ? imgs.get(meta.topImage) : undefined;
    const topCol = moulded && !topImg ? "#ecebe7" : "#d8d4cc";
    const tc = swatchCanvas(topImg, W * 1000, Dp * 1000, topCol);
    const topMat = new THREE.MeshStandardMaterial({ map: canvasTex(tc), color: 0xb6b2ab, roughness: /symphony/i.test(topChoice?.label ?? "") ? 0.6 : 0.5, envMapIntensity: 0.06 });
    if (moulded && !topImg) topMat.color.set(0xd9d9d6);
    // A hole where the basin sits down into (semi-inset / moulded / under-counter) the top.
    const holes: { x: number; z: number; w: number; d: number; plan: any }[] = [];
    if (sp && sp.above) { const k = bowlScale(sp, (sp.H - sp.above) / sp.H) * 0.995; centres.forEach((x) => holes.push({ x, z: cz - zTop, w: sp.W * k, d: sp.D * k, plan: sp })); }
    if (moulded) centres.forEach((x) => holes.push({ x, z: 0.03, w: 0.42, d: 0.3, plan: { plan: "super", n: 3.2 } }));
    let topGeo: THREE.BufferGeometry;
    // The top follows curved ends (Reef, Shore) and rounded open shelf ends (Avion).
    const over = (W - Wc) / 2, cr = (e: number) => Math.min(Dp * 0.98, W / 2 - 0.01, sideW ? sideW + over : ends.includes(e) ? endR + over : 0);
    const rL = cr(-1), rR = cr(1);
    if (holes.length || rL || rR) {
      const shp = new THREE.Shape(); shp.moveTo(-W / 2, Dp / 2); shp.lineTo(-W / 2, -Dp / 2 + rL); if (rL) shp.absarc(-W / 2 + rL, -Dp / 2 + rL, rL, Math.PI, 1.5 * Math.PI, false);
      shp.lineTo(W / 2 - rR, -Dp / 2); if (rR) shp.absarc(W / 2 - rR, -Dp / 2 + rR, rR, 1.5 * Math.PI, 2 * Math.PI, false); shp.lineTo(W / 2, Dp / 2); shp.lineTo(-W / 2, Dp / 2);
      for (const h of holes) { const p = new THREE.Path(); for (let j = 0; j <= 72; j++) { const [px, pz] = planPt({ ...h.plan, W: h.w, D: h.d }, j / 72); const X = h.x + px, Y = -(h.z + pz); if (j) p.lineTo(X, Y); else p.moveTo(X, Y); } shp.holes.push(p); }
      topGeo = new THREE.ExtrudeGeometry(shp, { depth: T, bevelEnabled: false, curveSegments: 16 }); topGeo.rotateX(-Math.PI / 2);
      // shape UVs are in metres: map one top-width of photo across
      const uv = topGeo.getAttribute("uv") as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + W / 2) / W, (uv.getY(i) + Dp / 2) / Dp);
    } else { topGeo = new THREE.BoxGeometry(W, T, Dp); topGeo.translate(0, T / 2, 0); }
    const top = new THREE.Mesh(topGeo, topMat); top.position.set(0, y0 + H, zTop); top.castShadow = top.receiveShadow = true; group.add(top);
    if (moulded) centres.forEach((x) => { // the integrated / under-counter bowl below the opening
      const bsp: BSpec = { plan: "super", n: 3.2, W: 0.42, D: 0.3, H: 0.15, above: 0, bowl: "curved", base: 0.45 };
      const bowl = new THREE.Mesh(basinGeometry(bsp), [topMat, new THREE.MeshPhysicalMaterial({ color: 0xd2d3d1, roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide })]);
      bowl.position.set(x, topSurf - 0.15, zTop + 0.03); group.add(bowl);
    });
  }
  if (sp) {
    const geo = basinGeometry(sp), mats = basinMats(basinChoice?.label ?? "Paco White Gloss", sp);
    centres.forEach((x) => {
      const bowl = new THREE.Mesh(geo, mats); bowl.position.set(x, topSurf - (sp.above ? sp.H - sp.above : 0), cz); bowl.castShadow = true; group.add(bowl); // (no self-shadowing: avoids banding on the curved walls)
      const waste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 28), chrome); waste.position.set(x, bowl.position.y + 0.0135, cz + (sp.deck ? sp.deck.dz : 0)); group.add(waste);
      if (!sp.above && contactTex) { const cs = new THREE.Mesh(new THREE.PlaneGeometry(sp.W * bowlScale(sp, 0) * 1.32, sp.D * bowlScale(sp, 0) * 1.32), new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false })); cs.rotation.x = -Math.PI / 2; cs.position.set(x, topSurf + 0.0006, cz); group.add(cs); }
    });
  }
  // Overflow ring (under-counter / moulded basins), in the chosen finish.
  const ring = picked(o, sel, "overflow");
  if (ring && moulded) centres.forEach((x) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 12, 32), finOf(ring.label)); r.position.set(x, topSurf - 0.035, zTop + 0.03 - 0.13); group.add(r); });

  // Tapware: per tap holes / position (wall tap with no holes; 3 holes = spout + 2 handles).
  const holesC = picked(o, sel, "tapHoles"), posC = picked(o, sel, "tapPosition");
  const wallTap = holesC?.key === "none", three = holesC?.key === "3";
  const basinTop = sp ? topSurf + (sp.above || sp.H) : topSurf + 0.02;
  const tapPts: ({ x: number; z: number } | null)[] = [];
  if (!bare) centres.forEach((x) => {
    const tap = new THREE.Group();
    const mixer = (h: number, reach: number) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, h, 32), chrome); b.position.y = h / 2; tap.add(b);
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, reach, 24), chrome); s.rotation.x = Math.PI / 2; s.position.set(0, h - 0.012, reach / 2); tap.add(s);
    };
    if (wallTap) {
      const yS = basinTop + 0.16, reach = cz + 0.6 - 0.02;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 32), chrome); plate.rotation.x = Math.PI / 2; plate.position.set(0, yS, 0.004); tap.add(plate);
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, reach, 24), chrome); s.rotation.x = Math.PI / 2; s.position.set(0, yS, reach / 2); tap.add(s);
      const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 28), chrome); lever.rotation.x = Math.PI / 2; lever.position.set(0, yS + 0.09, 0.012); tap.add(lever);
      tap.position.set(x, 0, -0.6); tapPts.push(null);
    } else {
      const ang = sp?.deck ? 0 : ({ "10-oclock": -Math.PI / 3, "12-oclock": 0, "2-oclock": Math.PI / 3 } as Record<string, number>)[posC?.key ?? "12-oclock"] ?? 0;
      const rT = sp ? (sp.deck ? sp.D / 2 - 0.06 : Math.max(sp.W, sp.D) / 2 * (Math.abs(Math.sin(ang)) > 0.1 ? 1 : sp.D / Math.max(sp.W, sp.D)) + 0.035) : 0.2;
      const tx = x + Math.sin(ang) * rT, tz = Math.max(zBack + 0.03, cz - Math.cos(ang) * rT);
      const yBase = sp?.deck ? basinTop : topSurf;
      const hgt = Math.max(0.14, basinTop - yBase + 0.17), reach = Math.min(0.17, Math.hypot(tx - x, tz - cz) - 0.02);
      mixer(hgt, Math.max(0.06, reach));
      if (three) [-1, 1].forEach((s) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.06, 24), chrome); k.position.set(s * 0.1, 0.03, 0); tap.add(k); });
      else { const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 12), chrome); lever.rotation.z = Math.PI / 2.6; lever.position.set(0.03, hgt - 0.03, -0.004); tap.add(lever); }
      tap.position.set(tx, yBase, tz); tap.rotation.y = -ang; tapPts.push({ x: tx, z: tz });
    }
    tap.traverse((q: any) => { if (q.isMesh) q.castShadow = true; }); group.add(tap);
  });
  // Plumbing: waste + bottle trap to the wall, braided hoses to stop valves.
  const hoseM = std({ color: 0x9a9fa3, metalness: 0.7, roughness: 0.45 });
  const tube = (pts: number[][], r: number, m: THREE.Material) => { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([a, b, c]) => new THREE.Vector3(a, b, c))), 48, r, 12, false); const q = new THREE.Mesh(g, m); q.castShadow = true; group.add(q); };
  const zN = zBack + 0.11;
  if (!bare) centres.forEach((x, i) => {
    const yW = sp && sp.above ? topSurf - (sp.H - sp.above) : moulded ? topSurf - 0.15 : topSurf, yTrap = Math.min(yW - 0.08, topSurf - 0.17);
    tube([[x, yW + 0.005, moulded ? zTop + 0.03 : cz], [x, yW - 0.05, moulded ? zTop + 0.03 : cz], [x, yW - 0.085, zN + 0.07], [x, yTrap + 0.06, zN + 0.005]], 0.016, chrome);
    const trap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.12, 32), chrome); trap.position.set(x, yTrap, zN); group.add(trap);
    tube([[x, yTrap + 0.03, zN - 0.02], [x, yTrap + 0.03, zBack + 0.03], [x, yTrap + 0.03, zBack - 0.003]], 0.016, chrome);
    const tp = tapPts[i];
    if (tp) [-1, 1].forEach((s) => {
      const vx = x + s * 0.03, vy = topSurf - 0.27, vz = zBack + 0.03;
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.05, 20), chrome); valve.rotation.x = Math.PI / 2; valve.position.set(vx, vy, zBack + 0.025); group.add(valve);
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 20), std({ color: s < 0 ? 0xc2453c : 0x3a6fc2, roughness: 0.5 })); knob.position.set(vx, vy + 0.02, zBack + 0.03); group.add(knob);
      tube([[tp.x + s * 0.008, topSurf, tp.z], [tp.x + s * 0.008, topSurf - 0.06, tp.z], [vx, vy + 0.09, (tp.z + vz) / 2 + 0.03], [vx, vy + 0.03, vz + 0.035], [vx, vy, vz + 0.05]], 0.0045, hoseM);
    });
  });
  // In-drawer power point (white plate with two outlets + USB) on the chosen side.
  const extras = many(sel.extras);
  if (extras.includes("powerpoint")) {
    const side = one(sel.powerSide) === "left" ? -1 : 1, dr = movers.find((m) => m.kind === "drawer");
    if (dr) { const plate = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.06, 0.012), boxWhite); plate.position.set(side * (colW / 2 - 0.12), 0, -frontT / 2 - 0.02); dr.obj.add(plate); }
  }
  // LED strip (wall-hung), drawn by the caller with lights.
  const led = extras.includes("led") && mount === "wallmount";
  if (led) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(Wc - 0.06, 0.006, 0.012), new THREE.MeshBasicMaterial({ color: 0xffe2b8 }));
    strip.position.set(0, y0 - 0.003, zBack + carD - 0.05); group.add(strip);
    const fg = new THREE.Mesh(new THREE.PlaneGeometry(Wc * 1.5, 1.0), new THREE.MeshBasicMaterial({ map: ledGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fg.rotation.x = -Math.PI / 2; fg.position.set(0, 0.002, zBack + 0.35); fg.name = "glow"; group.add(fg);
    const wg = new THREE.Mesh(new THREE.PlaneGeometry(Wc * 1.3, y0 * 1.6), new THREE.MeshBasicMaterial({ map: ledGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); wg.position.set(0, y0 * 0.55, -0.598); wg.name = "glow"; group.add(wg);
    group.userData.ledY = y0; group.userData.ledZ = zBack + carD - 0.08; group.userData.ledW = Wc;
  }
  const overall = Math.round((onFloor ? (meta.floorMm ?? 840) : (meta.wallMm ?? 490)) + (bare ? 0 : tMm));
  const dims = `${widthMm}mm wide · ${meta.depthMm ?? 460}mm deep · ${onFloor ? "overall" : "cabinet + top"} ${overall}mm high${bare ? "" : ` · ${tMm}mm top`}`;
  return { group, movers, led, dims, focusY: onFloor ? 0.5 : 0.62, widthM: W };
}

/** Every image a build might lay over the 3D model (cabinet finishes + benchtop colours). */
export function textureSources(o: ProductOptions): string[] {
  return o.groups.filter((g) => g.drawFill).flatMap((g) => g.choices.map((c) => c.image)).filter((x): x is string => !!x);
}
