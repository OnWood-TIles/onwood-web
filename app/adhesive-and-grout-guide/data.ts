// LATICRETE adhesive + grout facts for the guide page and its picker. Every figure is from
// LATICRETE Australia's product pages and data sheets (onbase/scripts/laticrete/laticrete-au-research.md,
// keys like DS-1037). General trade practice (trowel sizes by tile size) is marked as a guide.

const DS = "https://cdn-global.laticrete.com/-/media/project/laticrete-international/australia/product-documents/pds";

export type Notch = 6 | 8 | 10 | 12;
export type Profile = {
  slug: string;
  name: string;
  short: string;
  kind: "adhesive" | "grout";
  status: string;
  rating: string;
  what: string;
  pack: string;
  colours: string;
  coverage: [string, string][]; // [label, m² per pack]
  perNotch?: Partial<Record<Notch, [number, number]>>; // m² per pack, for the calculator
  mix: string;
  times: [string, string][];
  useFor: string[];
  notFor: string[];
  onto?: string;
  dataSheet: string;
};

export const ADHESIVE_PROFILES: Profile[] = [
  {
    slug: "laticrete-335-premium-flexible-adhesive", name: "LATICRETE 335 Premium Flexible", short: "335", kind: "adhesive",
    status: "Stocked in our Baringa showroom", rating: "C2TES1",
    what: "A premium, flexible cement adhesive for porcelain, ceramic, glass and natural stone, on floors and walls, inside and out. It is high tack and non-sag, rated for wet areas, pools and tiling over existing tiles. This is the one most jobs need.",
    pack: "20 kg bag", colours: "White (Off-White can be ordered in)",
    coverage: [["6 x 6 mm notch", "7 to 8 m²"], ["10 x 10 mm notch", "4 to 5 m²"]],
    perNotch: { 6: [7, 8], 10: [4, 5] },
    mix: "5 to 5.5 litres of clean water per 20 kg bag.",
    times: [["Open time", "30 minutes"], ["Pot life", "4 hours"], ["Light foot traffic", "18 hours"], ["Grout after", "24 hours minimum"]],
    useFor: ["Porcelain, ceramic, glass and natural stone", "Floors and walls, inside and outside", "Bathrooms, showers, laundries and pools", "Tiling over existing tiles that are sound and well bonded"],
    notFor: ["Very large or thin porcelain on balconies, outdoor slabs and pools: step up to 254 for more flexibility", "Jobs that must be grouted the same day: use 335 RAPID"],
    onto: "Concrete, masonry, mortar beds, cement render, brick, terrazzo, cement sheet, suitable waterproofing membranes, existing ceramic tile and stone, and plasterboard (inside only).",
    dataSheet: `${DS}/ds-1037-0626-335.pdf`,
  },
  {
    slug: "laticrete-254-premium-adhesive", name: "LATICRETE 254 Premium", short: "254", kind: "adhesive",
    status: "Stocked in our Baringa showroom", rating: "C2TES2P2",
    what: "LATICRETE's highest rated cement adhesive (formerly 254 Platinum). The S2 rating means it is highly deformable, so it copes with the movement that large format tiles, thin porcelain, sun-baked outdoor areas, balconies and pools put on an adhesive.",
    pack: "20 kg bag", colours: "White",
    coverage: [["6 x 6 mm notch", "7.5 to 8.5 m²"], ["10 x 10 mm notch", "4.5 to 5.5 m²"]],
    perNotch: { 6: [7.5, 8.5], 10: [4.5, 5.5] },
    mix: "4.6 to 5.2 litres of clean water per 20 kg bag.",
    times: [["Open time", "30 minutes"], ["Pot life", "3 hours"], ["Heavy traffic", "24 hours"], ["Grout after", "24 hours minimum"], ["Fill pools", "14 days after grouting"]],
    useFor: ["Large format tiles and thin (reduced thickness) porcelain", "Outdoor areas, alfrescos, balconies and pool surrounds", "Inside pools and water features (underwater)", "Natural stone, quarry tile, pavers, brick and glass", "Tiling over existing tiles"],
    notFor: ["Stone cladding and stacked stone: use MVIS Veneer Mortar", "It costs more than 335, so most indoor jobs with normal-size tiles do not need it"],
    onto: "Everything 335 goes onto, plus (inside only) plastic laminate, prepared vinyl, cut-back adhesive residue and exterior-grade plywood.",
    dataSheet: `${DS}/ds-1166-0826-254.pdf`,
  },
  {
    slug: "laticrete-tri-lite-lightweight-adhesive", name: "LATICRETE TRI-LITE Lightweight", short: "TRI-LITE", kind: "adhesive",
    status: "Stocked in our Baringa showroom", rating: "C2TES1",
    what: "A lightweight, sand-free adhesive: an 11 kg bag covers about the same area as a 20 kg bag of standard adhesive. It has excellent sag resistance, so big, heavy tiles stay put on walls, and it is easier to carry, mix and spread.",
    pack: "11 kg bag (covers like 20 kg)", colours: "White",
    coverage: [["6 x 6 mm notch", "6.5 to 7 m²"], ["10 x 10 mm notch", "3.9 to 4.4 m²"], ["12 x 12 mm notch", "3.2 to 3.7 m²"]],
    perNotch: { 6: [6.5, 7], 10: [3.9, 4.4], 12: [3.2, 3.7] },
    mix: "5 to 5.5 litres of clean water per 11 kg bag.",
    times: [["Open time", "30 minutes"], ["Pot life", "2 to 4 hours"], ["Light foot traffic", "24 hours (tiles under 600 x 600)"], ["Grout after", "24 hours minimum, longer for large format"]],
    useFor: ["Walls, including big format tiles on bathroom and feature walls", "Porcelain splashbacks", "Floors, inside and outside", "Pools (immersed)"],
    notFor: ["Very small jobs: one bag covers 4 to 7 m², more than most splashbacks need"],
    onto: "Waterproofing membranes, existing ceramic tile and stone, LATICRETE STRATA_MAT, concrete and cement surfaces, and plasterboard (inside only).",
    dataSheet: `${DS}/ds-1295-0226-tri-lite.pdf`,
  },
  {
    slug: "laticrete-multimastic-premium-ready-to-use-adhesive", name: "LATICRETE Multimastic Premium", short: "Multimastic", kind: "adhesive",
    status: "Stocked in our Baringa showroom", rating: "D1TE",
    what: "A ready-to-use adhesive straight from the pail: no mixing, no dust, no waste. Its non-slump formula holds wall tiles without spacers. Made for ceramic tile and natural stone in dry areas inside the home, which makes the 4 L pail ideal for a kitchen splashback.",
    pack: "4 L pail (15 L pail to order)", colours: "White",
    coverage: [["4 L pail, 6 x 6 mm notch", "1.8 to 2.1 m²"], ["4 L pail, 8 x 8 mm notch", "1.3 to 1.6 m²"], ["15 L pail, 6 x 6 mm notch", "7 to 8 m²"]],
    perNotch: { 6: [1.8, 2.1], 8: [1.3, 1.6] },
    mix: "None. Stir and use.",
    times: [["Open time", "45 minutes"], ["Working life", "6 hours"], ["Grout after", "24 hours at 21°C, add 24 to 48 hours below 15°C"], ["Do not use below", "7°C"], ["Shelf life", "2 years unopened"]],
    useFor: ["Kitchen splashbacks and dry feature walls", "Ceramic tile and natural stone, inside the home", "Small jobs where mixing a bag is overkill"],
    notFor: ["Showers, wet areas with constant water, pools, steam rooms or outdoors", "Large, dense porcelain: it dries very slowly (or not at all) under it. Use TRI-LITE", "Glass tiles (not listed by LATICRETE for this product)", "Over waterproofing membranes, unless the tile is absorbent", "Heavy-duty floors and lug-back floor tiles", "Green marble"],
    onto: "Inside only: concrete, masonry, render and plaster, plasterboard, cement sheet, exterior-grade plywood and suitable waterproofing membranes (absorbent tiles only over membranes).",
    dataSheet: `${DS}/ds-1055-0626-multimastic.pdf`,
  },
  {
    slug: "laticrete-335-rapid-adhesive", name: "LATICRETE 335 RAPID", short: "335 RAPID", kind: "adhesive",
    status: "Special order, ordered in for you", rating: "C2TFS1",
    what: "The fast-setting version of 335. Grout and walk on it after about 4 hours, so a floor can be tiled and grouted in one day. It also suits cold weather, when standard adhesives are slow.",
    pack: "20 kg bag", colours: "Grey or White",
    coverage: [["6 x 6 mm notch", "7 to 8 m²"], ["10 x 10 mm notch", "4 to 5 m²"]],
    perNotch: { 6: [7, 8], 10: [4, 5] },
    mix: "About 5.2 litres of clean water per 20 kg bag. Mix small batches.",
    times: [["Open time", "Over 15 minutes"], ["Pot life", "Over 40 minutes"], ["Light foot traffic", "4 hours"], ["Grout after", "4 hours minimum"]],
    useFor: ["Jobs that must be finished in a day: shops, cafes, rentals, the only bathroom in the house", "Cold weather tiling", "Porcelain and glass, inside and out, including pools"],
    notFor: ["Big areas laid slowly: the shorter working time means you must keep moving"],
    dataSheet: `${DS}/ds-1002-0626-335r.pdf`,
  },
  {
    slug: "laticrete-257-titanium-adhesive", name: "LATICRETE 257 TITANIUM", short: "257 TITANIUM", kind: "adhesive",
    status: "Special order, ordered in for you", rating: "C2TES2",
    what: "A premium lightweight adhesive for the hardest jobs: thin porcelain panels and slabs, glass tiles and glass mosaics. It can be tinted with a PERMACOLOR Select colour kit so the adhesive behind see-through glass matches the grout.",
    pack: "11 kg bag (covers like 20 kg)", colours: "White, tintable",
    coverage: [["6 x 6 mm notch", "7 to 8 m²"], ["10 x 10 mm notch", "4.5 to 5.5 m²"], ["12 x 12 mm notch", "4 to 5 m²"]],
    perNotch: { 6: [7, 8], 10: [4.5, 5.5], 12: [4, 5] },
    mix: "4.75 to 5 litres of clean water per 11 kg bag.",
    times: [["Open time", "Over 45 minutes"], ["Pot life", "2 to 4 hours"], ["Light foot traffic", "24 hours (tiles under 600 x 600)"]],
    useFor: ["Large porcelain panels and slabs (gauged porcelain)", "Glass tiles and glass mosaics, including clear and translucent glass", "Ceramic and stone, inside, outside and in pools"],
    notFor: ["Everyday jobs: 335 or TRI-LITE do those for less"],
    dataSheet: `${DS}/ds-1278-0926-257-titanium.pdf`,
  },
  {
    slug: "laticrete-mvis-veneer-mortar", name: "LATICRETE MVIS Veneer Mortar", short: "MVIS", kind: "adhesive",
    status: "Special order, ordered in for you", rating: "C2TS1",
    what: "A polymer-fortified mortar made for adhered stone veneer, manufactured stone and thin brick: the right match for our stone cladding range. It is non-sag, so heavy pieces stay put on the wall.",
    pack: "20 kg bag", colours: "Grey",
    coverage: [["6 x 9 mm notch", "5.5 to 6.2 m²"], ["12 x 12 mm notch", "4 to 4.5 m²"], ["Adhered veneer method (back-buttered)", "2.75 to 3.25 m²"]],
    perNotch: { 12: [4, 4.5] },
    mix: "4.2 to 6 litres of clean water per 20 kg bag.",
    times: [["Open time", "30 minutes"], ["Pot life", "3 hours"], ["Light traffic", "8 to 10 hours"]],
    useFor: ["Stone cladding and stacked stone panels", "Natural and manufactured stone veneer, thin brick", "Walls, inside and outside"],
    notFor: ["Floor tiles: use 335 or 254"],
    dataSheet: `${DS}/ds-1076-0626-masonry-veneer-mortar.pdf`,
  },
];

