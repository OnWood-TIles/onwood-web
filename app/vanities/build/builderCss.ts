// Styles for the vanity builder pages (plain CSS string, injected with <style>,
// matching the shop's DEPT_TABLET_CSS pattern). Uses the site theme tokens.
export const BUILDER_CSS = `
.vb-wrap{max-width:1240px;margin:0 auto;padding:clamp(96px,14vw,140px) 24px 110px}
.vb-head{max-width:720px;margin:0 0 34px}
.vb-eyebrow{font-size:12.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--accent2)}
.vb-head h1{font-family:var(--font-archivo);font-weight:800;font-size:clamp(34px,4.6vw,56px);letter-spacing:-.025em;line-height:1.04;margin:12px 0 0}
.vb-head p{color:#5a6067;font-size:16px;line-height:1.65;margin:14px 0 0}
.vb{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:36px;align-items:start}
.vb>*,.vb-step,.vb-summary{min-width:0}
.vb-head p{overflow-wrap:anywhere}
.vb-step{background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px 22px 24px;margin-bottom:18px}
.vb-step-h{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px}
.vb-step-h h2{font-family:var(--font-archivo);font-size:19px;font-weight:800;margin:1px 0 0;letter-spacing:-.01em}
.vb-step-h p{margin:4px 0 0;color:#6a7075;font-size:14px}
.vb-num{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:99px;background:var(--ink);color:#fff;font-weight:800;font-size:13px}
.vb-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.vb-chip{font:inherit;font-size:13.5px;font-weight:700;padding:8px 14px;border-radius:99px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}
.vb-chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.vb-models{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.vb-card,.vb-opt{font:inherit;text-align:left;cursor:pointer;background:#fff;border:1.5px solid var(--line);border-radius:16px;color:var(--ink);transition:border-color .15s,box-shadow .15s}
.vb-card{display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 12px;text-align:center}
.vb-card svg{max-width:100%;height:auto}
.vb-card strong{font-size:15px;margin-top:4px}
.vb-card span{font-size:12.5px;color:#6a7075;line-height:1.4}
.vb-card em{font-style:normal;font-size:13.5px;font-weight:700;color:var(--accent);margin-top:2px}
.vb-card.on,.vb-opt.on{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 18%,transparent)}
.vb-card:hover,.vb-opt:hover:not(:disabled){border-color:color-mix(in oklab,var(--accent) 55%,var(--line))}
.vb-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.vb-opt{display:flex;flex-direction:column;gap:3px;padding:13px 15px}
.vb-opt strong{font-size:14.5px;line-height:1.35}
.vb-opt small{font-size:12.5px;color:#6a7075;line-height:1.4}
.vb-opt span{font-size:13.5px;font-weight:700;color:var(--accent);margin-top:2px}
.vb-opt:disabled{opacity:.45;cursor:not-allowed}
.vb-opt:disabled span{color:#6a7075;font-weight:600}
.vb-select{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px;font-size:14px;font-weight:700}
.vb-select select{font:inherit;font-weight:600;font-size:14px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink);max-width:100%}
.vb-groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:4px 16px}
.vb-groups .vb-select{flex-direction:column;align-items:stretch;gap:6px;margin-top:6px}
.vb-note{margin:0;color:#4f565c;font-size:15px;line-height:1.65}
.vb-side{position:sticky;top:96px}
.vb-summary{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;box-shadow:0 18px 50px -30px rgba(16,28,30,.35)}
.vb-draw{background:var(--bg);border-radius:16px;padding:14px 10px 8px;text-align:center}
.vb-draw svg{max-width:100%;height:auto}
.vb-draw small{display:block;font-size:11px;color:#8a9094;margin-top:2px}
.vb-summary h3{font-family:var(--font-archivo);font-size:19px;font-weight:800;line-height:1.25;margin:16px 0 8px}
.vb-summary ul{margin:0;padding:0 0 0 18px;color:#4f565c;font-size:14px;line-height:1.6}
.vb-total{display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);margin-top:16px;padding-top:14px}
.vb-total span{font-size:14px;font-weight:700;color:#5a6067}
.vb-total strong{font-family:var(--font-archivo);font-size:32px;font-weight:800;letter-spacing:-.02em}
.vb-fine{font-size:12.5px;color:#7a8085;margin:4px 0 16px}
.vb-ctas{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.vb-primary{text-decoration:none;background:var(--accent);color:#fff6ee;font-weight:700;font-size:15px;padding:14px 22px;border-radius:99px}
.vb-link{display:inline-block;margin-top:14px;font-size:14px;font-weight:700;color:var(--ink)}
.vb-bar{display:none}
.vb-index{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-bottom:42px}
.vb-tile{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;text-decoration:none;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px 16px}
.vb-tile svg{max-width:100%;height:auto}
.vb-tile strong{font-family:var(--font-archivo);font-size:18px;font-weight:800}
.vb-tile span{font-size:13.5px;color:#6a7075}
.vb-tile em{font-style:normal;font-weight:700;color:var(--accent)}
.vb-tile:hover{border-color:color-mix(in oklab,var(--accent) 55%,var(--line))}
.vb-cat{font-family:var(--font-archivo);font-size:24px;font-weight:800;letter-spacing:-.015em;margin:0 0 14px}
.vb-preview{display:inline-block;margin-bottom:18px;font-size:12.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:#fff3d6;color:#8a5a00;border:1px solid #f0d58f;border-radius:99px;padding:6px 12px}
@media (max-width:900px){
  .vb{grid-template-columns:1fr}
  .vb-side{position:static}
  .vb-wrap{padding-left:16px;padding-right:16px}
  .vb-step{padding:18px 16px 20px}
  .vb-models{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vb-bar{display:flex;align-items:center;gap:10px;position:fixed;left:12px;right:12px;bottom:12px;z-index:40;background:var(--ink);color:#fff;text-decoration:none;border-radius:99px;padding:12px 18px;box-shadow:0 12px 30px -10px rgba(0,0,0,.45)}
  .vb-bar span{flex:1;font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vb-bar strong{font-size:17px}
  .vb-bar em{font-style:normal;font-size:13px;opacity:.8}
}
`;
