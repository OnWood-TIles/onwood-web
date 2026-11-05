"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// "Build it in 3D": the same options, rules and prices as the 2D builder (lib/options), with
// the vanity rendered live in 3D. Every step of the 2D builder is here; "Complete" returns
// to the product page with the build in the URL, where the usual Add to quote steps follow.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { WebsiteRange } from "../../../../lib/onbase/client";
import {
  choicePrice, groupShown, isAvailable, many, normalizeSelection, one, priceOptions,
  type OptionGroup, type OptionSelection, type ProductOptions,
} from "../../../../lib/options";
import { buildVanity, ledGlowTex, textureSources, type Built } from "./build";
import { DuluxNameInput, duluxPicked, findDulux, useDulux } from "../dulux";
import { saveBuild } from "../savedBuild";

const fmt = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
const visibleGroups = (o: ProductOptions, sel: OptionSelection) =>
  o.groups.filter((g) => groupShown(g, sel) && (g.type === "text" || g.choices.some((c) => isAvailable(o, g, c, sel))));
function readQuery(o: ProductOptions, q: Record<string, string>): OptionSelection {
  const sel: OptionSelection = {};
  for (const g of o.groups) { const v = q[`o_${g.key}`]; if (v != null) sel[g.key] = g.type === "multi" ? v.split(",").filter(Boolean) : v; }
  return normalizeSelection(o, sel);
}
const toQuery = (o: ProductOptions, sel: OptionSelection) => {
  const q = new URLSearchParams();
  for (const g of o.groups) { const v = sel[g.key]; const s = Array.isArray(v) ? v.join(",") : v; if (s) q.set(`o_${g.key}`, s); }
  return q.toString();
};

// Neutral tiled room: 1200 x 600 greige wall tiles, 600 x 600 stone-look floor.
function tileTexture(cols: number, rows: number, base: number[], grout: string, vary: number) {
  const N = 1024, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d")!;
  const tw = N / cols, th = N / rows; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.fillStyle = grout; g.fillRect(0, 0, N, N);
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const k = 1 + (rnd() - 0.5) * vary, [R, G, B] = base.map((v) => Math.round(Math.min(255, v * k)));
    g.fillStyle = `rgb(${R},${G},${B})`; g.fillRect(q * tw + 2, r * th + 2, tw - 4, th - 4);
    for (let i = 0; i < 1400; i++) { const a = rnd() * 0.05; g.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; g.fillRect(q * tw + 2 + rnd() * (tw - 4), r * th + 2 + rnd() * (th - 4), 2 + rnd() * 5, 1 + rnd() * 3); }
  }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}

type Stage = {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; controls: OrbitControls;
  hemi: THREE.HemisphereLight; sun: THREE.DirectionalLight; fill: THREE.DirectionalLight; env: THREE.Texture | null; leds: THREE.PointLight[];
};

