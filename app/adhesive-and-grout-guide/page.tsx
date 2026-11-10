import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { RangeCard } from "../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";

// "Which adhesive and grout?" guide, laid out like the Vanity Edition's "Know your top" /
// "Which top suits you?" spread: a card per product (rating, why choose it, keep in mind), a
// side-by-side table, then quick picks by job. Facts are from LATICRETE Australia's product
// pages and data sheets (onbase/scripts/laticrete/laticrete-au-research.md). Colour strips and
// the product grid come live from the catalogue (department "adhesives").

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";
const URL_ = `${SITE}/adhesive-and-grout-guide`;

export const metadata: Metadata = {
  title: { absolute: "Which Tile Adhesive & Grout? A Simple Guide | OnWood Tiles" },
  description:
    "Choose the right LATICRETE tile adhesive and grout for floors, walls, splashbacks, outdoor areas and pools. Ratings explained, side by side, with quick picks by job.",
  alternates: { canonical: URL_ },
  openGraph: { title: "Which tile adhesive and grout? | OnWood Tiles", url: URL_, type: "article" },
};

type Card = { slug: string; name: string; rating: string; stocked: boolean; avail?: string; line: string; why: string; mind: string };

const ADHESIVES: Card[] = [
  { slug: "laticrete-335-premium-flexible-adhesive", name: "335 Premium Flexible", rating: "C2TES1", stocked: true,
    line: "A premium flexible cement adhesive for porcelain, ceramic, glass and stone, on floors and walls, inside and out.",
    why: "The everyday all-rounder. Grips well on walls, copes with outdoor areas and pools, and goes over existing tiles. White, so it won't shadow through pale tiles.",
    mind: "A standard 24 hours before grouting. For very large tiles, balconies or pools, 254 gives you more flexibility." },
  { slug: "laticrete-254-premium-adhesive", name: "254 Premium", rating: "C2TES2P2", stocked: true,
    line: "LATICRETE's highest-rated cement adhesive, formerly 254 Platinum.",
    why: "The S2 rating means it is highly deformable, so it takes the movement that large format tiles, thin porcelain, outdoor areas, balconies and pools put on an adhesive.",
    mind: "It costs more than 335, so save it for the jobs that need it. Pools need 14 days after grouting before filling." },
  { slug: "laticrete-tri-lite-lightweight-adhesive", name: "TRI-LITE Lightweight", rating: "C2TES1", stocked: true,
    line: "Lightweight and sand-free: an 11 kg bag covers like a 20 kg bag.",
    why: "Excellent sag resistance, so big tiles stay put on walls. Easier to carry and mix. Suits porcelain splashbacks and feature walls, floors, outdoors and pools.",
    mind: "One bag covers about 4 to 7 m², more than a single splashback needs." },
  { slug: "laticrete-multimastic-premium-ready-to-use-adhesive", name: "Multimastic Premium", rating: "D1TE", stocked: true,
    line: "Ready to use from the pail, no mixing.",
    why: "A 4 L pail covers about 2 m², about one kitchen splashback. Holds wall tiles without spacers. No dust, no mixing, no waste.",
    mind: "Interior dry areas only, for ceramic and natural stone. Not for showers, pools or outdoors, and slow to dry under large, dense porcelain." },
];

const SPECIAL: Card[] = [
  { slug: "laticrete-335-rapid-adhesive", name: "335 RAPID", rating: "C2TFS1", stocked: false, line: "Fast setting: grout and walk on it in about 4 hours.", why: "For jobs that must be finished in a day.", mind: "Shorter working time, mix small batches." },
  { slug: "laticrete-257-titanium-adhesive", name: "257 TITANIUM", rating: "C2TES2", stocked: false, line: "Premium lightweight for porcelain panels and glass.", why: "Can be tinted to match the grout behind see-through glass mosaics.", mind: "A specialist product, ordered in." },
  { slug: "laticrete-mvis-veneer-mortar", name: "MVIS Veneer Mortar", rating: "C2TS1", stocked: false, line: "Made for stone cladding and adhered stone veneer.", why: "Non-sag, so heavy pieces stay put on the wall.", mind: "Coverage depends on the fixing method." },
  { slug: "laticrete-latapoxy-310-stone-adhesive", name: "LATAPOXY 310", rating: "R2T", stocked: false, line: "Epoxy for spot-bonding heavy stone to walls.", why: "Holds without sagging up to 25 mm thick.", mind: "A trade product. Ask us about your job." },
];

