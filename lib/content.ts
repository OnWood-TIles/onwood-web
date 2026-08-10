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
// both server and client components (Hero, Contact are client).
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
  street: "2/11 Packer Road",
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
  { href: "/shop", label: "Shop" },
  { href: "/#featured", label: "On Trend" },
  { href: "/#showroom", label: "Showroom" },
  { href: "/why", label: "Why OnWood" },
  { href: "/contact", label: "Contact" },
];

// Footer directory columns (the bottom-banner link groups). Edit here to add or
// reorder links as the site grows - the footer renders whatever is listed. Keep
// hrefs pointing at real routes so nothing dead-links. Company details, logo and
// open hours are added by MarketingFooter separately (live from OnBase).
export type FooterLink = { href: string; label: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop All Tiles" },
      { href: "/#featured", label: "Currently On Trend" },
      { href: "/specials", label: "Monthly Specials" },
      { href: "/book", label: "Book a Visit" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/gallery", label: "Gallery" },
      { href: "/calculator", label: "Tile Calculator" },
      { href: "/#showroom", label: "Vision Board" },
      { href: "/#showroom", label: "The Showroom" },
      { href: "/why", label: "Why OnWood" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/faq", label: "FAQ" },
      { href: "/terms-of-sale", label: "Terms of Sale" },
      { href: "/terms-of-use", label: "Website Terms of Use" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/trade/login", label: "Trade Partner Login" },
    ],
  },
];

export const HERO = {
  eyebrow: "Sunshine Coast tile shop",
  // headline split so "feel." renders in Newsreader italic sea
  headA: "The floor is the",
  headB: "first thing",
  headC: "you ",
  headAccent: "feel.",
  sub: "OnWood brings beautiful floor, wall and outdoor tiles to Sunshine Coast homes, studios and builds, chosen and matched with care by a local family team.",
  ctaPrimary: { label: "See what's on trend", href: "#featured" },
  ctaSecondary: { label: "Step into the showroom", href: "#showroom" },
};

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

// Head copy for the homepage "Currently On Trend" featured-products section.
// Wording lives here so it's easy to tweak (e.g. "Featured Products").
export const FEATURED_HEAD = {
  eyebrow: "Currently on trend",
  title: "The pieces turning heads right now.",
  cta: { label: "Shop the full range", href: "/shop" },
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

export const SPECIALS_TEASER = {
  eyebrow: "This month at OnWood",
  headA: "Specials worth",
  headB: "walking in for.",
  sub: "Right now: 20% off timber-look porcelain, our Aspect gloss white at a sharp price, and free delivery across the Sunshine Coast. While stocks last.",
  chips: ["20% off timber-look", "Free Sunshine Coast delivery"],
  cta: { label: "See all specials", href: "/specials" },
  badge: { pct: "20%", label: "OFF" },
  card: { name: "Woodstock 212 Oak", was: "", now: "20% off" },
  image: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhtu1004zrkhk1nj3586q-1785558942651.jpg",
  tile: "https://onwoodtiles.com.au/images/tileone/1781578830.webp?v=3",
};

export const SHOWROOM = {
  eyebrow: "Step inside the showroom",
  title: "See the finishes in the flesh.",
  sub: "Our Baringa showroom, full-size boards, big-format samples and honest Sunshine Coast light. Real tile photography drops straight into these niches.",
  visionEyebrow: "Vision board",
  visionTitle: "Build the look on a Caesarstone benchtop.",
  visionSub: "Pick paint, tiles, flooring, cabinetry, benchtops and styling from the tabs, then drag each piece to arrange your board.",
};

// Vision-board material rails per tab (colour chips for v1). Paint is handled
// separately in VisionBoard as a searchable Dulux picker, so it is not here.
export const VISION_TABS: Record<string, { name: string; color: string }[]> = {
  // "tiles" is now a GlowTile searchable picker + "benchtops" the Caesarstone
  // picker - both handled specially in VisionBoard, so no colour chips here.
  benchtops: [
    { name: "Calacatta", color: "#f4f1ea" },
    { name: "Pietra Grey", color: "#4a4d52" },
    { name: "Cloudburst", color: "#6b7178" },
    { name: "Raw Concrete", color: "#b8b2a6" },
  ],
  // "decor" standalone tab removed 2026-07-10 - Decor now lives under the Styling tab.
};

export const STORY = {
  eyebrow: "Why OnWood",
  headA: "We don't just sell tiles.",
  headB: "We help you get the whole room right.",
  p1: "Every OnWood project starts with your space, your light and your budget. We help you choose, match and lay out the tile so the pattern runs the way the room wants it to, and we finish the look with the accessories, tapware and trims to match.",
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
  sub: "Send through your sizes for a quick tile quote, or drop by the showroom for a coffee and a fistful of samples.",
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
  pct?: string; // corner badge, e.g. "20% OFF" or "SPECIAL"
  tag: string;
  name: string;
  was?: string; // struck price (optional)
  now?: string; // e.g. "$16.95/m²" (optional)
  note: string;
  tile?: string; // the singular tile swatch (overlaid on the room, trimmed via /api/tile)
  room?: string; // the "see it installed" room photo (the card hero)
};

export const SPECIALS_PAGE = {
  eyebrow: "On now · while stocks last",
  title: "This month's",
  titleAccent: ".",
  sub: "A couple of genuine deals from the Baringa showroom right now — plus free delivery across the Sunshine Coast. Supply only, while stocks last.",
  items: [
    {
      pct: "20% OFF",
      tag: "Timber-look porcelain",
      name: "Timber-look feature",
      note: "The warmth of timber with none of the upkeep — 20% off our timber-look range (Woodstock, Heartwood & more) this month.",
      tile: "https://onwoodtiles.com.au/images/tileone/1781578830.webp?v=3",
      room: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhtu1004zrkhk1nj3586q-1785558942651.jpg",
    },
    {
      pct: "SPECIAL",
      tag: "300×300 rectified white gloss",
      name: "Aspect 36 Gloss White",
      now: "$16.95/m²",
      note: "A crisp, bright rectified white gloss — a clean, timeless look for walls and splashbacks at a sharp price.",
      tile: "https://onwoodtiles.com.au/images/tileone/aspect-300x600-gloss.webp?v=1",
      room: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhxbu009drkhkg0ckkc0a-1785395853279.jpg",
    },
  ] as Special[],
  freeDelivery: {
    badge: "Free delivery",
    title: "Free delivery across the Sunshine Coast.",
    sub: "We'll get your tiles to site free within our Sunshine Coast delivery zones — just ask us about your suburb when you order.",
    cta: "Check my suburb",
    image: "/images/specials/delivery-truck.webp",
  },
  package: {
    eyebrow: "Bundle & save",
    title: "The whole tile job, in one supply package.",
    sub: "Found a tile you love? We can bundle it with the adhesive, grout, trims and accessories your tiler needs, matched to your job and priced as one. Supply only, ready for your installer to lay.",
    features: [
      "Your tiles plus matched adhesive, grout and trims",
      "Coverage worked out for your space, with wastage allowed",
      "Supplied from one batch wherever possible",
      "Delivered to site, or ready for collection at Baringa",
    ],
    cta: "Ask about a bundle",
  },
  reserve: {
    title: "Seen one you like?",
    sub: "Specials move fast and stock is limited. Reserve your quantity with a quick message and we'll hold it for 7 days.",
    cta: "Reserve & enquire",
  },
  disclaimer:
    "Prices shown are per square metre, GST inclusive, supply only. Offers valid while advertised stock lasts and may be withdrawn without notice. Not in conjunction with any other offer. Sunshine Coast delivery zones apply.",
  termsTitle: "Specials terms & conditions",
  terms: [
    "All specials are supply only. Prices are in Australian dollars, GST inclusive, and quoted per square metre (m²) unless stated otherwise.",
    "Offers are available for a limited time and while advertised stock lasts. OnWood Tiles may change, extend or withdraw any special at any time without notice.",
    "Timber-look offer: 20% off is calculated on the normal supply price of tiles in our advertised timber-look porcelain range. Selected lines only; ranges and colours are subject to availability.",
    "Aspect 36 Gloss White is offered at the advertised special price while stocks last. Once current stock is sold, the special ends or moves to the next available batch.",
    "Free delivery applies to standard tile orders delivered within OnWood Tiles' nominated Sunshine Coast delivery zones. It excludes bulk, oversized or remote-area freight, which may be quoted separately — please confirm your suburb with us before ordering.",
    "Specials cannot be used in conjunction with any other offer, discount or trade pricing, and have no cash value.",
    "Tiles are a natural, batch-made product. Colour, shade, finish and size can vary between batches — always confirm with a current physical sample before ordering, and order your full quantity (including wastage) at once where possible.",
    "Room images are a guide for inspiration only and may not represent the exact tile, colour or layout supplied. Deposits and our standard Terms of Sale apply to all orders. Errors and omissions excepted.",
  ],
};

// ---- async getters (constants today, CMS/OnBase later) ----
export async function getShopDetails(): Promise<ShopDetails> {
  return SHOP;
}
