// Content source layer. Async-first ON PURPOSE: pages await these getters, so
// swapping the backing store from typed constants to Payload CMS / OnBase later
// is a localized change with no page rewrites. Server-only.
//
// Copy is adapted from the Claude Design reference to OnWood TILES (a Sunshine
// Coast tile showroom & supplier - not a flooring installer, no "Flooring" per
// the brand constraint). Real details (Baringa, sales@onwoodtiles.com.au).
// No em-dashes in customer copy. Team names are PLACEHOLDERS.
//
// NOTE: not "server-only" - these are static marketing constants consumed by
// both server and client components (Hero, Contact, Visualiser are client).
// No secrets live here. The OnBase/CMS data client (lib/onbase/client.ts) stays
// server-only for anything sensitive.

export type ShopDetails = {
  name: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  email: string;
  hours: string;
  socials: { instagram: string; facebook: string };
};

export const SHOP: ShopDetails = {
  name: "OnWood Tiles",
  street: "2/11 Packer Street",
  suburb: "Baringa",
  state: "QLD",
  postcode: "4551",
  email: "sales@onwoodtiles.com.au",
  hours: "Mon-Sat",
  socials: {
    instagram: "https://www.instagram.com/onwood_tiles",
    facebook: "https://www.facebook.com/share/18qX1BsNrf/",
  },
};

// Root-relative so the nav works from BOTH the homepage and /specials
// (bare "#id" only scrolls on the homepage). On the homepage "/#id" still
// same-document-scrolls.
export const NAV_LINKS = [
  { href: "/#collections", label: "Collections" },
  { href: "/#visualize", label: "Visualiser" },
  { href: "/#showroom", label: "Showroom" },
  { href: "/#story", label: "Why OnWood" },
];

export const HERO = {
  eyebrow: "Sunshine Coast tile shop",
  // headline split so "feel." renders in Newsreader italic sea
  headA: "The floor is the",
  headB: "first thing",
  headC: "you ",
  headAccent: "feel.",
  sub: "OnWood brings beautiful floor, wall and outdoor tiles to Sunshine Coast homes, studios and builds, chosen and matched with care, supplied and installed by hand.",
  ctaPrimary: { label: "Explore collections", href: "#collections" },
  ctaSecondary: { label: "See it on your floor", href: "#visualize" },
};

// Scrolling marquee of finishes (tiles only).
export const MARQUEE = [
  "Handmade zellige",
  "Sun-baked terracotta",
  "Honed travertine",
  "Whitewashed limestone",
  "Wood-look porcelain",
  "Aegean gloss",
  "Marble-look porcelain",
];

export type Collection = {
  tag: string;
  name: string;
  price: string;
  desc: string;
  swatch: string; // CSS background
};

export const COLLECTIONS_HEAD = {
  eyebrow: "Collections",
  title: "Six ranges. One obsession with the perfect surface.",
  cta: { label: "Request full sample box", href: "#contact" },
};

export const COLLECTIONS: Collection[] = [
  {
    tag: "Wood-look porcelain",
    name: "Coastal Oak",
    price: "from $44/m²",
    desc: "Warm timber-look planks in through-body porcelain, all the grain, none of the upkeep.",
    swatch: "linear-gradient(160deg,#C8894B,#96632f)",
  },
  {
    tag: "Handmade gloss tile",
    name: "Aegean Zellige",
    price: "from $96/m²",
    desc: "Hand-glazed Moroccan-style zellige with the little ripples and colour shifts that catch the light.",
    swatch: "linear-gradient(135deg,#3f97a6,#1c4a54)",
  },
  {
    tag: "Honed natural stone",
    name: "Travertine Sand",
    price: "from $62/m²",
    desc: "Soft, honed travertine in warm sand tones, a quiet, grounded floor for coastal homes.",
    swatch: "linear-gradient(160deg,#d8c8ac,#a89372)",
  },
  {
    tag: "Polished porcelain",
    name: "Carrara Statuario",
    price: "from $52/m²",
    desc: "The drama of Italian marble in a hard-wearing polished porcelain, big format, low fuss.",
    swatch: "linear-gradient(150deg,#efe9e0,#d9d2c6)",
  },
  {
    tag: "Sun-baked terracotta",
    name: "Baked Terracotta",
    price: "from $58/m²",
    desc: "Earthy, sealed terracotta-look tiles with a Mediterranean warmth that only gets better with time.",
    swatch: "linear-gradient(160deg,#c15a30,#8a3d22)",
  },
  {
    tag: "Whitewashed limestone",
    name: "Whitewashed Limestone",
    price: "from $69/m²",
    desc: "Pale, chalky limestone-look porcelain that lifts a room and bounces the Queensland light.",
    swatch: "linear-gradient(160deg,#efece5,#d3cabb)",
  },
];

