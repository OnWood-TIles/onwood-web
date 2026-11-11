import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { RangeCard } from "../components/shop/shared";
import { listRanges, type WebsiteRange } from "../../lib/onbase/client";
import Picker from "./Picker";
import { ADHESIVE_PROFILES, GROUT_PROFILES, type Profile } from "./data";

// LATICRETE Adhesives & Grout: the complete guide (footer: Shop). Laid out like the Vanity
// Edition's "Know your top" spread: picker, quick picks, a full profile per product, side-by-side
// tables, what you can tile onto, step by step, ratings decoded and a long FAQ. Facts are from
// LATICRETE Australia's product pages and data sheets (see data.ts). Colour strips and the
// product grid come live from the catalogue (department "adhesives").

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";
const URL_ = `${SITE}/adhesive-and-grout-guide`;

export const metadata: Metadata = {
  title: { absolute: "LATICRETE Tile Adhesive & Grout: The Complete Guide | OnWood Tiles" },
  description:
    "Every LATICRETE tile adhesive and grout we sell, explained: which one suits your floor, wall, splashback, shower, outdoor area or pool, how much you need, working times, mixing, colours and step by step how to use them.",
  alternates: { canonical: URL_ },
  openGraph: { title: "LATICRETE adhesive & grout: the complete guide | OnWood Tiles", url: URL_, type: "article" },
};

const ADH_TABLE = [
  ["335", "C2TES1", "20 kg", "4-5 m²", "Yes", "Yes", "Yes", "The everyday choice"],
  ["254", "C2TES2P2", "20 kg", "4.5-5.5 m²", "Yes", "Yes", "Yes", "Large format, outdoors, pools"],
  ["TRI-LITE", "C2TES1", "11 kg", "3.9-4.4 m²", "Yes", "Yes", "Yes", "Walls and big tiles"],
  ["Multimastic", "D1TE", "4 L", "1.8-2.1 m² *", "No", "No", "No", "Dry interior splashbacks"],
  ["335 RAPID", "C2TFS1", "20 kg", "4-5 m²", "Yes", "Yes", "Not stated", "Finished in a day"],
  ["257 TITANIUM", "C2TES2", "11 kg", "4.5-5.5 m²", "Yes", "Yes", "Not stated", "Glass, porcelain panels"],
  ["MVIS", "C2TS1", "20 kg", "4-4.5 m² (12 mm)", "Yes", "No", "No", "Stone cladding"],
];

const GROUT_TABLE = [
  ["PERMACOLOR Select", "Cement", "Better than standard cement", "Not needed", "40", "5 kg base + kit", "Most bathrooms, floors and walls"],
  ["PERMACOLOR N&I", "Cement", "Better than standard cement", "Optional", "20", "10 kg bag", "Most bathrooms, floors and walls; great value for bigger areas"],
  ["SPECTRALOCK PRO", "Epoxy", "Stain-proof (home use)", "Never", "34 Mini · 40 Full", "Mini 0.7 L · Full 3 L", "Splashbacks, showers, pools"],
];

const ONTO: [string, string[]][] = [
  ["Concrete slab or screed", ["Yes", "Yes", "Yes", "Yes (inside)"]],
  ["Cement sheet / fibre cement", ["Yes", "Yes", "Yes", "Yes (inside)"]],
  ["Plasterboard (inside only)", ["Yes", "Yes", "Yes", "Yes"]],
  ["Render, masonry, brick", ["Yes", "Yes", "Yes", "Yes (inside)"]],
  ["Waterproofing membrane", ["Yes", "Yes", "Yes", "Absorbent tiles only"]],
  ["Existing tiles (sound)", ["Yes", "Yes", "Yes", "Not listed"]],
  ["Exterior-grade plywood (inside)", ["Not listed", "Yes", "Not listed", "Yes"]],
  ["Vinyl or laminate", ["No", "No", "No", "No"]],
];

const PICKS: [string, string][] = [
  ["Bathroom floor and walls", "335 adhesive with PERMACOLOR Select or PERMACOLOR New & Improved grout. Use SPECTRALOCK PRO on the shower floor if you want stain-proof grout."],
  ["Large format floor (600 x 1200 and up)", "254 adhesive with a 10 or 12 mm notch trowel, back-buttering every tile. PERMACOLOR Select or New & Improved grout."],
  ["Feature or bathroom wall, big tiles", "TRI-LITE: it holds big tiles on the wall without slipping."],
  ["Kitchen splashback, ceramic or subway", "Multimastic Premium 4 L (one pail is about 2 m²) with a SPECTRALOCK PRO Mini for grout that wipes clean. A Mini grouts about 2 to 3 m² of subway tile; check yours with the grout calculator."],
  ["Kitchen splashback, porcelain or glass", "TRI-LITE adhesive. For see-through glass mosaics, 257 TITANIUM tinted to match the grout."],
  ["Outdoor patio, alfresco or balcony", "254 adhesive and PERMACOLOR Select grout (or PERMACOLOR New & Improved for big areas), over a properly prepared and waterproofed base."],
  ["Pool or water feature", "254 adhesive with SPECTRALOCK PRO or PERMACOLOR Select. Fill the pool 14 days after grouting."],
  ["Tiling over old tiles", "335 or 254, both rated for tile over tile. The old tiles must be firmly bonded, scuffed if glossy, cleaned with sugar soap, and given a skim coat of adhesive first."],
  ["Stone cladding", "MVIS Veneer Mortar, made for stone veneer and thin brick. Most stacked stone needs no grout."],
  ["Needs to be finished today", "335 RAPID: grout and light foot traffic after about 4 hours."],
];

