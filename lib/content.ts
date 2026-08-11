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
  { href: "/vision-board", label: "Vision Board" },
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
      { href: "/vision-board", label: "Vision Board" },
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
  eyebrow: "Curated tiles · Sunshine Coast",
  // headline split so "better tiles." renders in Newsreader italic sea
  headA: "Coastal homes",
  headB: "deserve",
  headC: "",
  headAccent: "better tiles.",
  sub: "Floor, wall and outdoor tiles, chosen and matched with care by a local family team.",
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
  eyebrow: "On now · Package deal",
  headA: "Floor-to-Ceiling",
  headB: "Package Deal.",
  sub: "A complete bathroom of tiles — crisp Aspect gloss-white walls taken floor to ceiling, plus our Cottesloe limestone-look floor — supplied as one simple package. Supply only, collect from Baringa.",
  chips: ["Walls + floor supplied", "Supply only · Baringa pickup"],
  cta: { label: "View all Specials", href: "/specials" },
  badge: { pct: "$989", label: "THE LOT" },
  card: { name: "Floor-to-Ceiling Package", was: "", now: "$989 inc GST" },
  image: "/images/specials/bathroom-bundle.webp",
  tile: "https://onwoodtiles.com.au/images/tileone/aspect-300x450-gloss.webp?v=1",
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
  p1: "Every OnWood project starts with your space, your light and your budget. We help you choose, match and pull the whole look together, from the tiles to the finishing details, so you end up with a room you'll love for years.",
  p2: "Not just tiles: we finish the job with the tapware, adhesives, trims and accessories to match. Honest advice from a local, family-run Sunshine Coast family team with no franchise script, no pushy upsell.",
  stats: [
    { to: 1000, suffix: "s", label: "Products to choose from", isPostcode: true },
    { to: 4551, suffix: "", label: "Baringa, on your doorstep", isPostcode: true },
    { to: 100, suffix: "%", label: "Local & independent" },
  ],
  // Curated secondary ("see it installed") images for the three arched niches
  // (tall, then the two small). Set here → Story uses these instead of auto-picking.
  images: [
    { src: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhxlc009mrkhk2mp90kbe-1785544390736.jpg", alt: "Marrakesh Terracotta decor tiles styled in a room" },
    { src: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhsf5002irkhka5vm767t-1786153002585.jpg", alt: "Fornace Dune decor tiles installed" },
    { src: "https://onwoodtiles.com.au/images/tileone/ironclad-bronze-facade.webp?v=1", alt: "Ironclad 612 Bronze metal-look tiles installed" },
  ] as { src: string; alt: string }[],
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
  /** Feed slugs this curated card already represents — used to de-dupe against the
   *  live OnBase specials feed so a hand-written card isn't duplicated by the auto one. */
  slugs?: string[];
};

export const SPECIALS_PAGE = {
  eyebrow: "On now · while stocks last",
  title: "This month's",
  titleAccent: ".",
  sub: "A couple of genuine deals from the Baringa showroom right now — plus free delivery across the Sunshine Coast. Supply only, while stocks last.",
  items: [
    {
      pct: "SPECIAL",
      tag: "300×600mm rectified white gloss",
      name: "Aspect 36 Gloss White",
      now: "$16.95/m²",
      note: "A crisp, bright rectified white gloss — a clean, timeless look for walls and splashbacks at a sharp price.",
      tile: "https://onwoodtiles.com.au/images/tileone/aspect-300x600-gloss.webp?v=1",
      room: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhxbu009drkhkg0ckkc0a-1785395853279.jpg",
      slugs: ["aspect-36-gloss-rectified"],
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
    title: "Floor-to-Ceiling Package Deal",
    price: "$989",
    priceNote: "inc GST · supply only",
    sub: "Walls and floor sorted in one go. Crisp Aspect gloss-white wall tiles taken floor to ceiling, paired with our Cottesloe Limestone floor — a clean, contemporary bathroom supplied as one simple package.",
    image: "/images/specials/bathroom-bundle.webp",
    imageAlt:
      "Contemporary bathroom with floor-to-ceiling gloss white wall tiles and a light limestone-look tiled floor",
    features: [
      "Floor-to-ceiling Aspect 300×450 gloss white wall tiles — all four walls of a 3×3m bathroom",
      "Cottesloe 45 Limestone 450×450 floor tiles — the full 3×3m floor",
      "Enough for the room with wastage allowed",
      "Supply only — collect from our Baringa showroom",
    ],
    cta: "Reserve this bathroom",
  },
  reserve: {
    title: "Seen one you like?",
    sub: "Specials move fast and stock is limited. Reserve your quantity with a quick message and we'll hold it for 7 days.",
    cta: "Reserve & enquire",
  },
  disclaimer:
    "Prices are GST inclusive and supply only — per-square-metre specials are priced per m², and the Floor-to-Ceiling Package Deal is a fixed package price. Offers valid while advertised stock lasts and may be withdrawn without notice. Not in conjunction with any other offer.",
  termsTitle: "Specials terms & conditions",
  terms: [
    "All specials are supply only. Prices are in Australian dollars, GST inclusive, and quoted per square metre (m²) unless stated otherwise.",
    "Offers are available for a limited time and while advertised stock lasts. OnWood Tiles may change, extend or withdraw any special at any time without notice.",
    "Timber-look offer: 20% off is calculated on the normal supply price of tiles in our advertised timber-look porcelain range. Selected lines only; ranges and colours are subject to availability.",
    "Aspect 36 Gloss White is offered at the advertised special price while stocks last. Once current stock is sold, the special ends or moves to the next available batch.",
    "Floor-to-Ceiling Package Deal ($989): the advertised price is for tiles only (supply only) — the floor-to-ceiling wall tiles plus the floor tiles — based on a bathroom of approximately 3m × 3m with 2.4m high walls (about 28.8m² of wall and 9m² of floor, plus wastage, supplied in full boxes). Your actual quantities depend on your room and layout; we'll confirm your exact requirements before you order.",
    "Floor-to-Ceiling Package Deal is a fixed package price. If your bathroom needs less than the quantities above, the price is not reduced. If it needs more, the additional tiles are supplied at our normal retail (RRP) price.",
    "The Floor-to-Ceiling Package Deal is supply only and for collection from our Baringa showroom. The price does not include delivery, adhesive, grout, trims, waterproofing, installation, or any tapware, fittings or furniture shown in imagery. Delivery can be arranged and quoted separately.",
    "Floor-to-Ceiling Package Deal: changing the tiles, colours or finishes shown may change the price. Tiles are batch-made — please order your full quantity at once and confirm a current physical sample before ordering.",
    "Free delivery applies to standard tile orders delivered within OnWood Tiles' nominated Sunshine Coast delivery zones. It excludes bulk, oversized or remote-area freight, which may be quoted separately — please confirm your suburb with us before ordering.",
    "Tile specials cannot be used in conjunction with the free delivery special offer. All supply-only specials are pickup in store at Baringa.",
    "Specials cannot be used in conjunction with any other offer, discount or trade pricing, and have no cash value.",
    "Tiles are a natural, batch-made product. Colour, shade, finish and size can vary between batches — always confirm with a current physical sample before ordering, and order your full quantity (including wastage) at once where possible.",
    "Room images are a guide for inspiration only and may not represent the exact tile, colour or layout supplied. Deposits and our standard Terms of Sale apply to all orders. Errors and omissions excepted.",
  ],
};

// ---- async getters (constants today, CMS/OnBase later) ----
export async function getShopDetails(): Promise<ShopDetails> {
  return SHOP;
}