export const TILEGRID_HEAD = {
  eyebrow: "Every surface, alive to the touch",
  title: "Move your cursor across the floor",
};

export const SPECIALS_TEASER = {
  eyebrow: "This month at OnWood",
  headA: "Specials worth",
  headB: "walking in for.",
  sub: "Clearance runs, end-of-line stone and whole-home tile packages, refreshed monthly, while stocks last.",
  chips: ["Up to 40% off wood-look", "Free underlay over 60m²"],
  cta: { label: "See all specials", href: "/specials" },
  badge: { pct: "40%", label: "OFF" },
  card: { name: "Coastal Oak", was: "$59", now: "$41/m²" },
};

export type Swatch = { name: string; swatch: string; floor: string };

export const VISUALISER = {
  eyebrow: "Live visualiser",
  title: "See it on your floor",
  sub: "Tap a finish to lay it across the room instantly. In the full build this swaps onto your uploaded photo with lighting matched.",
  swatches: [
    { name: "Coastal Oak", swatch: "#C8894B", floor: "#C8894B" },
    { name: "Travertine Sand", swatch: "#d8c8ac", floor: "#cdbb98" },
    { name: "Carrara Statuario", swatch: "#efe9e0", floor: "#e6ddcf" },
    { name: "Aegean Zellige", swatch: "#3f97a6", floor: "#3f97a6" },
    { name: "Baked Terracotta", swatch: "#c15a30", floor: "#b5532c" },
    { name: "Whitewashed Limestone", swatch: "#e4ddd0", floor: "#ddd4c4" },
  ] as Swatch[],
};

export const SHOWROOM = {
  eyebrow: "Step inside the showroom",
  title: "See the finishes in the flesh.",
  sub: "Our Baringa showroom, full-size boards, big-format samples and honest Sunshine Coast light. Real tile photography drops straight into these niches.",
  visionEyebrow: "Vision board",
  visionTitle: "Build the look on a Caesarstone benchtop.",
  visionSub: "Pick paint, wood-look, tiles, benchtops and a little decor from the tabs, then drag each piece to arrange your board.",
};

// Vision-board material rails per tab (colour chips for v1). Paint is handled
// separately in VisionBoard as a searchable Dulux picker, so it is not here.
export const VISION_TABS: Record<string, { name: string; color: string }[]> = {
  woodlook: [
    { name: "Coastal Oak", color: "#C8894B" },
    { name: "Smoked Oak", color: "#7A4A28" },
    { name: "Pale Ash", color: "#d3cabb" },
    { name: "Blackbutt", color: "#a89372" },
  ],
  tiles: [
    { name: "Zellige", color: "#3f97a6" },
    { name: "Terracotta", color: "#c15a30" },
    { name: "Carrara", color: "#efe9e0" },
    { name: "Travertine", color: "#d8c8ac" },
    { name: "Limestone", color: "#efece5" },
  ],
  benchtops: [
    { name: "Calacatta", color: "#f4f1ea" },
    { name: "Pietra Grey", color: "#4a4d52" },
    { name: "Cloudburst", color: "#6b7178" },
    { name: "Raw Concrete", color: "#b8b2a6" },
  ],
  decor: [
    { name: "Olive", color: "#6b7a3f" },
    { name: "Rattan", color: "#c9a36b" },
    { name: "Brass", color: "#b98e42" },
    { name: "Linen", color: "#e7e1d6" },
  ],
};

export const STORY = {
  eyebrow: "Why OnWood",
  headA: "We don't just sell tiles.",
  headB: "We help you get the whole room right.",
  p1: "Every OnWood project starts with your space, your light and your budget. We help you choose, match and lay out the tile so the pattern runs the way the room wants it to, and we can arrange supply and install from start to finish.",
  p2: "Coolum to Caloundra, we've spent years learning what humidity, salt air and Queensland sun do to a surface, so yours lasts.",
  stats: [
    { to: 100, suffix: "s", label: "Colours & finishes" },
    { to: 4551, suffix: "", label: "Baringa, on your doorstep", isPostcode: true },
    { to: 100, suffix: "%", label: "Local & independent" },
  ],
};

export type Testimonial = { text: string; name: string; place: string };