// The whole job, in order: [step, heading, what, shop link].
const JOB: [string, string, string, string][] = [
  ["01", "Floor prep", "Get the floor flat and sound first: LEVEL self-leveller for flat indoor floors, SCREED for shower falls, STRATA_MAT over floors prone to movement.", "/shop/adhesives?c=prep"],
  ["02", "Waterproofing", "HYDRO BAN Fillet & Sealant into every wall and floor junction, then two coats of HYDRO BAN over the wet area, as AS 3740 requires.", "/shop/adhesives?c=waterproofing"],
  ["03", "Adhesives", "Fix the tiles with the adhesive that suits the tile, the surface and the room (see above).", "/shop/adhesives?c=adhesives"],
  ["04", "Grout", "Cement or epoxy grout in the colour you chose, once the adhesive has cured.", "/shop/adhesives?c=grout"],
  ["05", "Silicone", "LATASIL in the matching colour in corners, at the wall and floor join, around the bath and shower base, and in movement joints.", "/shop/adhesives?c=sealants"],
  ["06", "Cleaners & sealers", "Clear grout haze, seal porous stone and grout if you want extra stain protection, then a gentle everyday cleaner from day one.", "/shop/adhesives?c=care"],
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
  ["P2", "Bonds to plywood (254)"],
  ["CG2", "Improved cement grout"],
  ["W / A", "Reduced water absorption / high abrasion resistance"],
  ["RG", "Reaction resin (epoxy) grout"],
];

const STEPS_LAY = [
  ["Check the surface", "It must be sound, clean, flat and dry: no dust, paint, grease, curing compounds or loose material. Wet areas must be waterproofed first (in Australia, to AS 3740) and the membrane fully cured. Never tile over vinyl, laminate or floating floors."],
  ["Tiling over old tiles?", "Tap every tile and lift any hollow ones. Scuff shiny glazes, scrub with sugar soap or dishwasher powder in hot water, rinse and let dry. Then work a 1.5 mm skim coat of adhesive hard into the surface before combing on the main coat."],
  ["Plan the layout", "Dry-lay a few tiles, find the centre lines and set out cuts so you do not end with thin slivers at a doorway. Leave a gap at walls and changes of plane for movement."],
  ["Mix", "Add the powder to the measured clean water (never the other way), mix with a paddle on a slow drill until smooth and lump-free, then let it stand briefly and remix as the data sheet says. Never add water once it starts to stiffen."],
  ["Spread", "Key a thin coat into the surface with the flat side of the trowel, then comb more on with the notched side in straight lines. Only spread what you can tile within the open time (30 minutes for most)."],
  ["Back-butter big tiles", "For large format tiles, also skim a thin coat on the back of each tile. Press and slide each tile across the ridges so they collapse and fill."],
  ["Check coverage", "Lift a tile now and then. The back should be fully covered, with no hollow spots, especially in wet areas and outdoors."],
  ["Leave it alone", "Keep off it and wait before grouting: 24 hours for most adhesives, 4 hours for 335 RAPID, longer in cold weather or under big tiles."],
];

const STEPS_CEMENT = [
  ["Prepare", "Clean adhesive out of the joints. Seal porous tiles and natural stone first so the grout pigment cannot stain them."],
  ["Mix", "PERMACOLOR Select: about 1 litre of water and the whole colour kit per 5 kg base. PERMACOLOR New & Improved: about 2 litres of water per 10 kg. Mix to a smooth paste."],
  ["Pack the joints", "Work diagonally across the joints with a rubber grout float, pressing the grout in until full. Do a small area at a time."],
  ["Clean", "Once the grout firms up, wipe diagonally with a damp (not wet) sponge, rinsing often. Buff off the haze later with a dry cloth."],
  ["Cure", "Foot traffic after about 6 hours. Wait 14 days before filling pools or using steam rooms."],
];

const STEPS_EPOXY = [
  ["Read the instructions", "Epoxy works differently from cement grout. Read LATICRETE's SPECTRALOCK installation guide (TDS-1008) before you start."],
  ["Mix the whole unit", "Mix all of Part A and Part B together, then add all of Part C (the colour powder). No water."],
  ["Work small", "Spread and pack a small area at a time with a hard rubber float. Working time is about 80 minutes at 21°C, and much shorter on a hot day."],
  ["Clean as you go", "Clean each area before it sets, following the guide. Cured epoxy residue is very hard to remove, so do not leave haze on the tile."],
  ["Cure", "Light traffic after about 12 hours at 21°C, fully stain resistant after 7 days. Pools and steam rooms: 10 days."],
];