export const GROUT_PROFILES: Profile[] = [
  {
    slug: "laticrete-permacolor-select-grout", name: "LATICRETE PERMACOLOR Select", short: "PERMACOLOR Select", kind: "grout",
    status: "All 40 colours available", rating: "CG2FAW",
    what: "A fast-setting, fibre-reinforced cement grout made from a 5 kg base and a separate colour kit. Because the colour comes in its own measured kit, the colour is consistent from bag to bag. It needs no sealing, resists stains better than standard cement grout and has built-in mould and mildew protection.",
    pack: "5 kg base + 100 g colour kit (you need one of each)", colours: "40",
    coverage: [["Coverage", "Depends on tile size and joint width. Tell us your tile and area and we will work it out."]],
    mix: "0.95 to 1.05 litres of clean water and one colour kit per 5 kg base. Always add the whole colour kit.",
    times: [["Pot life", "45 to 60 minutes"], ["Final set", "3 to 4 hours"], ["Foot traffic", "6 hours"], ["Pools and steam rooms", "Cure 14 days first"]],
    useFor: ["Most bathrooms, floors and walls", "Joints from 1.5 to 12 mm", "Inside and outside, wet areas, pools and fountains", "Glass tile and re-grouting"],
    notFor: ["Kitchen splashbacks and shower floors where you want truly stain-proof grout: choose SPECTRALOCK PRO", "Joints wider than 12 mm"],
    dataSheet: `${DS}/ds-1162-0624-pcs-aus-5kg.pdf`,
  },
  {
    slug: "laticrete-permacolor-grout-new-improved", name: "LATICRETE PERMACOLOR Grout (New & Improved)", short: "PERMACOLOR N&I", kind: "grout",
    status: "Ordered in for you", rating: "CG2WAF",
    what: "LATICRETE's pre-coloured cement grout: just add water. It comes in a 10 kg bag in 20 colours, good value for big floors, outdoor areas and trade jobs. Anti-microbial, with improved stain resistance for a cement grout.",
    pack: "10 kg bag", colours: "20",
    coverage: [["300 x 300 tile, 3 mm joint", "About 35.6 m²"], ["600 x 600 tile, 3 mm joint", "About 70.7 m²"], ["100 x 100 tile, 3 mm joint", "About 13.8 m²"], ["50 x 50 mosaic, 3 mm joint", "About 9.6 m²"]],
    mix: "1.9 to 2.1 litres of clean water per 10 kg bag.",
    times: [["Pot life", "50 minutes"], ["Final set", "3 hours"], ["Foot traffic", "6 hours"], ["Sealing (optional)", "Wait 72 hours"]],
    useFor: ["Large floors and outdoor areas", "Joints from 1.5 to 12 mm", "Floors and walls, inside and outside, pools and glass tile"],
    notFor: ["Mixing with the old PERMACOLOR on the same job: the colours can differ slightly", "Small jobs: a 5 kg PERMACOLOR Select base is better sized"],
    dataSheet: `${DS}/ds-1307-0926-ni-permacolor.pdf`,
  },
  {
    slug: "laticrete-spectralock-pro-epoxy-grout-full", name: "LATICRETE SPECTRALOCK PRO Premium Grout", short: "SPECTRALOCK PRO", kind: "grout",
    status: "Ordered in for you", rating: "RG",
    what: "An epoxy grout: two liquids (Parts A and B) plus a colour powder (Part C). Once cured it is stain-proof in the home and never needs sealing, so it is the grout to choose for kitchen splashbacks, shower floors, pools and anywhere you want the grout to stay the colour you chose. It comes in two sizes: the Mini unit (0.7 L) and the Full unit (3 L).",
    pack: "Mini unit 0.7 L · Full unit 3 L", colours: "Mini 34 · Full 40",
    coverage: [["Full unit: 300 x 300 tile, 3 mm joint", "About 16.7 m²"], ["Full unit: 600 x 600 tile, 3 mm joint", "About 33 m²"], ["Full unit: 50 x 50 mosaic, 3 mm joint", "About 4.5 m²"], ["Mini unit: 300 x 300 tile, 3 mm joint", "About 4.2 m²"], ["Mini unit: 75 x 300 subway, 2 to 3 mm joint", "About 1.9 to 2.9 m²"], ["Mini unit: 50 x 50 mosaic, 3 mm joint", "About 1 m²"]],
    mix: "Mix all of Part A and Part B, then add all of Part C. No water.",
    times: [["Working time", "80 min at 21°C (120 min at 4°C, 30 min at 35°C)"], ["Light foot traffic", "12 hours at 21°C"], ["Heavy traffic", "24 hours at 21°C"], ["Full stain resistance", "7 days at 21°C"], ["Pools and steam rooms", "Cure 10 days first"]],
    useFor: ["Kitchen splashbacks and benchtops", "Shower floors and wet areas", "Pools and fountains", "Ceramic, porcelain, glass and stone, inside and out, joints 1.5 to 12 mm"],
    notFor: ["White or porous stone such as Carrara without testing first: epoxy can change its colour", "Soft polished marble, delicate glazes or glass that scratch easily: test first", "Joints under 3 mm finish a little coarser (it is a sanded grout)"],
    dataSheet: `${DS}/ds-1191-0626-sppg-pds.pdf`,
  },
];

export const ALL_PROFILES = [...ADHESIVE_PROFILES, ...GROUT_PROFILES];
export const bySlug = (slug: string) => ALL_PROFILES.find((p) => p.slug === slug)!;
export const SPECTRALOCK_MINI = "laticrete-spectralock-pro-epoxy-grout-mini";