const GROUTS: (Card & { colours: string })[] = [
  { slug: "laticrete-permacolor-select-grout", name: "PERMACOLOR Select", rating: "CG2FAW", stocked: false, avail: "All 40 colours available", colours: "40 colours",
    line: "Cement grout made from a 5 kg base and a separate colour kit, so the colour is consistent bag to bag.",
    why: "Fast setting, no sealing needed, better stain resistance than standard cement grout and built-in mould protection. Joints 1.5 to 12 mm, wet areas and pools.",
    mind: "Cement grout can still mark over time in a busy kitchen; choose epoxy where stains matter most." },
  { slug: "laticrete-permacolor-grout-new-improved", name: "PERMACOLOR New & Improved", rating: "CG2WAF", stocked: false, colours: "20 colours",
    line: "Pre-coloured cement grout in a trade-size 10 kg bag. Just add water.",
    why: "Good value for bigger floors and trade jobs. Anti-microbial, inside and out, including pools.",
    mind: "Do not mix it with the old PERMACOLOR on the same job, the colours can differ slightly." },
  { slug: "laticrete-spectralock-pro-epoxy-grout-mini", name: "SPECTRALOCK PRO Epoxy", rating: "RG", stocked: false, colours: "Up to 40 colours",
    line: "Epoxy grout: stain-proof in the home and never needs sealing.",
    why: "The pick for kitchen splashbacks, shower floors, pools and anywhere you want grout that stays the colour you chose. Mini unit for a splashback, Full unit for a bathroom.",
    mind: "Takes more care to clean up than cement grout, so work in small areas. Test first on white or porous stone." },
];

const GROUT_TABLE = [
  ["PERMACOLOR Select", "Better than standard cement", "Not needed", "40", "5 kg base + kit", "Most bathrooms, floors and walls"],
  ["PERMACOLOR N&I", "Better than standard cement", "Optional", "20", "10 kg bag", "Big floors, trade jobs"],
  ["SPECTRALOCK PRO", "Stain-proof (home use)", "Never", "Up to 40", "Mini 0.7 L · Full 3 L", "Splashbacks, showers, pools"],
];

const ADH_TABLE = [
  ["335", "C2TES1", "20 kg", "4-5 m²", "Yes", "Yes", "The everyday choice"],
  ["254", "C2TES2P2", "20 kg", "4.5-5.5 m²", "Yes", "Yes", "Large format, outdoors, pools"],
  ["TRI-LITE", "C2TES1", "11 kg", "3.9-4.4 m²", "Yes", "Yes", "Walls and big tiles"],
  ["Multimastic", "D1TE", "4 L", "1.8-2.1 m² *", "No", "No", "Dry interior splashbacks"],
];

const PICKS: [string, string][] = [
  ["Bathroom floor and walls", "335 adhesive with PERMACOLOR Select grout. Use SPECTRALOCK on the shower floor if you want stain-proof grout."],
  ["Large format floor (600x1200 and up)", "254 adhesive with a 10 or 12 mm notch trowel, back-buttering each tile. PERMACOLOR Select grout."],
  ["Feature or bathroom wall, big tiles", "TRI-LITE: it holds big tiles on the wall without slipping."],
  ["Kitchen splashback, ceramic or subway", "Multimastic Premium 4 L (one pail is about one splashback) with a SPECTRALOCK PRO Mini unit for grout that wipes clean."],
  ["Kitchen splashback, porcelain or glass", "TRI-LITE adhesive. For see-through glass mosaics, ask us about 257 TITANIUM tinted to match the grout."],
  ["Outdoor patio, alfresco or balcony", "254 adhesive and PERMACOLOR Select grout, over a properly prepared and waterproofed base."],
  ["Pool or water feature", "254 adhesive with SPECTRALOCK PRO or PERMACOLOR Select. Allow 14 days after grouting before filling."],
  ["Tiling over old tiles", "335 or 254, both rated for tile over tile. The old tiles must be sound, clean and well bonded."],
  ["Stone cladding", "MVIS Veneer Mortar, or LATAPOXY 310 for heavy pieces. Both ordered in for you."],
  ["Needs to be finished today", "335 RAPID: grout and light foot traffic after about 4 hours."],
];