const FAQS = [
  { q: "Which tile adhesive should I use?", a: "For most porcelain and ceramic floors and walls, a flexible C2TES1 adhesive like 335 is right. For large format tiles, outdoor areas, balconies and pools, use 254, which is rated S2 for extra flexibility. For big tiles on walls, TRI-LITE holds them without slipping. For a ceramic splashback, Multimastic comes ready to use. Use the picker at the top of this page for your exact job." },
  { q: "How much adhesive do I need?", a: "A 20 kg bag of 335 covers about 4 to 5 m² with a 10 mm notch trowel, or 7 to 8 m² with a 6 mm notch. Bigger tiles need a bigger notch and back-buttering, so they use more. Every product's coverage is in its profile above. Add 10% spare, or add the adhesive to your quote with your area and we will work out the bags." },
  { q: "Which trowel (notch) size should I use?", a: "As a guide: 6 mm for mosaics and tiles up to about 300 mm, 10 mm for 300 to 600 mm tiles, and 10 to 12 mm plus back-buttering for anything bigger. What matters is full coverage under the tile, so lift a tile to check." },
  { q: "What is the best adhesive for a kitchen splashback?", a: "For ceramic or stone tiles on a dry interior wall, Multimastic Premium comes ready to use in a 4 L pail that covers about 2 m². For porcelain, glass or large tiles, use TRI-LITE, as a ready-mixed adhesive dries very slowly under dense tiles." },
  { q: "Is there a small bag of adhesive for small jobs?", a: "LATICRETE Australia does not make a small bag of cement adhesive. The smallest options are the Multimastic 4 L pail (about 2 m²) and the 11 kg TRI-LITE bag, which covers about the same as a 20 kg bag." },
  { q: "Can I tile over existing tiles?", a: "Yes, with 335 or 254, following LATICRETE's tile-over-tile steps. The old tiles must be firmly bonded: tap them, and any that sound hollow must come up first. Scuff (scarify) shiny, high-gloss glazes. Clean off grease, wax and soap with an alkaline cleaner such as sugar soap or dishwasher powder in hot water, rinse with clean water and let it dry. Then work a skim coat of adhesive about 1.5 mm thick hard into the tiles before combing on more with the notched trowel. Check door clearances and drainage falls still work with the extra height, and in showers the waterproofing must be sound." },
  { q: "Do I need a primer?", a: "Usually not. LATICRETE's data sheets for 335, 254, TRI-LITE and Multimastic do not call for a primer on normal surfaces, and for tile over tile they rely on the preparation above (scuffing, cleaning and a skim coat) rather than a primer. LATICRETE does make a primer, PRIME-N-BOND, that improves the bond to smooth, non-absorbent surfaces such as glazed tile and steel-trowelled concrete, but it is for inside dry areas only: not for showers or other wet areas, and not under waterproofing. Waterproofing membranes have their own primers; your waterproofer will use the one their system needs. Ask us if you are unsure about your surface." },
  { q: "Can I tile over vinyl, laminate or floating floors?", a: "No. Lift vinyl, laminate, floating timber and carpet and tile onto a sound, rigid surface underneath. These floors move and are not a reliable base for tile, whatever the adhesive." },
  { q: "Can I tile onto plasterboard?", a: "Inside, yes: 335, 254, TRI-LITE and Multimastic all list plasterboard for interior use. Not outside. In wet areas the board must be the right wet-area type and waterproofed first." },
  { q: "Do I need to waterproof first?", a: "In showers, bathrooms, laundries, balconies and pools, yes. The waterproofing membrane goes on before the adhesive. Adhesives and grout are not waterproofing. Your installer will waterproof to the Australian Standard (AS 3740 for wet areas)." },
  { q: "How long before I can grout?", a: "At least 24 hours for 335, 254, TRI-LITE, 257 TITANIUM and Multimastic at 21°C, longer in cold weather and under large tiles. 335 RAPID can be grouted after about 4 hours." },
  { q: "How long before I can walk on it?", a: "Most adhesives allow light foot traffic after 18 to 24 hours, 335 RAPID after about 4 hours. After grouting, cement grout takes foot traffic after about 6 hours and SPECTRALOCK PRO after about 12 hours at 21°C." },
  { q: "When can I fill the pool?", a: "LATICRETE says 14 days after grouting with 254 and PERMACOLOR grouts, and 10 days of curing for SPECTRALOCK PRO in submerged areas." },
  { q: "Cement grout or epoxy grout?", a: "Cement grout like PERMACOLOR Select suits most bathrooms and floors and is easier to use. Epoxy like SPECTRALOCK PRO is stain-proof in the home and never needs sealing, so it is worth it for kitchen splashbacks, shower floors and pools, but it takes more care to apply and clean up." },
  { q: "Do I need to seal my grout?", a: "Not with these. PERMACOLOR Select needs no sealing and SPECTRALOCK PRO never needs sealing. PERMACOLOR New & Improved can be sealed if you like, 72 hours after grouting. Separately, porous tiles and natural stone may need sealing before grouting so the grout colour does not stain the tile." },
  { q: "What is the difference between PERMACOLOR Select and PERMACOLOR New & Improved?", a: "Both are high-performance cement grouts that suit most everyday jobs: bathrooms, floors, walls, outdoors and pools. PERMACOLOR Select is a 5 kg base plus a separate colour kit, in 40 colours, fast setting and needs no sealing. PERMACOLOR New & Improved is pre-coloured in a 10 kg bag in 20 colours, good value for bigger areas. Both suit joints from 1.5 to 12 mm, so choose by colour and the size of the job." },
  { q: "What do I need to buy for PERMACOLOR Select?", a: "One 5 kg base and one colour kit for each batch. The colour kit holds the colour, the base is the same for every colour." },
  { q: "What is the SPECTRALOCK PRO Mini unit, and is it enough?", a: "It is the small size of SPECTRALOCK PRO epoxy grout: it makes about 0.7 litres, enough for about 4 m² of 300 x 300 tile, about 2 to 3 m² of 75 x 300 subway tile (depending on the joint), or about 1 m² of 50 x 50 mosaic. That covers most kitchen splashbacks of subway or larger tiles. Mosaics use far more grout. Our grout calculator works it out exactly for your tile." },
  { q: "Can I mix part of an epoxy grout unit?", a: "Mix the whole unit, Parts A, B and C together, as LATICRETE's instructions say. That is why picking the right size (Mini or Full) matters." },
  { q: "What width of grout joint can I use?", a: "PERMACOLOR Select, PERMACOLOR New & Improved and SPECTRALOCK PRO all suit joints from 1.5 to 12 mm. SPECTRALOCK is a sanded grout, so joints under 3 mm finish a little coarser." },
  { q: "Will the grout colour match what I see on screen?", a: "No, screens are a guide only, and grout can dry slightly lighter or darker depending on the tile, the joint and the weather. Hold a real grout colour sample against your tile in our Baringa showroom before you buy." },
  { q: "Which grout colour should I choose?", a: "A colour close to the tile makes the surface look calm and larger and hides small imperfections. A contrasting colour shows off the tile shape, which suits subway tiles and patterns. Mid greys and beiges hide everyday marks on floors better than bright white." },
  { q: "Should I use grout in the corners?", a: "No. Where walls meet, where a wall meets the floor, around the bath and where the splashback meets the benchtop, use a flexible silicone sealant. These joints move, and grout there will crack." },
  { q: "Can I use these in cold or hot weather?", a: "Working times in the data sheets are at 21°C. Cold slows everything down (Multimastic should not be used below 7°C, and needs an extra 24 to 48 hours before grouting below 15°C). Heat speeds everything up: SPECTRALOCK's working time drops to about 30 minutes at 35°C. 335 RAPID suits cold weather." },
  { q: "Can epoxy grout be used on natural stone?", a: "Test first. LATICRETE warns epoxy can change the colour of white or porous stone such as Carrara, and can scratch soft polished marble. PERMACOLOR Select is often the safer choice on stone, after sealing the stone." },
  { q: "Is it safe to use?", a: "Cement powders are alkaline and dusty, so wear gloves, eye protection and a dust mask when mixing. SPECTRALOCK's liquids are labelled corrosive: wear gloves and eye protection and read the label. Each product's Safety Data Sheet is available from LATICRETE." },
  { q: "Can I pick it up today?", a: "Ask us first. We will confirm availability and lead times for your products and grout colours before you come in. 335 RAPID, 257 TITANIUM and MVIS are special-order products." },
  { q: "How much do they cost?", a: "Prices are on request for now. Add the products to your quote with your area and we will send a price with the quantities worked out." },
  { q: "Is there a warranty?", a: "LATICRETE offers system warranties when their products are used together and installed to their instructions. Ask us or your installer for the details for your job." },
];