export const TESTIMONIALS_HEAD = {
  eyebrow: "From Sunshine Coast homes",
  title: "People stop and look down.",
};

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "The team matched a wood-look porcelain to our deck perfectly. Half the house has asked where the floor is from.",
    name: "Hannah P.",
    place: "Pelican Waters",
  },
  {
    text: "Honest advice, no upsell, and the samples went home with us the same day. Made choosing so much easier.",
    name: "Dan & Mel",
    place: "Buderim",
  },
  {
    text: "Beautiful zellige for our splashback and it turned up exactly when they said. Genuinely lovely to deal with.",
    name: "Priya S.",
    place: "Caloundra",
  },
];

export type TeamMember = { name: string; role: string };

export const TEAM_HEAD = {
  eyebrow: "Meet the crew",
  title: "The hands on your tiles.",
};

// PLACEHOLDER names - replace with the real OnWood team (roles are retail).
export const TEAM: TeamMember[] = [
  { name: "Placeholder Name", role: "Showroom lead" },
  { name: "Placeholder Name", role: "Selections & design" },
  { name: "Placeholder Name", role: "Trade & orders" },
  { name: "Placeholder Name", role: "Showroom host" },
];

export const CONTACT = {
  title: "Let's lay something beautiful.",
  sub: "Book a free measure & quote, or drop by the showroom for a coffee and a fistful of samples.",
  interests: [
    "I'm interested in... wood-look tiles",
    "Natural stone",
    "Porcelain & ceramic",
    "Whole-home tiling",
    "Commercial fit-out",
  ],
};

// ---- Specials page ----
export type Special = {
  pct: string;
  tag: string;
  name: string;
  was: string;
  now: string;
  note: string;
  swatch: string;
};

export const SPECIALS_PAGE = {
  eyebrow: "While stocks last",
  title: "Seasonal specials",
  titleAccent: ".",
  sub: "Clearance runs, end-of-line stone and whole-home packages from the Baringa showroom. Prices held until the counter hits zero.",
  items: [
    { pct: "40% OFF", tag: "Wood-look porcelain", name: "Coastal Oak", was: "$59", now: "$41/m²", note: "End of line · ~300m² left", swatch: "linear-gradient(160deg,#d09a5f,#96632f)" },
    { pct: "30% OFF", tag: "Polished porcelain", name: "Carrara Statuario", was: "$74", now: "$52/m²", note: "Showroom clearance", swatch: "linear-gradient(150deg,#efe9e0,#d9d2c6)" },
    { pct: "25% OFF", tag: "Wood-look plank", name: "Herringbone Walnut", was: "$89", now: "$67/m²", note: "Limited packs remaining", swatch: "repeating-linear-gradient(45deg,#7A4A28 0 16px,#5f3a1f 16px 32px)" },
    { pct: "35% OFF", tag: "Honed natural stone", name: "Travertine Sand", was: "$96", now: "$62/m²", note: "Last of the crate", swatch: "linear-gradient(160deg,#d8c8ac,#a89372)" },
    { pct: "20% OFF", tag: "Handmade gloss tile", name: "Aegean Zellige", was: "$120", now: "$96/m²", note: "Overstock batch", swatch: "linear-gradient(135deg,#3f97a6,#1c4a54)" },
    { pct: "30% OFF", tag: "Sun-baked terracotta", name: "Baked Terracotta", was: "$105", now: "$74/m²", note: "Discontinued colour", swatch: "linear-gradient(160deg,#c15a30,#8a3d22)" },
  ] as Special[],
  package: {
    eyebrow: "Package deal",
    title: "Whole-home tiles, supplied & laid.",
    sub: "Pick any range and we'll handle the lot, measure, old-floor removal, premium underlay and hand-set install. One price, no surprises.",
    features: [
      "Free on-site measure & dry-lay",
      "Premium acoustic underlay included",
      "Old-floor removal & disposal",
      "25-year residential warranty",
    ],
    from: "$79",
    fromNote: "/m² supplied & installed",
    cta: "Get my package quote",
  },
  reserve: {
    title: "Seen one you like?",
    sub: "Specials move fast and stock is limited. Reserve your quantity with a quick message and we'll hold it for 7 days.",
    cta: "Reserve & enquire",
  },
  disclaimer:
    "Prices shown are per square metre, GST inclusive, supply-only unless stated. Offers valid while advertised stock lasts and may be withdrawn without notice. Not in conjunction with any other offer. Sunshine Coast delivery zones apply.",
};

// ---- async getters (constants today, CMS/OnBase later) ----
export async function getShopDetails(): Promise<ShopDetails> {
  return SHOP;
}