export default function Vanity3D({ range, query, backHref }: { range: WebsiteRange; query: Record<string, string>; backHref: string }) {
  const o = range.options!;
  const [sel, setSel] = useState<OptionSelection>(() => readQuery(o, query));
  // Dulux colour match: the named Dulux colour paints the model.
  // (before a colour is named: a plain paint colour, not the multi-colour swatch)
  const isDulux = duluxPicked(o, sel), dulux = useDulux(isDulux), duluxHex = isDulux ? findDulux(dulux, sel)?.[2] ?? "#e4e1da" : undefined;
  const [open, setOpen] = useState<string | null>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  // The benchtop uses the full-size colour photo (laid over a whole slab), fetched when a colour is picked.
  const [hiTick, setHiTick] = useState(0);
  const hiDone = useRef(new Set<string>());
  useEffect(() => {
    const g = o.groups.find((x) => x.drawFill === "top"), k = g ? one(sel[g.key]) : undefined;
    const src = g?.choices.find((c) => c.key === k)?.image;
    if (!src || hiDone.current.has(src)) return;
    hiDone.current.add(src);
    const hi = src.replace(/-\d+x\d+(\.(?:jpe?g|png|webp))/i, "$1"); if (hi === src) return;
    const im = new Image(); im.crossOrigin = "anonymous";
    im.onload = () => { imgs.current.set(src, im); setHiTick((t) => t + 1); }; im.src = hi;
  }, [o, sel]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dims, setDims] = useState("");
  const [ledOn, setLedOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const built = useRef<Built | null>(null);
  const imgs = useRef(new Map<string, HTMLImageElement>());
  const anim = useRef({ open: false, fly: null as null | { from: THREE.Vector3; to: THREE.Vector3; t: number } });
  const views = useRef<Record<string, THREE.Vector3>>({});

  const steps = useMemo(() => visibleGroups(o, sel), [o, sel]);
  const priced = useMemo(() => priceOptions(o, sel), [o, sel]);
  const pick = (g: OptionGroup, v: string | string[] | undefined) => setSel((s) => normalizeSelection(o, { ...s, [g.key]: v }));

  // ── Set up the stage once ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9e5de);
    const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 0.7; controls.maxDistance = 6;
    controls.maxPolarAngle = Math.PI * 0.53; controls.minAzimuthAngle = -Math.PI * 0.62; controls.maxAzimuthAngle = Math.PI * 0.62;
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d2c8, 0.62); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.72); sun.position.set(1.4, 2.6, 2.6); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -1 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 5; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.22); fill.position.set(-2, 1.2, 2.4); scene.add(fill);
    const floorTex = tileTexture(2, 2, [138, 133, 126], "#77726b", 0.07); floorTex.repeat.set(8 / 1.2, 6 / 1.2);
    const wallTex = tileTexture(1, 2, [176, 172, 166], "#a19c95", 0.05); wallTex.repeat.set(8 / 1.2, 3.2 / 1.2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, envMapIntensity: 0.3 }));
    floor.rotation.x = -Math.PI / 2; floor.position.z = 2.4; floor.receiveShadow = true; scene.add(floor);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.7, envMapIntensity: 0.2 }));
    wall.position.set(0, 1.6, -0.6); wall.receiveShadow = true; scene.add(wall);
    const leds = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xffc68a, 0, 1.4, 2); scene.add(l); return l; });
    stage.current = { renderer, scene, camera, controls, hemi, sun, fill, env, leds };

    const resize = () => { const r = canvas.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
    let last = performance.now(), raf = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const a = anim.current;
      for (const m of built.current?.movers ?? []) {
        const goal = a.open ? 1 : 0;
        if (m.t !== goal) {
          m.t = reduce ? goal : Math.max(0, Math.min(1, m.t + (goal ? 1 : -1) * dt * 1.6));
          const e = m.t < 0.5 ? 2 * m.t * m.t : 1 - Math.pow(-2 * m.t + 2, 2) / 2;
          if (m.kind === "drawer") m.obj.position.z = (m.z0 ?? 0) + e * 0.3; else m.obj.rotation.y = (m.dir ?? 1) * e * 1.35;
        }
      }
      if (a.fly) { a.fly.t = Math.min(1, a.fly.t + dt * (reduce ? 10 : 1.8)); const e = 1 - Math.pow(1 - a.fly.t, 3); camera.position.lerpVectors(a.fly.from, a.fly.to, e); if (a.fly.t >= 1) a.fly = null; }
      controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Preload the cabinet + benchtop photos (same-origin, so they can be used as textures).
    const srcs = textureSources(o);
    Promise.all(srcs.map((src) => new Promise<void>((res) => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { imgs.current.set(src, im); res(); }; im.onerror = () => res(); im.src = src; })))
      .then(() => setReady(true));
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); };
  }, [o]);

  // ── Rebuild the vanity when the build changes ────────────────────────────────────
  useEffect(() => {
    const st = stage.current; if (!st || !ready) return;
    const prev = built.current;
    const b = buildVanity(o, sel, imgs.current, duluxHex);
    if (prev) { st.scene.remove(prev.group); prev.group.traverse((q: any) => { q.geometry?.dispose?.(); }); }
    b.movers.forEach((m) => { m.t = anim.current.open ? 1 : 0; if (m.kind === "drawer") m.obj.position.z = (m.z0 ?? 0) + m.t * 0.3; else m.obj.rotation.y = (m.dir ?? 1) * m.t * 1.35; });
    st.scene.add(b.group); built.current = b; setDims(b.dims); setLedOn(b.led);
    // Fit the whole build (tap included) in view, whatever the window shape.
    const box = new THREE.Box3().setFromObject(b.group), mid = box.getCenter(new THREE.Vector3()), rad = box.getSize(new THREE.Vector3()).length() / 2;
    const vfov = THREE.MathUtils.degToRad(st.camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * st.camera.aspect);
    const target = new THREE.Vector3(0, mid.y, mid.z), dist = Math.max(1.6, (rad / Math.sin(Math.min(vfov, hfov) / 2)) * 0.88);
    views.current = { front: new THREE.Vector3(0, target.y + 0.12, target.z + dist), angle: new THREE.Vector3(dist * 0.62, target.y + 0.55, target.z + dist * 0.78), side: new THREE.Vector3(dist * 0.95, target.y + 0.2, target.z + dist * 0.25) };
    st.controls.target.copy(target);
    if (!prev) st.camera.position.copy(views.current.angle);
    else if (Math.abs((prev.widthM) - b.widthM) > 0.01) anim.current.fly = { from: st.camera.position.clone(), to: views.current.angle.clone(), t: 0 };
    if (!b.led && dark) setDark(false);
  }, [o, sel, ready, duluxHex, hiTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lights: room lights on, or dimmed to a warm evening glow (shows off the LED strip).
  useEffect(() => {
    const st = stage.current; if (!st) return;
    const b = built.current, on = !!b?.led;
    st.hemi.color.set(dark ? 0xffcf96 : 0xffffff); st.hemi.groundColor.set(dark ? 0x6b5640 : 0xd8d2c8); st.sun.color.set(dark ? 0xffc27a : 0xffffff);
    st.hemi.intensity = dark ? 0.24 : 0.62; st.sun.intensity = dark ? 0.16 : 0.72; st.fill.intensity = dark ? 0.04 : 0.22;
    st.scene.environment = dark ? null : st.env; st.scene.background = new THREE.Color(dark ? 0x3a3027 : 0xe9e5de);
    st.leds.forEach((l, i) => { l.intensity = on ? (dark ? 1.8 : 0.55) : 0; if (b) l.position.set((i - 1) * (b.group.userData.ledW ?? 1) * 0.33, Math.max(0.05, (b.group.userData.ledY ?? 0.3) - 0.04), b.group.userData.ledZ ?? -0.2); });
    b?.group.traverse((q: any) => { if (q.name === "glow") q.material.opacity = dark ? 0.9 : 0.4; });
  }, [dark, ledOn, sel, ready]);

  useEffect(() => { anim.current.open = doorsOpen; }, [doorsOpen]);
  const flyTo = (k: string) => { const st = stage.current; if (st && views.current[k]) anim.current.fly = { from: st.camera.position.clone(), to: views.current[k].clone(), t: 0 }; };

  // ── Options panel: every step of the 2D builder ──────────────────────────────────
  const missing = priced.ok ? 0 : steps.filter((g) => g.required && !one(sel[g.key])).length;
  // Every change is kept: in this page's address (refresh) and in the browser, so the product
  // page picks it up however they leave (buttons or the browser Back button).
  const slug = backHref.split("/").pop() ?? "";
  useEffect(() => {
    const q = toQuery(o, sel);
    window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
    saveBuild(slug, q, true);
  }, [o, sel, slug]);
  const complete = () => { window.location.href = `${backHref}?${toQuery(o, sel)}#vb-builder`; };
  const keepShopping = () => { window.location.href = range.department ? `/shop/${range.department}` : "/shop"; };
  const summary = (g: OptionGroup) => {
    if (g.type === "text") return one(sel[g.key]) || "Not answered yet";
    const ks = many(sel[g.key]); if (!ks.length) return g.type === "multi" ? "None added" : g.required ? "Choose one" : "Standard";
    return ks.map((k) => { const c = g.choices.find((x) => x.key === k); return c ? (c.section && !c.label.includes(c.section) && g.key === "handle" ? `${c.section}, ${c.label}` : c.label) : ""; }).filter(Boolean).join(", ");
  };

  return (
    <div className="v3">
      <style>{CSS}</style>
      <section className={`v3-stage ${dark ? "night" : ""}`} aria-label="3D view of your vanity">
        <canvas ref={canvasRef} className="v3-canvas" />
        <div className="v3-top">
          <div><a className="v3-back" href={`${backHref}?${toQuery(o, sel)}`}>Back to the product page</a><h1>{range.name}</h1><p>{dims}</p></div>
        </div>
        {!ready && !failed && <div className="v3-msg">Loading the 3D view…</div>}
        {failed && <div className="v3-msg">The 3D view needs WebGL, which this browser has turned off. Use the builder on the product page instead.</div>}
        <div className="v3-tools">
          <button type="button" className="v3-tool" aria-pressed={doorsOpen} onClick={() => setDoorsOpen((v) => !v)}>{doorsOpen ? "Close drawers" : "Open drawers"}</button>
          {ledOn && <button type="button" className="v3-tool" aria-pressed={dark} onClick={() => setDark((v) => !v)}>{dark ? "Room lights on" : "Dim the room lights"}</button>}
          <button type="button" className="v3-tool" onClick={() => flyTo("front")}>Front</button>
          <button type="button" className="v3-tool" onClick={() => flyTo("angle")}>Angle</button>
          <button type="button" className="v3-tool" onClick={() => flyTo("side")}>Side</button>
        </div>
        <div className="v3-hint">Illustration only · drag to turn · pinch or scroll to zoom</div>
      </section>

      <aside className="v3-panel" aria-label="Your options">
        <div className="v3-steps">
          {steps.map((g, i) => {
            const isOpen = open === g.key, avail = g.type === "text" ? [] : g.choices.filter((c) => isAvailable(o, g, c, sel)), ks = many(sel[g.key]);
            const done = g.type === "text" ? !!one(sel[g.key]) : ks.length > 0;
            const photos = avail.filter((c) => c.image).length > 6;
            return (
              <section key={g.key} className={`v3-step ${isOpen ? "open" : ""}`}>
                <button type="button" className="v3-step-h" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.key)}>
                  <span className={`v3-num ${done ? "done" : ""}`}>{i + 1}</span>
                  <span className="v3-step-t"><strong>{g.label}{g.required && !done ? " *" : ""}</strong><small>{summary(g)}</small></span>
                  <span className="v3-step-c">{isOpen ? "Close" : done ? "Change" : "Choose"}</span>
                </button>
                {isOpen && (
                  <div className="v3-step-b">
                    {g.help && <p className="v3-help">{g.help}</p>}
                    {g.type === "text" ? (
                      g.key === "duluxName" ? <DuluxNameInput list={dulux} sel={sel} setSel={setSel} className="v3-text" id={`v3-${g.key}`} /> : <input className="v3-text" id={`v3-${g.key}`} value={String(one(sel[g.key]) ?? "")} placeholder={g.placeholder} onChange={(e) => setSel((s) => ({ ...s, [g.key]: e.target.value }))} />
                    ) : photos ? (
                      [...new Set(avail.map((c) => c.section ?? ""))].map((sec) => (<div key={sec || "all"}>
                      {sec && <h4 className="v3-sec">{sec}</h4>}
                      <div className="v3-sws">
                        {avail.filter((c) => (c.section ?? "") === sec).map((c) => { const on = ks.includes(c.key), p = choicePrice(c, sel); return (
                          <button type="button" key={c.key} className={`v3-sw ${on ? "on" : ""}`} aria-pressed={on} title={c.label} onClick={() => pick(g, g.type === "multi" ? (on ? ks.filter((k) => k !== c.key) : [...ks, c.key]) : c.key)}>
                            {c.image ? <img src={c.image} alt="" loading="lazy" /> : <span className="v3-sw-t">{c.label}</span>}
                            <span className="v3-sw-l">{c.label}{p ? ` +${fmt(p)}` : ""}</span>
                          </button>
                        ); })}
                      </div></div>))
                    ) : (
                      <div className="v3-chips">
                        {!g.required && g.type === "single" && <button type="button" className={`v3-chip ${!ks.length ? "on" : ""}`} onClick={() => pick(g, undefined)}>Standard</button>}
                        {avail.map((c) => { const on = ks.includes(c.key), p = choicePrice(c, sel); return (
                          <button type="button" key={c.key} className={`v3-chip ${on ? "on" : ""}`} aria-pressed={on} title={c.detail ?? c.label} onClick={() => pick(g, g.type === "multi" ? (on ? ks.filter((k) => k !== c.key) : [...ks, c.key]) : on && !g.required ? undefined : c.key)}>
                            {c.image && <img src={c.image} alt="" />}<span>{c.label}</span>{p ? <em>{p > 0 ? "+" : "-"}{fmt(Math.abs(p))}</em> : null}
                          </button>
                        ); })}
                      </div>
                    )}
                    {(g.type !== "single" || !g.required) && <button type="button" className="v3-next" onClick={() => setOpen(steps[i + 1]?.key ?? null)}>{steps[i + 1] ? `Next: ${steps[i + 1].label}` : "Done"}</button>}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <div className="v3-done">
          <div className="v3-total"><span>Your build</span><strong>{fmt(priced.total)}</strong><small>incl. GST</small></div>
          {missing > 0 && <p className="v3-miss">{missing} answer{missing === 1 ? "" : "s"} still needed (marked *). You can finish them on the product page.</p>}
          <button type="button" className="v3-complete" onClick={complete}>Complete and request a quote</button>
          <button type="button" className="v3-save" onClick={keepShopping}>Save my build and keep shopping</button>
          <p className="v3-fine">Takes your build back to the product page, ready to add to your quote.</p>
          <p className="v3-disc">The 3D view is an illustration only. Colours, timber grain, stone veining, sizes and details on screen are a guide and may differ from the real product, so please do not rely on it for an exact match. We are happy to show you real samples in the showroom.</p>
        </div>
      </aside>
    </div>
  );
}

const CSS = `
.v3{display:grid;grid-template-columns:minmax(0,1fr) 400px;height:100dvh;background:#f3f1ed;color:#1f2a2e;font-family:var(--font-body,system-ui),sans-serif}
.v3-stage{position:relative;min-height:0;background:#e9e5de}
.v3-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.v3-top{position:absolute;left:max(16px,env(safe-area-inset-left,0px));right:16px;top:calc(12px + env(safe-area-inset-top,0px));pointer-events:none}
.v3-top a{pointer-events:auto}
.v3-back{display:inline-block;font-size:13px;font-weight:600;color:#2f6f6a;text-decoration:none;margin-bottom:4px}
.v3-top h1{margin:0;font-size:22px;font-weight:600}
.v3-top p{margin:2px 0 0;font-size:12.5px;color:#5d6766;font-variant-numeric:tabular-nums}
.v3-stage.night .v3-top h1,.v3-stage.night .v3-disc{margin:10px 0 0;font-size:11.5px;line-height:1.45;color:#6b7473}
.v3-hint{color:#e9ecea}.v3-stage.night .v3-top p{color:#b9c0bf}
.v3-msg{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;color:#5d6766;font-size:14px}
.v3-tools{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;gap:6px;flex-wrap:wrap;justify-content:center;width:max-content;max-width:calc(100% - 24px)}
.v3-tool{font:inherit;font-weight:600;font-size:13px;border:1px solid #dedad2;background:#fff;color:#1f2a2e;border-radius:999px;padding:8px 14px;cursor:pointer}
.v3-tool[aria-pressed=true]{background:#2f6f6a;color:#fff;border-color:#2f6f6a}
.v3-hint{position:absolute;right:16px;bottom:calc(64px + env(safe-area-inset-bottom,0px));font-size:12px;color:#65706f;pointer-events:none}
.v3-panel{display:flex;flex-direction:column;min-height:0;background:#fff;border-left:1px solid #dedad2}
.v3-steps{flex:1;min-height:0;overflow-y:auto;padding:12px 16px}
.v3-step{border-bottom:1px solid #eeebe5}
.v3-step-h{display:flex;align-items:center;gap:10px;width:100%;padding:11px 2px;border:0;background:none;font:inherit;text-align:left;cursor:pointer;color:inherit}
.v3-num{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:#f1eee8;color:#65706f}
.v3-num.done{background:#2f6f6a;color:#fff}
.v3-step-t{flex:1;min-width:0;display:flex;flex-direction:column}.v3-step-t strong{font-size:14px}.v3-step-t small{font-size:12px;color:#65706f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v3-step-c{font-size:12px;font-weight:600;color:#2f6f6a}
.v3-step-b{padding:2px 2px 14px}
.v3-help{margin:0 0 8px;font-size:12.5px;color:#65706f;line-height:1.45}
.v3-chips{display:flex;flex-wrap:wrap;gap:6px}
.v3-chip{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid #dedad2;background:#f7f5f1;color:#1f2a2e;cursor:pointer}
.v3-chip img{width:22px;height:22px;border-radius:5px;object-fit:cover}
.v3-chip em{font-style:normal;font-weight:600;color:#2f6f6a;font-size:12px}
.v3-chip.on{background:#2f6f6a;color:#fff;border-color:#2f6f6a}.v3-chip.on em{color:#d7ece9}
.v3-sws{display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:8px}
.v3-sw{display:flex;flex-direction:column;gap:3px;padding:0;border:0;background:none;cursor:pointer;font:inherit;text-align:left;color:inherit}
.v3-sw img,.v3-sw-t{width:100%;aspect-ratio:1;border-radius:10px;object-fit:cover;box-shadow:inset 0 0 0 1px #dedad2;border:2px solid transparent;display:grid;place-items:center;font-size:10px;background:#f7f5f1;box-sizing:border-box}
.v3-sw.on img,.v3-sw.on .v3-sw-t{border-color:#2f6f6a}
.v3-sec{margin:10px 0 6px;font-size:12px;font-weight:700;color:#20303a}
.v3-sw-l{font-size:10.5px;line-height:1.2;color:#45504f;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.v3-text{width:100%;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid #dedad2;box-sizing:border-box}
.v3-next{margin-top:10px;font:inherit;font-size:13px;font-weight:600;border:0;background:none;color:#2f6f6a;cursor:pointer;padding:0}
.v3-done{border-top:1px solid #dedad2;padding:12px 16px calc(14px + env(safe-area-inset-bottom,0px));background:#fbfaf7}
.v3-total{display:flex;align-items:baseline;gap:8px}.v3-total span{font-size:13px;color:#65706f;flex:1}.v3-total strong{font-size:24px}.v3-total small{font-size:12px;color:#65706f}
.v3-miss{margin:6px 0 0;font-size:12.5px;color:#9a4a16}
.v3-save{width:100%;margin-top:8px;font:inherit;font-size:14px;font-weight:600;padding:11px;border-radius:12px;border:1.5px solid #2f6f6a;background:#fff;color:#2f6f6a;cursor:pointer}
.v3-complete{width:100%;margin-top:10px;font:inherit;font-size:15px;font-weight:700;padding:13px;border-radius:12px;border:0;background:#2f6f6a;color:#fff;cursor:pointer}
.v3-fine{margin:6px 0 0;font-size:12px;color:#65706f;text-align:center}
.v3 button:focus-visible,.v3 a:focus-visible,.v3 input:focus-visible{outline:2px solid #2f6f6a;outline-offset:2px}
@media (max-width:860px){.v3{grid-template-columns:1fr;grid-template-rows:52dvh minmax(0,1fr)}.v3-panel{border-left:0;border-top:1px solid #dedad2}.v3-hint{display:none}}
`;