const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)", margin: 0 };
const big: React.CSSProperties = { fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(34px,5vw,58px)", letterSpacing: "-.03em", lineHeight: 1, margin: "10px 0 16px" };
const mid: React.CSSProperties = { ...big, fontSize: "clamp(28px,4vw,44px)" };
const it: React.CSSProperties = { fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400 };
const body: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.7, color: "#3a444a", maxWidth: "66ch", margin: "0 0 22px" };
const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", margin: "0 0 6px" };

function ProfileCard({ p, swatches }: { p: Profile; swatches?: string[] }) {
  return (
    <article className="ag-card" id={p.slug}>
      <div className="ag-card-head">
        <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 26, margin: 0 }}>
          <Link href={`/product/${p.slug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{p.name}</Link>
        </h3>
        <span style={{ ...label, color: "var(--accent)", margin: 0, whiteSpace: "nowrap" }}>{p.rating}{p.status ? ` · ${p.status}` : ""}</span>
      </div>
      <p className="ag-p" style={{ fontSize: 16, margin: "8px 0 16px", maxWidth: "75ch" }}>{p.what}</p>
      {swatches && swatches.length > 0 && <div className="ag-strip" aria-hidden>{swatches.map((h, i) => <span key={i} style={{ background: h }} />)}</div>}
      <div className="ag-prof">
        <div>
          <p style={{ ...label, color: "var(--accent)" }}>Pack and colour</p>
          <p className="ag-p">{p.pack}. {p.kind === "grout" ? `${p.colours} colours` : p.colours}.</p>
          <p style={{ ...label, color: "var(--accent)", marginTop: 14 }}>{p.kind === "grout" ? "Coverage per pack" : "Coverage per pack (trowel at 45°)"}</p>
          <dl className="ag-kv">{p.coverage.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <p style={{ ...label, color: "var(--accent)", marginTop: 14 }}>Mixing</p>
          <p className="ag-p">{p.mix}</p>
        </div>
        <div>
          <p style={{ ...label, color: "var(--accent)" }}>Times (at 21°C)</p>
          <dl className="ag-kv">{p.times.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {p.onto && <><p style={{ ...label, color: "var(--accent)", marginTop: 14 }}>Tile onto</p><p className="ag-p">{p.onto}</p></>}
        </div>
        <div>
          <p style={{ ...label, color: "#2f6f73" }}>Use it for</p>
          <ul className="ag-ul">{p.useFor.map((x) => <li key={x}>{x}</li>)}</ul>
          <p style={{ ...label, color: "#a5543a", marginTop: 14 }}>Not for</p>
          <ul className="ag-ul">{p.notFor.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
      <p style={{ margin: "16px 0 0", fontSize: 13.5, fontWeight: 700 }}>
        <Link href={`/product/${p.slug}`} style={{ color: "var(--accent)" }}>View product →</Link>
        <span style={{ margin: "0 10px", color: "#c9bfb2" }}>|</span>
        <a href={p.dataSheet} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>LATICRETE data sheet (PDF)</a>
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

function Steps({ title, steps }: { title: React.ReactNode; steps: string[][] }) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22, margin: "0 0 12px" }}>{title}</h3>
      <ol className="ag-steps">
        {steps.map(([h, t]) => <li key={h}><strong>{h}.</strong> {t}</li>)}
      </ol>
    </div>
  );
}

export default async function AdhesiveGroutGuide() {
  let ranges: WebsiteRange[] = [];
  try { ranges = await listRanges({ department: "adhesives" }); } catch { /* guide still renders */ }
  const hexes = (slug: string) => ranges.find((r) => r.slug === slug)?.swatches.map((s) => s.swatchHex).filter((h): h is string => !!h) ?? [];

  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const ld = (o: object) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, "\\u003c") }} />;
  const jump: [string, string][] = [["#picker", "Find yours"], ["#quick-picks", "Quick picks"], ["#adhesives", "Adhesives"], ["#grout", "Grout"], ["#onto", "Tile onto"], ["#how-to", "Step by step"], ["#ratings", "Ratings"], ["#whole-job", "The whole job"], ["#faq", "Questions"]];

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {ld(faqLd)}
      <MarketingNav />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(96px,16vw,150px) 28px 90px" }}>
        <nav style={{ fontSize: 13, color: "#8a8577", marginBottom: 14 }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/shop/adhesives" style={{ color: "inherit", textDecoration: "none" }}>Tiling Supplies</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>LATICRETE guide</span>
        </nav>

        <div className="ag-hero">
          <div>
            <p style={eyebrow}>LATICRETE adhesives & grout · the complete guide</p>
            <h1 style={big}>What goes <span style={it}>behind and between</span></h1>
            <p style={body}>
              Every tile looks good on day one. Whether it still looks good in year ten comes down to the adhesive behind it and the grout between it. We carry LATICRETE, one of the world&apos;s leading tile installation brands, with its Australian base in Brisbane. This page covers every adhesive and grout we sell: what each one is for, what it is not for, how much you need, how to use it, and the answers to the questions we get asked most.
            </p>
            <div className="ag-jump">{jump.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</div>
            <div className="ag-calcs">
              <Link href="/adhesive-calculator">Adhesive calculator →</Link>
              <Link href="/grout-calculator">Grout calculator →</Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/laticrete/range-pool.webp" alt="The LATICRETE adhesive and grout range lined up on a pool terrace" className="ag-hero-img" />
        </div>

        {/* PICKER */}
        <section className="ag-dark" id="picker">
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 30, margin: "0 0 6px", color: "#fff" }}>Find the right <span style={{ ...it, color: "#cfe3e1" }}>adhesive and grout</span></h2>
          <p style={{ margin: "0 0 22px", color: "#cfe3e1", fontSize: 15.5 }}>Answer three questions and we will tell you what to use, which trowel, and how many bags.</p>
          <Picker />
        </section>

        {/* QUICK PICKS */}
        <section style={{ marginTop: 56 }} id="quick-picks">
          <p style={eyebrow}>At a glance</p>
          <h2 style={mid}>Quick picks <span style={it}>by job</span></h2>
          <div className="ag-picks">
            {PICKS.map(([job, pick]) => (
              <div key={job} className="ag-pick">
                <p style={{ ...label, color: "var(--accent)" }}>{job}</p>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#3a444a" }}>{pick}</p>
              </div>
            ))}
          </div>
          <blockquote style={{ ...it, fontSize: 24, lineHeight: 1.35, color: "#2f6f73", borderTop: "3px solid var(--accent)", margin: "28px 0 0", padding: "18px 0 0", maxWidth: 760 }}>
            &ldquo;If in doubt, choose 335 and a PERMACOLOR grout. If it is big, outside or under water, step up to 254.&rdquo;
          </blockquote>
        </section>

        {/* ADHESIVES */}
        <section style={{ marginTop: 64 }} id="adhesives">
          <p style={eyebrow}>01 / Adhesive · every product in full</p>
          <h2 style={big}>Know your <span style={it}>adhesive</span></h2>
          <p style={body}>The first four cover almost every home job. The last three are specialist products, ordered in for your job.</p>
          <div className="ag-cards">{ADHESIVE_PROFILES.map((p) => <ProfileCard key={p.slug} p={p} />)}</div>
        </section>

        <section style={{ marginTop: 56 }}>
          <p style={{ ...body, fontSize: 15.5 }}>Work out how many bags you need with our <Link href="/adhesive-calculator" style={{ color: "var(--accent)", fontWeight: 700 }}>adhesive calculator</Link>, built on LATICRETE&apos;s own coverage formulas.</p>
          <p style={eyebrow}>01 / Adhesive · side by side</p>
          <h2 style={mid}>Which adhesive <span style={it}>suits you?</span></h2>
          <Table head={["Adhesive", "Rating", "Pack", "Covers (10 mm notch)", "Outdoors", "Pools", "Over old tiles", "Best for"]} rows={ADH_TABLE} />
          <p style={{ fontSize: 13, color: "#8a8577", margin: "10px 0 0" }}>* Multimastic coverage is per 4 L pail with a 6 mm notch. &ldquo;Not stated&rdquo; means LATICRETE&apos;s data sheet does not cover it, so ask us first.</p>
        </section>

        {/* GROUT */}
        <section style={{ marginTop: 64 }} id="grout">
          <p style={eyebrow}>02 / Grout · every product in full</p>
          <h2 style={big}>Know your <span style={it}>grout</span></h2>
          <p style={body}>Every current LATICRETE grout colour is available. Ask us about lead times for the colour you need, and come in to see real colour samples.</p>
          <div className="ag-cards">
            {GROUT_PROFILES.map((p) => <ProfileCard key={p.slug} p={p} swatches={hexes(p.slug)} />)}
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <p style={{ ...body, fontSize: 15.5 }}>Work out exactly how much you need for your tile and joint with our <Link href="/grout-calculator" style={{ color: "var(--accent)", fontWeight: 700 }}>grout calculator</Link>, built on LATICRETE&apos;s own coverage formulas.</p>
          <p style={eyebrow}>02 / Grout · side by side</p>
          <h2 style={mid}>Which grout <span style={it}>suits you?</span></h2>
          <Table head={["Grout", "Type", "Stains", "Sealing", "Colours", "Pack", "Best for"]} rows={GROUT_TABLE} />
        </section>

        <section className="ag-split" style={{ marginTop: 56 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Choosing a <span style={it}>grout colour</span></h2>
            <ul className="ag-ul" style={{ fontSize: 15.5 }}>
              <li><strong>Match the tile</strong> for a calm, seamless look that makes a room feel bigger and hides small imperfections.</li>
              <li><strong>Contrast the tile</strong> to show off its shape: subway tiles, herringbone and patterns.</li>
              <li><strong>Floors</strong> stay looking cleaner in mid greys and warm beiges than in bright white.</li>
              <li><strong>Natural stone</strong> usually suits a grout close to its background colour.</li>
              <li><strong>Always check a real sample</strong> against your tile. Screens are only a guide, and grout can dry slightly lighter or darker.</li>
            </ul>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Silicone, <span style={it}>not grout</span></h2>
            <p style={{ ...body, fontSize: 15.5 }}>Some joints move: where two walls meet, where a wall meets the floor, around the bath and shower base, where the splashback meets the benchtop, and the movement joints in big floors. Grout there will crack. Fill them with a flexible silicone sealant in a colour that matches your grout, and leave the surrounding grout to cure first.</p>
          </div>
        </section>

        {/* TILE ONTO */}
        <section style={{ marginTop: 64 }} id="onto">
          <p style={eyebrow}>03 / Surfaces</p>
          <h2 style={mid}>What can I <span style={it}>tile onto?</span></h2>
          <p style={body}>From LATICRETE&apos;s data sheets for the four everyday adhesives. Whatever the surface, it must be sound, clean, flat and dry, and wet areas must be waterproofed first.</p>
          <Table head={["Surface", "335", "254", "TRI-LITE", "Multimastic"]} rows={ONTO.map(([s, v]) => [s, ...v])} />
        </section>

        {/* HOW TO */}
        <section style={{ marginTop: 64 }} id="how-to">
          <p style={eyebrow}>04 / Step by step</p>
          <h2 style={big}>Getting it <span style={it}>right</span></h2>
          <div className="ag-steps-grid">
            <Steps title={<>Laying tiles <span style={it}>with adhesive</span></>} steps={STEPS_LAY} />
            <div>
              <Steps title={<>Grouting <span style={it}>with cement grout</span></>} steps={STEPS_CEMENT} />
              <div style={{ height: 28 }} />
              <Steps title={<>Grouting <span style={it}>with epoxy</span></>} steps={STEPS_EPOXY} />
            </div>
          </div>
        </section>

        {/* RATINGS + WEATHER */}
        <section className="ag-split" style={{ marginTop: 64 }} id="ratings">
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Ratings <span style={it}>decoded</span></h2>
            <p style={{ ...body, fontSize: 15.5 }}>Every bag carries an Australian Standard rating (AS ISO 13007). Read it left to right: C2TES1 is an improved cement adhesive, slip resistant, with extended open time and some flexibility.</p>
            <dl className="ag-decode">
              {DECODE.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 14px" }}>Weather <span style={it}>and timing</span></h2>
            <ul className="ag-ul" style={{ fontSize: 15.5 }}>
              <li>All times on this page are at 21°C. Cold slows adhesives and grouts down; heat speeds them up.</li>
              <li>On hot days, work in the shade or the cooler part of the day, mix smaller batches and keep tiles and bags out of the sun.</li>
              <li>In cold weather, allow longer before grouting. Do not use Multimastic below 7°C. 335 RAPID is made for cold weather.</li>
              <li>Keep rain off fresh outdoor work until the grout has set.</li>
              <li>Pools and steam rooms: 14 days after grouting with cement grout and 254, 10 days with SPECTRALOCK PRO.</li>
              <li>Store bags off the ground in a dry place. Unopened Multimastic keeps for 2 years.</li>
            </ul>
          </div>
        </section>

        {/* THE WHOLE JOB */}
        <section style={{ marginTop: 64 }} id="whole-job">
          <p style={eyebrow}>05 / The whole job</p>
          <h2 style={mid}>From bare floor <span style={it}>to handover</span></h2>
          <p style={body}>Adhesive and grout are two of the six steps. This is the order a tiled bathroom goes in, and what we carry for each step.</p>
          <ol className="ag-job">
            {JOB.map(([n, h, t, href]) => (
              <li key={n}>
                <span className="ag-job-n">{n}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{t}</p>
                  <Link href={href}>Shop {h.toLowerCase()} →</Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {ranges.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 18px" }}>Shop adhesive <span style={it}>& grout</span></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {ranges.filter((r) => r.categories.some((c) => c === "adhesives" || c === "grout")).map((r) => <RangeCard key={r.id} range={r} />)}
            </div>
          </section>
        )}

        <section style={{ marginTop: 64 }} id="faq">
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 28, margin: "0 0 12px" }}>Your questions, <span style={it}>answered</span></h2>
          <div style={{ maxWidth: 860 }}>
            {FAQS.map((f, i) => (
              <details key={i} className="ow-faq" style={{ borderBottom: "1px solid var(--line)" }}>
                <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 2px", fontFamily: "var(--font-archivo)", fontWeight: 700, fontSize: 17.5, lineHeight: 1.35 }}>
                  {f.q}
                  <span className="ow-faq-plus" aria-hidden style={{ flexShrink: 0, fontSize: 24, lineHeight: 1, color: "var(--accent)", transition: "transform .2s ease" }}>+</span>
                </summary>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444a", margin: "0 0 18px", maxWidth: "72ch" }}>{f.a}</p>
              </details>
            ))}
          </div>
          <div className="ag-cta">
            <p style={{ margin: 0, fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22 }}>Still not sure?</p>
            <p style={{ margin: "6px 0 14px", color: "#3a444a" }}>Bring your tile in, or tell us about the job. We will pick the adhesive and grout, work out the quantities and show you real grout colours.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/book" className="ag-btn ag-btn-dark">Book a visit</Link>
              <Link href="/contact" className="ag-btn">Ask us a question</Link>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#8a8577", marginTop: 26, maxWidth: "80ch" }}>
            Product facts from LATICRETE Australia product pages and data sheets (2026). This guide is general advice; your installer and the LATICRETE data sheet for your product have the final say for your job. Data sheets can change, so always use the latest version, linked on every product.
          </p>
        </section>

        <style>{`
          .ow-faq > summary::-webkit-details-marker { display: none; }
          .ow-faq[open] .ow-faq-plus { transform: rotate(45deg); }
          .ag-hero { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: center; }
          .ag-hero-img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 22px; border: 1px solid var(--line); display: block; }
          .ag-jump { display: flex; flex-wrap: wrap; gap: 8px; }
          .ag-jump a { padding: 8px 14px; border-radius: 99px; border: 1px solid var(--line); background: #fff; color: var(--ink); text-decoration: none; font-size: 13.5px; font-weight: 700; }
          .ag-jump a:hover { border-color: var(--accent); color: var(--accent); }
          .ag-calcs { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
          .ag-calcs a { padding: 11px 18px; border-radius: 99px; background: var(--ink); color: #fff; text-decoration: none; font-size: 14px; font-weight: 700; }
          .ag-dark { background: #17262d; border-radius: 22px; padding: clamp(24px,4vw,40px); margin-top: 44px; scroll-margin-top: 90px; }
          .ag-chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .ag-result { margin-top: 26px; padding-top: 22px; border-top: 1px solid #2c4048; }
          .ag-result-grid { display: grid; grid-template-columns: 1fr; gap: 22px; }
          .ag-res-name { display: inline-block; font-family: var(--font-archivo); font-weight: 800; font-size: 21px; color: #fff; text-decoration: underline; text-decoration-color: var(--accent); text-underline-offset: 4px; margin-bottom: 4px; }
          .ag-res-p { margin: 4px 0 0; color: #d7e2e0; font-size: 14.5px; line-height: 1.55; }
          .ag-picks { display: grid; grid-template-columns: 1fr; gap: 0 40px; border-top: 2px solid var(--ink); }
          .ag-pick { padding: 16px 0; border-bottom: 1px solid var(--line); }
          .ag-cards { display: grid; grid-template-columns: 1fr; gap: 0; border-top: 2px solid var(--ink); }
          .ag-card { padding: 28px 0; border-bottom: 1px solid var(--line); min-width: 0; scroll-margin-top: 90px; }
          .ag-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
          .ag-prof { display: grid; grid-template-columns: 1fr; gap: 18px; }
          .ag-p { margin: 0; font-size: 15px; line-height: 1.6; color: #3a444a; }
          .ag-ul { margin: 0; padding-left: 18px; list-style: disc; font-size: 15px; line-height: 1.6; color: #3a444a; }
          .ag-ul li { margin-bottom: 4px; }
          .ag-kv { margin: 0; }
          .ag-kv div { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed var(--line); font-size: 14.5px; }
          .ag-kv dt { color: #6b746f; }
          .ag-kv dd { margin: 0; font-weight: 700; color: var(--ink); text-align: right; }
          .ag-strip { display: flex; height: 26px; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin: 0 0 18px; }
          .ag-strip span { flex: 1; }
          .ag-table-wrap { overflow-x: auto; margin-top: 10px; }
          .ag-table { width: 100%; min-width: 700px; border-collapse: collapse; font-size: 15px; }
          .ag-table thead th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); padding: 10px 12px 10px 0; border-bottom: 2px solid var(--ink); }
          .ag-table tbody th { text-align: left; font-family: var(--font-archivo); font-weight: 800; padding: 14px 12px 14px 0; border-bottom: 1px solid var(--line); white-space: nowrap; }
          .ag-table td { padding: 14px 12px 14px 0; border-bottom: 1px solid var(--line); color: #3a444a; }
          .ag-split { display: grid; grid-template-columns: 1fr; gap: 44px; scroll-margin-top: 90px; }
          .ag-steps-grid { display: grid; grid-template-columns: 1fr; gap: 36px; }
          .ag-job { list-style: none; margin: 22px 0 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 14px; }
          .ag-job li { display: flex; gap: 16px; align-items: flex-start; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
          .ag-job-n { font-family: var(--font-archivo); font-weight: 800; font-size: 22px; color: var(--accent); line-height: 1; min-width: 32px; }
          .ag-job h3 { font-family: var(--font-archivo); font-weight: 800; font-size: 18px; margin: 0 0 6px; }
          .ag-job p { margin: 0 0 8px; font-size: 14.5px; line-height: 1.6; color: #3a444a; }
          .ag-job a { color: var(--accent); font-weight: 700; font-size: 14px; text-decoration: none; }
          @media (min-width: 760px) { .ag-job { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1080px) { .ag-job { grid-template-columns: 1fr 1fr 1fr; } }
          .ag-steps { margin: 0; padding-left: 22px; list-style: decimal; font-size: 15.5px; line-height: 1.65; color: #3a444a; }
          .ag-steps li { margin-bottom: 10px; padding-left: 4px; }
          .ag-steps li::marker { font-family: var(--font-archivo); font-weight: 800; color: var(--accent); }
          .ag-decode { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin: 0; }
          .ag-decode div { display: flex; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--line); }
          .ag-decode dt { font-family: var(--font-archivo); font-weight: 800; min-width: 56px; color: var(--accent); }
          .ag-decode dd { margin: 0; font-size: 14px; color: #3a444a; }
          .ag-cta { margin-top: 34px; padding: 24px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); max-width: 860px; }
          .ag-btn { display: inline-block; padding: 12px 22px; border-radius: 99px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-weight: 700; font-size: 15px; text-decoration: none; }
          .ag-btn-dark { background: var(--ink); color: #fff; border-color: var(--ink); }
          section[id] { scroll-margin-top: 90px; }
          @media (min-width: 760px) {
            .ag-picks { grid-template-columns: 1fr 1fr; }
            .ag-result-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
            .ag-prof { grid-template-columns: 1fr 1fr; gap: 28px; }
          }
          @media (min-width: 1000px) {
            .ag-hero { grid-template-columns: 1.1fr 1fr; gap: 48px; }
            .ag-prof { grid-template-columns: 1.1fr 1fr 1fr; gap: 32px; }
            .ag-split { grid-template-columns: 1fr 1fr; gap: 64px; }
            .ag-steps-grid { grid-template-columns: 1fr 1fr; gap: 56px; }
          }
          @media (max-width: 520px) { .ag-decode { grid-template-columns: 1fr; } }
        `}</style>
      </main>
      <MarketingFooter />
    </div>
  );
}