const DECODE: [string, string][] = [
  ["C", "Cement-based adhesive"],
  ["D", "Dispersion (ready-mixed) adhesive"],
  ["R", "Reaction resin (epoxy) adhesive"],
  ["1 / 2", "Normal / improved bond strength"],
  ["T", "Reduced slip, so tiles hold on walls"],
  ["E", "Extended open time to place tiles"],
  ["F", "Fast setting"],
  ["S1 / S2", "Deformable / highly deformable (flexible)"],
  ["CG2", "Improved cement grout"],
  ["W / A", "Reduced water absorption / high abrasion resistance"],
  ["RG", "Reaction resin (epoxy) grout"],
];

const FAQS = [
  { q: "Which tile adhesive should I use?", a: "For most porcelain and ceramic floors and walls, a flexible C2TES1 adhesive like 335 is right. For large format tiles, outdoor areas, balconies and pools, use 254, which is rated S2 for extra flexibility. For big tiles on walls, TRI-LITE holds them without slipping." },
  { q: "How much adhesive do I need?", a: "A 20 kg bag of 335 covers about 4 to 5 m² with a 10 mm notch trowel, or 7 to 8 m² with a 6 mm notch. Bigger tiles need a bigger notch, so use more. Add the adhesive to your quote with your area and we will work out the bags." },
  { q: "What is the best adhesive for a kitchen splashback?", a: "For ceramic or stone tiles on a dry interior wall, Multimastic Premium comes ready to use in a 4 L pail that covers about one splashback. For porcelain, glass or large tiles, use TRI-LITE, as a mastic dries slowly under dense tiles." },
  { q: "Do I need to seal my grout?", a: "Not with these. PERMACOLOR Select needs no sealing and SPECTRALOCK epoxy never needs sealing. Some porous tiles and natural stone may need sealing before grouting so the grout colour does not stain the tile." },
  { q: "Cement grout or epoxy grout?", a: "Cement grout like PERMACOLOR Select suits most bathrooms and floors and is easier to use. Epoxy like SPECTRALOCK PRO is stain-proof and never needs sealing, so it is worth it for kitchen splashbacks, shower floors and pools, but it takes more care to clean up." },
  { q: "Do grout colours look the same as on screen?", a: "No, screens are a guide only, and grout can dry slightly lighter or darker. Come into the Baringa showroom and hold a real grout colour against your tile before you buy." },
];

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 };
const big: React.CSSProperties = { fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(34px,5vw,58px)", letterSpacing: "-.03em", lineHeight: 1, margin: "10px 0 16px" };
const it: React.CSSProperties = { fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400 };
const body: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "66ch", margin: "0 0 22px" };
const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", margin: "0 0 6px" };

