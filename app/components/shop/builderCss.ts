// Styles for the product-options builder (product pages of products with options) (plain CSS string, injected with <style>,
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
.vb-step{background:#fff;border:1px solid var(--line);border-radius:18px;margin-bottom:10px;scroll-margin-top:96px;transition:box-shadow .15s}
.vb-step.open{box-shadow:0 14px 40px -28px rgba(16,28,30,.4)}
.vb-step-h{font:inherit;color:var(--ink);background:none;border:0;width:100%;text-align:left;cursor:pointer;display:flex;gap:12px;align-items:center;padding:14px 18px}
.vb-step-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.vb-step-t strong{font-family:var(--font-archivo);font-size:17px;font-weight:800;letter-spacing:-.01em}
.vb-step-t small{display:flex;align-items:center;gap:8px;color:#5a6067;font-size:13.5px;line-height:1.35;overflow:hidden;text-overflow:ellipsis}
.vb-step-t small img{flex:none;width:22px;height:22px;border-radius:6px;object-fit:cover}
.vb-step-c{flex:none;font-size:13px;font-weight:700;color:var(--accent)}
.vb-step-b{padding:2px 18px 20px}
.vb-num{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:99px;background:#e8e4dc;color:var(--ink);font-weight:800;font-size:13px}
.vb-num.done{background:var(--ink);color:#fff}
.vb-step.open .vb-num{background:var(--accent);color:#fff}
.vb-next{font:inherit;display:block;margin:16px 0 0 auto;padding:10px 18px;border-radius:99px;border:0;background:var(--ink);color:#fff;font-weight:700;font-size:14px;cursor:pointer}
.vb-drawn .vb-opt{align-items:center;text-align:center}
.vb-drawn .vb-opt svg{max-width:100%;height:auto;margin-bottom:4px}
.vb-larger{font:inherit;display:inline-flex;align-items:center;gap:7px;margin:0 0 6px;padding:8px 14px;border-radius:99px;border:1.5px solid var(--ink);background:#fff;color:var(--ink);font-weight:700;font-size:13.5px;cursor:pointer}
.vb-pop{position:fixed;inset:0;z-index:300;background:rgba(20,24,26,.55);display:flex;align-items:center;justify-content:center;padding:24px}
.vb-pop-panel{background:var(--bg);border-radius:22px;width:min(1000px,100%);max-height:calc(100dvh - 48px);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px -30px rgba(0,0,0,.5)}
.vb-pop-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px 10px}
.vb-pop-h h2{font-family:var(--font-archivo);font-size:22px;font-weight:800;margin:0}
.vb-pop-h button{border:0;background:#fff;border-radius:99px;width:38px;height:38px;display:grid;place-items:center;cursor:pointer;color:var(--ink)}
.vb-pop-tabs{padding:0 22px;margin-bottom:6px}
.vb-pop-body{overflow-y:auto;padding:4px 22px 24px}
.vb-pop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.vb-pop-tile{font:inherit;text-align:left;cursor:pointer;background:#fff;border:2px solid var(--line);border-radius:16px;padding:8px 8px 10px;color:var(--ink);display:flex;flex-direction:column;gap:3px}
.vb-pop-tile img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:11px;margin-bottom:5px;font-size:22px}
.vb-pop-tile strong{font-size:14px;line-height:1.3}
.vb-pop-tile small{font-size:12px;color:#6a7075;line-height:1.35}
.vb-pop-tile span{font-size:13px;font-weight:700;color:var(--accent)}
.vb-pop-tile.on{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 18%,transparent)}
.vb-mini{display:none}
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
.vb-intro.has-photo{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(20px,4vw,48px);align-items:start;margin-bottom:28px}
.vb-intro.has-photo .vb-head{margin-bottom:0}
.vb-gal-main{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px;background:#f3efe7;display:block}
.vb-gal-thumbs{display:flex;gap:8px;margin-top:10px;overflow-x:auto}
.vb-gal-thumbs button{flex:0 0 auto;padding:0;border:2px solid transparent;border-radius:10px;background:none;cursor:pointer;overflow:hidden}
.vb-gal-thumbs button.on{border-color:var(--accent)}
.vb-gal-thumbs img{width:64px;height:48px;object-fit:cover;display:block}
.vb-custom-note{font-size:14px;font-weight:600;color:var(--ink);background:#fff6ee;border:1px solid var(--line);border-radius:12px;padding:10px 14px}
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
.vb-text{font:inherit;font-size:15px;width:100%;padding:11px 14px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink)}
.vb-picked{margin:-4px 0 12px;font-size:14px;color:#4f565c}
.vb-picked span{color:var(--accent);font-weight:700;margin-left:4px}
.vb-sec{margin-top:10px}
.vb-sec-h{margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#7a8085}
.vb-swatches{display:flex;flex-wrap:wrap;gap:8px}
.vb-sw{font:inherit;font-size:13px;font-weight:600;padding:8px 12px;border-radius:99px;border:1.5px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.vb-sw.img{border-radius:14px;padding:6px 10px 6px 6px}
.vb-sw img{width:34px;height:34px;border-radius:9px;object-fit:cover}
.vb-sw.on{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--accent) 18%,transparent)}
.vb-sw:hover{border-color:color-mix(in oklab,var(--accent) 55%,var(--line))}
.vb-card-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px}
.vb-opt-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;margin-bottom:6px}
.vb-below{margin-top:48px}
.vb-faq{margin-top:40px;max-width:820px}
.vb-faq h2{font-family:var(--font-archivo);font-size:26px;font-weight:800;letter-spacing:-.015em;margin:0 0 12px}
.vb-faq details{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:10px}
.vb-faq summary{cursor:pointer;font-weight:700;font-size:15.5px}
.vb-faq-a{margin-top:8px;font-size:15px;line-height:1.65;color:#4f565c}
.vb-faq-a p{margin:0}
.vb-crumbs{font-size:13px;color:#6a7075;margin:0 0 14px}
.vb-crumbs a{color:inherit}
.vb-index{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-bottom:42px}
.vb-tile{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;text-decoration:none;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px 16px}
.vb-tile svg{max-width:100%;height:auto}
.vb-tile strong{font-family:var(--font-archivo);font-size:18px;font-weight:800}
.vb-tile span{font-size:13.5px;color:#6a7075}
.vb-tile em{font-style:normal;font-weight:700;color:var(--accent)}
.vb-tile:hover{border-color:color-mix(in oklab,var(--accent) 55%,var(--line))}
.vb-cat{font-family:var(--font-archivo);font-size:24px;font-weight:800;letter-spacing:-.015em;margin:0 0 14px}
@media (max-width:900px){
  .vb-intro.has-photo{grid-template-columns:1fr;gap:18px}
  .vb-mini{display:flex;align-items:center;gap:12px;position:sticky;top:67px;z-index:30;margin:0 -16px 12px;padding:8px 16px;background:color-mix(in oklab,var(--bg) 94%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .vb-mini svg{flex:none;width:130px;height:auto}
  .vb-mini div{min-width:0;display:flex;flex-direction:column}
  .vb-mini span{font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vb-mini strong{font-family:var(--font-archivo);font-size:22px;font-weight:800}
  .vb-mini em{font-style:normal;font-size:12px;color:#7a8085}
  .vb-step{scroll-margin-top:170px}
  .vb-step-h{padding:13px 14px}
  .vb-step-b{padding:2px 14px 18px}
  .vb-pop{padding:0;align-items:flex-end}
  .vb-pop-panel{border-radius:22px 22px 0 0;max-height:92dvh}
  .vb-pop-h,.vb-pop-body{padding-left:16px;padding-right:16px}
  .vb-pop-tabs{padding:0 16px;flex-wrap:nowrap;overflow-x:auto}
  .vb-pop-tabs .vb-chip{flex:none}
  .vb-pop-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vb-drawn{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vb-swatches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
  .vb-sw{font-size:12.5px;line-height:1.3;text-align:left}
  .vb{grid-template-columns:1fr}
  .vb-side{position:static}
  .vb-wrap{padding-left:16px;padding-right:16px}
  .vb-models{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vb-bar{display:flex;align-items:center;gap:10px;position:fixed;left:12px;right:12px;bottom:12px;z-index:40;background:var(--ink);color:#fff;text-decoration:none;border-radius:99px;padding:12px 18px;box-shadow:0 12px 30px -10px rgba(0,0,0,.45)}
  .vb-bar span{flex:1;font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vb-bar strong{font-size:17px}
  .vb-bar em{font-style:normal;font-size:13px;opacity:.8}
}
`;