function ProductCard({ c, swatches }: { c: Card & { colours?: string }; swatches?: string[] }) {
  return (
    <article className="ag-card">
      <div className="ag-card-head">
        <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, margin: 0 }}>
          <Link href={`/product/${c.slug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{c.name}</Link>
        </h3>
        <span style={{ ...label, color: "var(--accent)", margin: 0, whiteSpace: "nowrap" }}>{c.rating}{c.colours ? ` · ${c.colours}` : ""}</span>
      </div>
      <p style={{ ...it, fontSize: 19, lineHeight: 1.45, color: "#2f6f73", margin: "6px 0 14px" }}>{c.line}</p>
      {swatches && swatches.length > 0 && (
        <div className="ag-strip" aria-hidden>{swatches.map((h, i) => <span key={i} style={{ background: h }} />)}</div>
      )}
      <div className="ag-two">
        <div><p style={{ ...label, color: "var(--accent)" }}>Why choose it</p><p className="ag-p">{c.why}</p></div>
        <div><p style={{ ...label, color: "#8a8577" }}>Keep in mind</p><p className="ag-p">{c.mind}</p></div>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 700, color: c.stocked ? "var(--ink)" : "#8a8577" }}>
        {c.avail ?? (c.stocked ? "Stocked in our Baringa showroom" : "Ordered in for you")} · <Link href={`/product/${c.slug}`} style={{ color: "var(--accent)" }}>View product →</Link>
      </p>
    </article>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="ag-table-wrap">
      <table className="ag-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((v, i) => i === 0 ? <th key={i} scope="row">{v}</th> : <td key={i}>{v}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default async function AdhesiveGroutGuide() {
  let ranges: WebsiteRange[] = [];
  try { ranges = await listRanges({ department: "adhesives" }); } catch { /* guide still renders */ }
  const hexes = (slug: string) => ranges.find((r) => r.slug === slug)?.swatches.map((s) => s.swatchHex).filter((h): h is string => !!h) ?? [];

  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const ld = (o: object) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, "\\u003c") }} />;

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {ld(faqLd)}
      <MarketingNav />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/shop/adhesives" style={{ color: "inherit", textDecoration: "none" }}>Adhesives & Grout</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Guide</span>
        </nav>

        <p style={eyebrow}>Adhesive & grout · the guide</p>
        <h1 style={big}>What goes <span style={it}>behind and between</span></h1>
        <p style={body}>
          Every tile looks good on day one. Whether it still looks good in year ten comes down to the adhesive behind it and the grout between it. Here is what each LATICRETE product we carry is good at, what to watch for, and which one suits your job.
        </p>

        {/* QUICK PICKS first: most people arrive with a job in mind. */}
        <section className="ag-dark" id="quick-picks">
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 30, margin: "0 0 18px", color: "#fff" }}>Quick picks <span style={{ ...it, color: "#cfe3e1" }}>by job</span></h2>
          <div className="ag-picks">
            {PICKS.map(([job, pick]) => (
              <div key={job}>
                <p style={{ ...label, color: "#7fc4bd" }}>{job}</p>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#eef2f1" }}>{pick}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ADHESIVES in depth */}
        <section style={{ marginTop: 64 }} id="adhesives">
          <p style={eyebrow}>01 / Adhesive · in depth</p>
          <h2 style={big}>Know your <span style={it}>adhesive</span></h2>
          <p style={body}>The four we keep in the showroom cover almost every home job.</p>
          <div className="ag-cards">{ADHESIVES.map((c) => <ProductCard key={c.slug} c={c} />)}</div>
          <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: "40px 0 6px" }}>Ordered in <span style={it}>for the specialist jobs</span></h3>
          <div className="ag-mini">
            {SPECIAL.map((c) => (
              <Link key={c.slug} href={`/product/${c.slug}`} className="ag-mini-card">
                <span style={{ ...label, color: "var(--accent)" }}>{c.rating}</span>
                <strong style={{ fontFamily: "var(--font-archivo)", fontSize: 18, color: "var(--ink)" }}>{c.name}</strong>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#3a444a" }}>{c.line} {c.why}</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <p style={eyebrow}>01 / Adhesive · side by side</p>
          <h2 style={{ ...big, fontSize: "clamp(28px,4vw,44px)" }}>Which adhesive <span style={it}>suits you?</span></h2>
          <Table head={["Adhesive", "Rating", "Pack", "Covers (10 mm notch)", "Outdoors", "Pools & showers", "Best for"]} rows={ADH_TABLE} />
          <p style={{ fontSize: 13, color: "#8a8577", margin: "10px 0 0" }}>* Multimastic coverage is with a 6 mm notch. Bigger tiles need a bigger notch and more adhesive.</p>
        </section>

        {/* GROUT in depth */}
        <section style={{ marginTop: 64 }} id="grout">
          <p style={eyebrow}>02 / Grout · in depth</p>
          <h2 style={big}>Know your <span style={it}>grout</span></h2>
          <p style={body}>Every current LATICRETE colour is available. Ask us about lead times for the colour you need.</p>
          <div className="ag-cards">{GROUTS.map((c) => <ProductCard key={c.slug} c={c} swatches={hexes(c.slug)} />)}</div>
        </section>

        <section style={{ marginTop: 56 }}>
          <p style={eyebrow}>02 / Grout · side by side</p>
          <h2 style={{ ...big, fontSize: "clamp(28px,4vw,44px)" }}>Which grout <span style={it}>suits you?</span></h2>
          <Table head={["Grout", "Stains", "Sealing", "Colours", "Pack", "Best for"]} rows={GROUT_TABLE} />
        </section>

        {/* Ratings decoded + care */}
        <section className="ag-split" style={{ marginTop: 64 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Ratings <span style={it}>decoded</span></h2>
            <p style={{ ...body, fontSize: 15.5 }}>Every bag carries an Australian Standard rating (AS ISO 13007). Read it left to right: C2TES1 is an improved cement adhesive, slip resistant, with extended open time and some flexibility.</p>
            <dl className="ag-decode">
              {DECODE.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Getting it <span style={it}>right</span></h2>
            <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc", fontSize: 15.5, lineHeight: 1.7, color: "#3a444a" }}>
              <li>Use the notch size for your tile: bigger tiles need a bigger notch, and large format tiles should be back-buttered.</li>
              <li>Wait at least 24 hours before grouting (4 hours with 335 RAPID).</li>
              <li>Seal porous tiles and natural stone before grouting so the grout colour does not stain them.</li>
              <li>Hold a real grout sample against your tile in the showroom. Screens are a guide only.</li>
              <li>Pools and steam rooms need 14 days of curing before they are filled or used.</li>
              <li>Always follow the LATICRETE data sheet, linked on every product page.</li>
            </ul>
            <blockquote style={{ ...it, fontSize: 24, lineHeight: 1.35, color: "#2f6f73", borderTop: "3px solid var(--accent)", margin: "28px 0 0", padding: "18px 0 0" }}>
              &ldquo;If in doubt, choose 335 and PERMACOLOR Select. If it is big, outside or under water, step up to 254.&rdquo;
            </blockquote>
          </div>
        </section>

        {ranges.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 18px" }}>Shop adhesive <span style={it}>& grout</span></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {ranges.map((r) => <RangeCard key={r.id} range={r} />)}
            </div>
          </section>
        )}

        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 12px" }}>Your questions</h2>
          <div style={{ maxWidth: 820 }}>
            {FAQS.map((f, i) => (
              <details key={i} className="ow-faq" style={{ borderBottom: "1px solid var(--line)" }}>
                <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 2px", fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 17.5, lineHeight: 1.35 }}>
                  {f.q}
                  <span className="ow-faq-plus" aria-hidden style={{ flexShrink: 0, fontSize: 24, lineHeight: 1, color: "var(--accent)", transition: "transform .2s ease" }}>+</span>
                </summary>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", margin: "0 0 18px", maxWidth: "70ch" }}>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#8a8577", marginTop: 26, maxWidth: "80ch" }}>
            Product facts from LATICRETE Australia product pages and data sheets (2026). This guide is general advice; your installer and the LATICRETE data sheet for your product have the final say for your job. <Link href="/book" style={{ color: "var(--accent)" }}>Book a visit</Link> to see real grout colours.
          </p>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .ag-dark { background: #17262d; border-radius: 22px; padding: clamp(24px,4vw,40px); margin-top: 34px; }
          .ag-picks { display: grid; grid-template-columns: 1fr; gap: 22px 40px; }
          .ag-cards { display: grid; grid-template-columns: 1fr; gap: 0; border-top: 2px solid var(--ink); }
          .ag-card { padding: 24px 0; border-bottom: 1px solid var(--line); min-width: 0; }
          .ag-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
          .ag-two { display: grid; grid-template-columns: 1fr; gap: 14px; }
          .ag-p { margin: 0; font-size: 15px; line-height: 1.6; color: #3a444a; }
          .ag-strip { display: flex; height: 26px; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin: 0 0 16px; }
          .ag-strip span { flex: 1; }
          .ag-mini { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
          .ag-mini-card { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); text-decoration: none; }
          .ag-table-wrap { overflow-x: auto; margin-top: 10px; }
          .ag-table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 15px; }
          .ag-table thead th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); padding: 10px 12px 10px 0; border-bottom: 2px solid var(--ink); }
          .ag-table tbody th { text-align: left; font-family: var(--font-archivo); font-weight: 800; padding: 14px 12px 14px 0; border-bottom: 1px solid var(--line); white-space: nowrap; }
          .ag-table td { padding: 14px 12px 14px 0; border-bottom: 1px solid var(--line); color: #3a444a; }
          .ag-split { display: grid; grid-template-columns: 1fr; gap: 44px; }
          .ag-decode { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin: 0; }
          .ag-decode div { display: flex; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--line); }
          .ag-decode dt { font-family: var(--font-archivo); font-weight: 800; min-width: 56px; color: var(--accent); }
          .ag-decode dd { margin: 0; font-size: 14px; color: #3a444a; }
          @media (min-width: 760px) {
            .ag-picks { grid-template-columns: 1fr 1fr; }
            .ag-two { grid-template-columns: 1fr 1fr; gap: 28px; }
            .ag-mini { grid-template-columns: 1fr 1fr; }
          }
          @media (min-width: 1000px) {
            .ag-mini { grid-template-columns: repeat(4, 1fr); }
            .ag-split { grid-template-columns: 1fr 1fr; gap: 64px; }
          }
          @media (max-width: 520px) { .ag-decode { grid-template-columns: 1fr; } }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
