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
  socials: { instagram: string; facebook: string; pinterest: string };
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
    pinterest: "https://au.pinterest.com/OnWoodTiles/",
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
      { href: "/tile-shop", label: "Areas We Service" },
      { href: "/book", label: "Book a Visit" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/quiz", label: "Find Your Tile" },
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
  sub: "A complete bathroom of tiles, crisp Aspect gloss-white walls taken floor to ceiling, plus our Cottesloe limestone-look floor, supplied as one simple package. Supply only, collect from Baringa.",
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
    { src: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhsf5002irkhka5vm767t-1786153002585.jpg", alt: "Cortile Dune decor tiles installed" },
    { src: "https://onwoodtiles.com.au/images/tileone/ironclad-bronze-facade.webp?v=1", alt: "Ironclad 612 Bronze metal-look tiles installed" },
  ] as { src: string; alt: string }[],
};

export type Testimonial = { text: string; name: string; place: string };

export const TESTIMONIALS_HEAD = {
  eyebrow: "From Sunshine Coast homes",
  title: "People stop and look down.",
};

// FORMAT PRESERVED — these were invented placeholder reviews, not real customers.
// When real testimonials arrive, fill these in (or add new ones in this shape) and
// rename this array back to TESTIMONIALS. The live TESTIMONIALS below stays [] until
// then, so the Testimonials section cleanly hides itself (heading included).
export const TESTIMONIALS_EXAMPLE: Testimonial[] = [
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

// Live testimonials — empty until we have REAL ones. An empty array makes the
// Testimonials section render nothing (see Testimonials.tsx). Copy entries from
// TESTIMONIALS_EXAMPLE (or add real ones) to bring the section back.
export const TESTIMONIALS: Testimonial[] = [];

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
  sub: "A couple of genuine deals from the Baringa showroom right now, plus free delivery across the Sunshine Coast. Supply only, while stocks last.",
  items: [
    {
      pct: "SPECIAL",
      tag: "300×600mm rectified white gloss",
      name: "Aspect 36 Gloss White",
      now: "$16.95/m²",
      note: "A crisp, bright rectified white gloss, a clean, timeless look for walls and splashbacks at a sharp price.",
      tile: "https://onwoodtiles.com.au/images/tileone/aspect-300x600-gloss.webp?v=1",
      room: "https://jwxkc2x6hmfp0lqp.public.blob.vercel-storage.com/website/installed/cmryfhxbu009drkhkg0ckkc0a-1785395853279.jpg",
      slugs: ["aspect-36-gloss-rectified"],
    },
  ] as Special[],
  freeDelivery: {
    badge: "Free delivery",
    title: "Free delivery across the Sunshine Coast.",
    sub: "We'll get your tiles to site free within our Sunshine Coast delivery zones, just ask us about your suburb when you order.",
    cta: "Check my suburb",
    image: "/images/specials/delivery-truck.webp",
  },
  package: {
    eyebrow: "Bundle & save",
    title: "Floor-to-Ceiling Package Deal",
    price: "$989",
    priceNote: "inc GST · supply only",
    sub: "Walls and floor sorted in one go. Crisp Aspect gloss-white wall tiles taken floor to ceiling, paired with our Cottesloe Limestone floor, a clean, contemporary bathroom supplied as one simple package.",
    image: "/images/specials/bathroom-bundle.webp",
    imageAlt:
      "Contemporary bathroom with floor-to-ceiling gloss white wall tiles and a light limestone-look tiled floor",
    features: [
      "Floor-to-ceiling Aspect 300×450 gloss white wall tiles, all four walls of a 3×3m bathroom",
      "Cottesloe 45 Limestone 450×450 floor tiles, the full 3×3m floor",
      "Enough for the room with wastage allowed",
      "Supply only, collect from our Baringa showroom",
    ],
    cta: "Reserve this bathroom",
  },
  reserve: {
    title: "Seen one you like?",
    sub: "Specials move fast and stock is limited. Reserve your quantity with a quick message and we'll hold it for 7 days.",
    cta: "Reserve & enquire",
  },
  disclaimer:
    "Prices are GST inclusive and supply only. Per-square-metre specials are priced per m², and the Floor-to-Ceiling Package Deal is a fixed package price. Offers valid while advertised stock lasts and may be withdrawn without notice. Not in conjunction with any other offer.",
  termsTitle: "Specials terms & conditions",
  terms: [
    "All specials are supply only. Prices are in Australian dollars, GST inclusive, and quoted per square metre (m²) unless stated otherwise.",
    "Offers are available for a limited time and while advertised stock lasts. OnWood Tiles may change, extend or withdraw any special at any time without notice.",
    "Timber-look offer: 20% off is calculated on the normal supply price of tiles in our advertised timber-look porcelain range. Selected lines only; ranges and colours are subject to availability.",
    "Aspect 36 Gloss White is offered at the advertised special price while stocks last. Once current stock is sold, the special ends or moves to the next available batch.",
    "Floor-to-Ceiling Package Deal ($989): the advertised price is for tiles only (supply only), the floor-to-ceiling wall tiles plus the floor tiles, based on a bathroom of approximately 3m × 3m with 2.4m high walls (about 28.8m² of wall and 9m² of floor, plus wastage, supplied in full boxes). Your actual quantities depend on your room and layout; we'll confirm your exact requirements before you order.",
    "Floor-to-Ceiling Package Deal is a fixed package price. If your bathroom needs less than the quantities above, the price is not reduced. If it needs more, the additional tiles are supplied at our normal retail (RRP) price.",
    "The Floor-to-Ceiling Package Deal is supply only and for collection from our Baringa showroom. The price does not include delivery, adhesive, grout, trims, waterproofing, installation, or any tapware, fittings or furniture shown in imagery. Delivery can be arranged and quoted separately.",
    "Floor-to-Ceiling Package Deal: changing the tiles, colours or finishes shown may change the price. Tiles are batch-made, so please order your full quantity at once and confirm a current physical sample before ordering.",
    "Free delivery applies to standard tile orders delivered within OnWood Tiles' nominated Sunshine Coast delivery zones. It excludes bulk, oversized or remote-area freight, which may be quoted separately, so please confirm your suburb with us before ordering.",
    "Tile specials cannot be used in conjunction with the free delivery special offer. All supply-only specials are pickup in store at Baringa.",
    "Specials cannot be used in conjunction with any other offer, discount or trade pricing, and have no cash value.",
    "Tiles are a natural, batch-made product. Colour, shade, finish and size can vary between batches, so always confirm with a current physical sample before ordering, and order your full quantity (including wastage) at once where possible.",
    "Room images are a guide for inspiration only and may not represent the exact tile, colour or layout supplied. Deposits and our standard Terms of Sale apply to all orders. Errors and omissions excepted.",
  ],
};

// ---- Department SEO copy ----------------------------------------------------
// Per-department intro content for /shop/[department]. Google rewards RELEVANCE:
// a keyworded (but honest, human-first) H1 + intro + unique meta description beats
// a bare product grid with a one-word title. The nav LABEL/breadcrumb stays short
// (from the OnBase taxonomy); the keyword variety lives here in the copy + meta.
// Keyed by department SLUG so renaming a label in OnBase never breaks the match.
// The hero image is derived on the page from the department's real "installed"
// room shots (no asset to manage here). Add a new department by adding its slug.
export type DepartmentSeo = {
  eyebrow: string;
  h1: string; // broad + keyworded, NOT a material-narrowing rename of the department
  intro: string[]; // one or two short paragraphs (60-120 words total), human-first
  metaTitle: string;
  metaDescription: string;
  links?: { label: string; href: string }[]; // internal "related" links under the intro (SEO internal-linking + UX)
  faqs?: { q: string; a: string }[]; // visible FAQ block + FAQPage structured data (long-tail relevance)
};

export const DEPARTMENT_SEO: Record<string, DepartmentSeo> = {
  tiles: {
    eyebrow: "Shop tiles",
    h1: "Floor, Wall & Outdoor Tiles",
    intro: [
      "From affordable everyday tiles to premium Italian and Spanish porcelain, our range spans wood-look and timber-look porcelain, ceramic, natural stone, handmade-look gloss, mosaics and hard-wearing outdoor tiles, for bathroom floors, kitchen splashbacks, feature walls and alfresco areas. Supplied from our Baringa showroom on the Sunshine Coast.",
    ],
    metaTitle: "Tiles Sunshine Coast | Porcelain, Wood-Look & Stone",
    metaDescription:
      "Explore our full tile range on the Sunshine Coast, from wood-look and porcelain tiles to natural stone, mosaics and outdoor tiles. Supply only from our Baringa showroom.",
    links: [
      { label: "Outdoor tiles buying guide", href: "/blog/outdoor-tiles-sunshine-coast-guide" },
      { label: "Browse the gallery", href: "/gallery?dept=tiles" },
      { label: "Tile calculator", href: "/calculator" },
      { label: "Find your tile quiz", href: "/quiz" },
    ],
    faqs: [
      { q: "What tiles are best for outdoor areas on the Sunshine Coast?", a: "For patios, pool surrounds and alfresco areas, look for a slip-rated porcelain (for example R11) or a textured natural-look tile that copes with UV, moisture and coastal salt air. Pop into the Baringa showroom and we'll point you to the right finish for your space." },
      { q: "Are porcelain tiles better than ceramic?", a: "Porcelain is denser, harder-wearing and lower-maintenance, which makes it ideal for floors and outdoor areas. Ceramic is a great-value choice for walls and splashbacks. We stock both, so it comes down to where the tile is going and the look you want." },
      { q: "What are wood-look tiles?", a: "Wood-look (or timber-look) porcelain gives you the warmth and grain of timber with none of the sanding, sealing or water worries, so you can run the same floor through a bathroom, kitchen, living area and even outdoors." },
      { q: "How many tiles do I need?", a: "Measure your area in square metres and add around 10% for cuts and wastage. Our free tile calculator gives you a quick estimate, or bring your measurements into the showroom and we'll help you work it out." },
      { q: "Do you deliver tiles across the Sunshine Coast?", a: "Yes, we deliver across the Sunshine Coast, just ask us for a delivery quote for your suburb, and you're welcome to collect from our Baringa showroom. We're supply only, so there's no on-site measure, but we're always happy to help you choose." },
    ],
  },
  wastes: {
    eyebrow: "Shop wastes & grates",
    h1: "Shower Wastes, Floor Wastes & Grates",
    intro: [
      "Finish your bathroom or laundry with a waste as considered as the tiles around it: linear shower channel wastes, tile-insert and square floor wastes and grates, in brushed brass, copper, gunmetal and stainless steel. Choose a tile-insert waste to disappear into your floor, or a designer channel to make a feature of it.",
    ],
    metaTitle: "Shower & Floor Wastes & Grates | OnWood Tiles",
    metaDescription:
      "Shower channel wastes, tile-insert and square floor wastes and grates in brass, copper, gunmetal and stainless steel. Supply only from our Sunshine Coast showroom.",
    links: [
      { label: "Shop tapware", href: "/shop/tapware" },
      { label: "Shop tiles", href: "/shop/tiles" },
      { label: "Browse the gallery", href: "/gallery" },
    ],
    faqs: [
      { q: "What's the difference between a tile-insert waste and a standard floor waste?", a: "A tile-insert waste has a recessed tray you fill with your own floor tile, so the drain almost disappears into the floor. A standard floor waste or channel shows its metal finish as a deliberate design feature. It comes down to whether you want the drain to blend in or stand out." },
      { q: "What finishes do your wastes and grates come in?", a: "Brushed brass, copper, gunmetal and stainless steel, so you can match your tapware, tiles and the rest of your fittings." },
      { q: "Are your floor wastes suitable for laundries and outdoor areas?", a: "Yes. Our stainless steel options suit wet areas, laundries and outdoor spaces where durability matters most." },
      { q: "What size shower channel do I need?", a: "Channel length depends on your shower size and the floor fall. Bring your measurements into the Baringa showroom and we'll help you choose a length and finish that works." },
    ],
  },
  "stone-cladding": {
    eyebrow: "Shop stone cladding",
    h1: "Stone Cladding & Stone Veneer",
    intro: [
      "Add texture and warmth with our stone cladding and stone veneer, sourced and made right here in Australia. A lighter, faster way to bring the look of natural stone to a feature wall, facade, fireplace or outdoor area, in ledgestone, dry-stack and stacked-stone styles with matching corner pieces for a seamless finish.",
    ],
    metaTitle: "Stone Cladding & Veneer | Feature Walls | OnWood Tiles",
    metaDescription:
      "Australian-made stone cladding and veneer for feature walls, facades and fireplaces, in ledgestone, dry-stack and coastal looks. Supply only, Sunshine Coast.",
    links: [
      { label: "Browse the gallery", href: "/gallery?dept=stone" },
      { label: "Shop tiles", href: "/shop/tiles" },
    ],
    faqs: [
      { q: "Where can I use stone cladding?", a: "Feature walls, entry facades, fireplaces, outdoor kitchens, alfresco areas and retaining walls, indoors or out. Matching corner pieces let it wrap around edges for a seamless finish." },
      { q: "Is your stone cladding Australian-made?", a: "Yes. Our stone cladding and veneer is sourced and made right here in Australia, in natural-look ledgestone, dry-stack and stacked-stone styles." },
      { q: "How much stone cladding do I need?", a: "Measure your wall area in square metres and count your external corners separately, since corner pieces are ordered by length. Bring your measurements in and we'll help you work out the coverage." },
      { q: "Can stone cladding go on an existing wall?", a: "In many cases yes, with the right preparation and adhesive for the surface. Talk to us about your wall and we'll advise on what's needed." },
    ],
  },
  tapware: {
    eyebrow: "Shop tapware",
    h1: "Kitchen & Bathroom Tapware",
    intro: [
      "Pull the room together with tapware that matches your tiles and finishes: designer kitchen and bathroom mixer taps, including statement bridge mixers, in classic chrome, warm brushed brass and copper. Chosen to coordinate with our wastes, tiles and accessories so your fittings feel considered.",
    ],
    metaTitle: "Tapware | Kitchen & Bathroom Mixer Taps | OnWood",
    metaDescription:
      "Designer kitchen and bathroom tapware, including mixer taps and bridge mixers in chrome, brushed brass and copper. Supply only from our Sunshine Coast showroom.",
    links: [
      { label: "Shop wastes & grates", href: "/shop/wastes" },
      { label: "Shop tiles", href: "/shop/tiles" },
      { label: "Browse the gallery", href: "/gallery" },
    ],
    faqs: [
      { q: "What finishes does your tapware come in?", a: "Chrome, brushed brass and brushed copper, chosen to coordinate with our wastes, grates and tiles so your fittings feel like a set." },
      { q: "Do you have tapware for both the kitchen and bathroom?", a: "Yes. Our range covers kitchen mixers and statement bridge mixers as well as bathroom tapware, all in coordinating finishes." },
      { q: "Can you help me match tapware to my tiles?", a: "Absolutely. Bring your tile selections into the Baringa showroom and we'll help you coordinate finishes across your taps, wastes and tiles." },
      { q: "Are you supply only?", a: "Yes, we're supply only across the Sunshine Coast, with delivery to your suburb or collection from Baringa. We don't install, but we're always happy to help you choose." },
    ],
  },
};

// ---- async getters (constants today, CMS/OnBase later) ----
export async function getShopDetails(): Promise<ShopDetails> {
  return SHOP;
}

/** Per-department SEO intro content for /shop/[department] (null if none set). */
export async function getDepartmentSeo(slug: string): Promise<DepartmentSeo | null> {
  return DEPARTMENT_SEO[slug] ?? null;
}

// ---- Suburb / "areas we service" pages -------------------------------------
// Local landing pages for the Sunshine Coast suburbs we supply. The whole point
// (and the difference between "useful" and a Google doorway-spam page) is that
// each one is genuinely tailored to that suburb: real drive time + delivery, and
// tile guidance that fits the local homes and climate. Keyed by slug. Add a
// suburb by adding an entry (drop in the drive time, character + tailored copy).
export type SuburbSeo = {
  slug: string;
  name: string;
  driveMins: number; // approx drive from the Baringa showroom
  driveVia: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[]; // hero body (1-2 short paragraphs), speaks to the local customer
  /** Tailored "tiles that suit these homes" blocks - the genuinely-useful core. */
  guidance: { title: string; body: string; href: string; hrefLabel: string }[];
  faqs: { q: string; a: string }[];
  nearby: string[]; // surrounding suburbs this page also speaks to
  /** Master-planned estate (Aura, Harmony) rather than a distinct town. */
  estate?: boolean;
  /** Proximity overrides for estates where the showroom sits inside or beside the
   *  community, so the default "X minutes from Baringa" framing can be replaced
   *  with the true local story. Each falls back to the drive-time copy. */
  proximityChip?: string; // hero chip 2
  proximityCard?: { title: string; body: string }; // "why us" value card 2
  deliveryLine?: string; // delivery band paragraph
  showroomLine?: string; // closing "Showroom" card body
  /** Curated product slugs for "Popular for X" (ordered). Missing slugs are
   *  skipped and the grid is topped up with auto-picked coastal tiles, so a
   *  renamed or removed product never breaks the section. */
  popularSlugs?: string[];
  popularIntro?: string; // "Popular for X" section blurb
  guidanceIntro?: string; // "Tiles that suit X homes" section blurb
};

export const SUBURBS: Record<string, SuburbSeo> = {
  maroochydore: {
    slug: "maroochydore",
    name: "Maroochydore",
    popularSlugs: ["cabarita-612", "calcare-60-matt", "coastline-subway", "riviera-60-polished", "cottesloe-60", "formentera-45-in-out", "aspect-36-gloss", "cinerea-60"],
    popularIntro: "The coastal-friendly tiles our Maroochydore customers reach for, from beach-house floors to unit splashbacks. Every one is a real OnWood product with live availability.",
    guidanceIntro: "What actually works in a Maroochydore home, from salt-tough floors to easy-care apartment tiles. Follow a link to browse the exact range.",
    deliveryLine: "We run tiles up to Maroochydore, the beaches and the canal homes most weeks. Tell us your suburb for a delivery quote, or collect from the Baringa showroom about twenty minutes south.",
    driveMins: 20,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Maroochydore | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Maroochydore: porcelain, wood-look, outdoor and pool tiles built for coastal homes, with delivery to Maroochydore or pickup from Baringa, about 20 minutes away.",
    intro: [
      "Building or renovating in Maroochydore? OnWood Tiles is your local Sunshine Coast tile supplier, a short drive south in Baringa, and we deliver right across Maroochydore.",
      "From beachfront apartments and canal-front homes to family builds, we help you choose tiles made for coastal living: hard-wearing, low-maintenance and beautiful in the Queensland light.",
    ],
    guidance: [
      {
        title: "Built for the coast",
        body: "Salt air and humidity are hard on some surfaces. For Maroochydore's beachside and canal homes we lean on through-body porcelain: it shrugs off salt, moisture and UV where natural stone would need sealing and upkeep.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Alfresco entertaining and pools are a way of life here. We stock slip-rated (R11 and above) porcelain and textured finishes that stay safe underfoot around pools, patios and BBQ areas.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Light, coastal looks",
        body: "Wood-look planks, soft limestone-looks and crisp whites suit the relaxed coastal style of Maroochydore homes and apartments: warm underfoot, easy to keep, and they bounce the coastal light.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Apartments & renovations",
        body: "Renovating a unit or a bathroom? Large-format, rectified tiles make small coastal spaces feel bigger, and we supply the matching wastes, tapware and trims to finish the job in one place.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Maroochydore?", a: "Yes, we deliver across Maroochydore and the wider Sunshine Coast, just tell us your suburb for a delivery quote when you order. You're also welcome to collect from our Baringa showroom." },
      { q: "How far is your showroom from Maroochydore?", a: "Our Baringa showroom is about a 20-minute drive south of Maroochydore via the Sunshine Motorway, an easy trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles are best for a Maroochydore beach house or apartment?", a: "For coastal homes we recommend through-body porcelain: it handles salt air and humidity with almost no maintenance. Wood-look and light stone-looks suit the coastal style, and slip-rated porcelain is ideal for pools, balconies and alfresco areas." },
      { q: "Do you supply outdoor and pool tiles?", a: "Yes, slip-rated outdoor porcelain, pool-surround tiles and matching indoor tiles so your indoor-outdoor flow feels seamless." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Maroochydore project or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Maroochydore?", a: "Yes. As well as mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Mooloolaba", "Alexandra Headland", "Cotton Tree", "Kuluin", "Buderim", "Kawana", "Sippy Downs", "Bli Bli"],
  },

  aura: {
    slug: "aura",
    name: "Aura",
    popularSlugs: ["cabarita-60", "colonnade-60", "aspect-36-matt", "heartwood-212", "strata-60-matt", "cottesloe-60", "calcare-60-grip", "haven-45"],
    popularIntro: "A versatile starting palette for a new Aura home: hard-wearing floors, an easy splashback and a warm wood-look, all real OnWood products with live availability.",
    guidanceIntro: "Where new Aura homeowners and their builders usually start, from handover floors to alfresco. Follow a link to browse the exact range.",
    estate: true,
    driveMins: 2,
    driveVia: "the Sunshine Motorway",
    proximityChip: "Showroom right here in Aura",
    proximityCard: {
      title: "Your tile shop is in Aura",
      body: "Our showroom sits inside the Aura community at Baringa, so you can duck in between site visits, see full-size boards and carry samples home the same afternoon.",
    },
    deliveryLine: "We deliver right across Aura, Baringa, Nirimba, Banya and Bells Reach, or simply walk the full range in person, the showroom is only a few minutes from your build.",
    showroomLine: "Full-size boards, big-format samples and a coffee, right here in the Aura community at Baringa.",
    metaTitle: "Tile Shop Aura Baringa | Tiles for New Homes | OnWood Tiles",
    metaDescription:
      "OnWood Tiles is your local tile shop inside the Aura community at Baringa. Porcelain, wood-look and outdoor tiles for new builds and renovations across Nirimba, Banya and Bells Reach.",
    intro: [
      "Just moved into Aura, or building your new home here? OnWood Tiles is your neighbour, our showroom is right inside the community at Baringa, so choosing tiles is a five-minute job, not a trip up the coast.",
      "We help new Aura homeowners, renovators and boutique builders pick tiles that suit brand-new coastal homes: hard-wearing, low-maintenance and easy to live with, from floors and bathrooms to alfresco and pool areas.",
    ],
    guidance: [
      {
        title: "Finishing a new build",
        body: "Handover tiles, splashbacks, laundry and alfresco areas, the details that make a new Aura home feel like yours. We help you match floors, walls and outdoor tiles into one considered scheme.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Aura living is indoor-outdoor. We stock slip-rated (R11 and above) porcelain and textured finishes that stay safe underfoot around pools, patios and BBQ zones, and tie back to your inside floor.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "Large-format wall and floor tiles make compact new-build bathrooms feel bigger and are quicker for your tiler to lay, with fewer grout lines to keep clean. We carry the matching wastes and tapware too.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Working with a boutique builder or your own tiler? We supply the trade across Aura with trade pricing and online ordering, so your project team can order straight from our range.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Where is OnWood Tiles in relation to Aura?", a: "We're right inside the Aura community, our showroom is at Baringa, so it's only a few minutes from anywhere in Aura, Nirimba, Banya or Bells Reach. Pop in any time to see full-size boards and take samples home." },
      { q: "Do you deliver tiles in Aura?", a: "Yes, we deliver right across the Aura estate, or you can collect from the showroom since we're local, just tell us your street for a delivery quote." },
      { q: "I've just built in Aura, what tiles suit a new home here?", a: "For new coastal homes we lean on through-body porcelain: it handles salt air and humidity with almost no upkeep. Wood-look and light stone-looks suit the relaxed Aura style, and slip-rated porcelain is ideal for pools, balconies and alfresco areas." },
      { q: "Can you help match tiles across my whole house?", a: "Absolutely. Bring your plans or a photo into the showroom and we'll help you run a consistent look through floors, bathrooms, laundry, splashback and outdoor areas, with matching wastes, tapware and trims." },
      { q: "Do you supply tilers and builders in Aura?", a: "Yes. As well as retail customers we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Baringa", "Nirimba", "Banya", "Bells Reach", "Pelican Waters", "Little Mountain", "Caloundra", "Bells Creek"],
  },

  harmony: {
    slug: "harmony",
    name: "Harmony",
    popularSlugs: ["cottesloe-45", "alba-45", "haven-45", "peregian-45", "whitehaven-45", "relic-45", "formentera-45-matt", "cottesloe-45-grip"],
    popularIntro: "Affordable, everyday 450 x 450 tiles that suit a new Harmony home, easy to lay and easy to live with. Every one is a real OnWood product with live availability.",
    guidanceIntro: "Practical picks for a brand-new Harmony home, from open-plan floors to the splashback. Follow a link to browse the exact range.",
    deliveryLine: "We deliver right across the Harmony estate and Palmview. Tell us your street for a delivery quote, or collect from Baringa, about ten minutes south.",
    estate: true,
    driveMins: 10,
    driveVia: "the Bruce Highway",
    metaTitle: "Tile Shop Harmony Palmview | Tiles for New Homes | OnWood Tiles",
    metaDescription:
      "Local tile shop for the Harmony community at Palmview. Porcelain, wood-look and outdoor tiles for new builds and renovations, with delivery to Harmony or pickup from Baringa, about 10 minutes away.",
    intro: [
      "Building or just settled into Harmony at Palmview? OnWood Tiles is your local tile supplier, about ten minutes south at Baringa, and we deliver right across the Harmony estate.",
      "We help new Harmony homeowners, renovators and boutique builders choose tiles made for brand-new coastal homes: hard-wearing, low-maintenance and easy to live with, indoors and out.",
    ],
    guidance: [
      {
        title: "Finishing a new build",
        body: "Splashbacks, laundry, ensuites and alfresco, the finishing tiles that turn a new Harmony house into your home. We help you match floors, walls and outdoor tiles into one considered scheme.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Harmony is built for indoor-outdoor living. Slip-rated (R11 and above) porcelain and textured finishes stay safe around pools, patios and BBQ areas, and can flow from your inside floor straight out to the alfresco.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Kitchens & splashbacks",
        body: "A crisp splashback lifts a new kitchen. We stock gloss, matt and feature tiles that pair with your benchtop and cabinetry, plus the floor tiles to tie the open-plan living together.",
        href: "/shop/tiles?f=location-use:splashback",
        hrefLabel: "Splashback tiles",
      },
      {
        title: "For your builder or tiler",
        body: "If a boutique builder or your own tiler is doing the work, we supply the trade across Harmony with trade pricing and online ordering, so your project team can order straight from our range.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Harmony at Palmview?", a: "Yes, we deliver right across the Harmony estate and Palmview, just tell us your street for a delivery quote, or collect from our Baringa showroom about ten minutes away." },
      { q: "How far is your showroom from Harmony?", a: "About a ten-minute drive south via the Bruce Highway to Baringa, an easy trip to see full-size boards, big-format samples and take a few home." },
      { q: "I've just built in Harmony, what tiles suit a new home here?", a: "For new coastal homes we recommend through-body porcelain: it handles salt air and humidity with almost no upkeep. Wood-look and light stone-looks suit the relaxed Harmony style, and slip-rated porcelain is ideal for alfresco and pool areas." },
      { q: "Can you help me choose tiles for the whole house?", a: "Yes, bring your plans or a photo in and we'll help you run a consistent look through floors, bathrooms, laundry, splashback and outdoor areas, with matching wastes, tapware and trims." },
      { q: "Do you supply tilers and builders in Harmony?", a: "Yes. As well as retail customers we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Palmview", "Sippy Downs", "Meridan Plains", "Little Mountain", "Buderim", "Mooloolaba", "Caloundra"],
  },

  caloundra: {
    slug: "caloundra",
    name: "Caloundra",
    popularSlugs: ["cabarita-60", "calcare-60-matt", "coastline-subway", "aspect-36-gloss", "cottesloe-60", "strata-60-matt", "formentera-45-in-out", "riviera-60-matt"],
    popularIntro: "Coastal floors, easy-care splashbacks and slip-rated outdoor tiles our Caloundra customers reach for. Every one is a real OnWood product with live availability.",
    guidanceIntro: "What works in a Caloundra beach home or unit, from salt-tough floors to bathroom walls. Follow a link to browse the exact range.",
    deliveryLine: "Caloundra and the surrounding beaches are an easy run for us. Tell us your street for a delivery quote, or drop into the Baringa showroom, about twelve minutes up Caloundra Road.",
    driveMins: 12,
    driveVia: "Caloundra Road",
    metaTitle: "Tile Shop Caloundra | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Caloundra: porcelain, wood-look, outdoor and pool tiles for coastal homes and renovations, with delivery to Caloundra or pickup from Baringa, about 12 minutes away.",
    intro: [
      "Caloundra homes cop the salt air, and that is exactly what we plan around. OnWood Tiles is a Sunshine Coast tile shop about twelve minutes away at Baringa, and we deliver right across Caloundra.",
      "From beach-house renos and unit refreshes to new family homes, we help mum-and-dad renovators and boutique builders choose tiles made for coastal living: hard-wearing, low-maintenance and lovely in the Queensland light.",
    ],
    guidance: [
      {
        title: "Renovating a beach home or unit",
        body: "Caloundra's older beach homes and apartments renovate beautifully. Large-format, rectified tiles make compact spaces feel bigger and are faster to lay, with fewer grout lines to keep clean.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Salt air and bare feet are part of Caloundra life. We stock slip-rated (R11 and above) porcelain and textured finishes that stay safe around pools, patios and beachside courtyards.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "Redoing a bathroom is the classic Caloundra reno. We carry the wall and floor tiles, plus matching wastes and tapware, to finish an ensuite or main bathroom in one place.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Light, coastal looks",
        body: "Wood-look planks, soft limestone-looks and crisp whites suit relaxed Caloundra homes: warm underfoot, easy to keep and they bounce the coastal light around a room.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Caloundra?", a: "Yes, we deliver across Caloundra and the surrounding beaches, just tell us your suburb for a delivery quote, or collect from our Baringa showroom about twelve minutes away." },
      { q: "How far is your showroom from Caloundra?", a: "About a twelve-minute drive via Caloundra Road to Baringa, easy to pop in, see full-size boards and take samples home before you commit." },
      { q: "What tiles are best for a Caloundra beach house?", a: "Through-body porcelain is the pick: it handles salt air and humidity with almost no maintenance. Wood-look and light stone-looks suit the coastal style, and slip-rated porcelain is ideal for pools, courtyards and balconies." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Caloundra job or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Caloundra?", a: "Yes. As well as mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Golden Beach", "Kings Beach", "Moffat Beach", "Dicky Beach", "Currimundi", "Aroona", "Pelican Waters", "Little Mountain"],
  },

  "pelican-waters": {
    slug: "pelican-waters",
    name: "Pelican Waters",
    popularSlugs: ["arcadia-grande-612", "lustre-60-polished", "riviera-60-polished", "colonnade-612", "calcare-60-matt", "marchese-60-polished", "cuadrado-feature", "cabarita-612"],
    popularIntro: "The large-format and polished coastal tiles that suit premium Pelican Waters homes: calm, low-maintenance and beautifully understated. Every one is a real OnWood product with live availability.",
    guidanceIntro: "How to get the calm, high-end coastal look Pelican Waters is known for, inside and out. Follow a link to browse the exact range.",
    deliveryLine: "Pelican Waters is practically next door, so getting tiles to your build is simple. We will quote delivery to your street, or you can collect from the showroom just up the road at Baringa.",
    driveMins: 8,
    driveVia: "Pelican Waters Boulevard",
    metaTitle: "Tile Shop Pelican Waters | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Pelican Waters: large-format, wood-look and outdoor tiles for premium coastal homes and renovations, with delivery or pickup from nearby Baringa, about 8 minutes away.",
    intro: [
      "If you are building or renovating in Pelican Waters, your closest tile showroom is only up the road. OnWood Tiles is about eight minutes away at Baringa, and we deliver right across the estate.",
      "From canal-front builds to elegant renovations, we help homeowners and boutique builders choose tiles that suit premium coastal living: large-format porcelain, natural stone-looks and seamless indoor-outdoor floors.",
    ],
    guidance: [
      {
        title: "Large-format & seamless floors",
        body: "Pelican Waters homes love a calm, open look. Large-format rectified porcelain gives you fewer grout lines and a floor that carries from living to alfresco, easy to keep and beautifully understated.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Indoor-outdoor & pools",
        body: "With canals and pools everywhere here, we stock slip-rated (R11 and above) porcelain that matches your inside floor, so the transition from living room to poolside feels effortless and stays safe underfoot.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "For a resort-style ensuite we carry large-format wall and floor tiles, natural stone-looks and the matching wastes and tapware, so a premium Pelican Waters bathroom comes together in one place.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Most Pelican Waters projects run through a builder or tiler. We supply the trade locally with trade pricing and online ordering, so your project team can order from our range and match your selections exactly.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Pelican Waters?", a: "Yes, and we're only about eight minutes away at Baringa, so delivery to Pelican Waters is easy, or you can collect from the showroom. Just tell us your street for a delivery quote." },
      { q: "How far is your showroom from Pelican Waters?", a: "About eight minutes via Pelican Waters Boulevard to Baringa, the closest tile showroom to the estate, handy for seeing full-size boards and taking home samples." },
      { q: "What tiles suit a Pelican Waters home?", a: "Large-format through-body porcelain is the go: understated, low-maintenance and it handles salt air and humidity. Natural stone-looks and slip-rated outdoor porcelain work beautifully around canals and pools." },
      { q: "Can you help match tiles across a whole build?", a: "Yes, bring your plans or selections in and we'll help you run a consistent look through floors, bathrooms, laundry and outdoor areas, with matching wastes, tapware and trims." },
      { q: "Do you supply builders and tilers in Pelican Waters?", a: "Yes. We run a trade partner program for boutique builders and tilers, with trade pricing and online ordering, ideal for the custom builds common in Pelican Waters. Get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Golden Beach", "Caloundra", "Aura", "Baringa", "Little Mountain", "Bells Creek", "Currimundi"],
  },

  "golden-beach": {
    slug: "golden-beach",
    name: "Golden Beach",
    popularSlugs: ["whitehaven-45", "cinerea-60", "coastline-subway", "heartwood-212", "calcare-60-grip", "haven-45", "aspect-36-matt", "cabarita-60"],
    popularIntro: "Light, low-maintenance coastal tiles that suit a Golden Beach renovation, with slip-rated options for courtyards and pools. Every one is a real OnWood product with live availability.",
    guidanceIntro: "What holds up a few steps from the water at Golden Beach, from waterfront floors to outdoor areas. Follow a link to browse the exact range.",
    deliveryLine: "We drop tiles to homes right along Golden Beach and the passage. Give us your address for a delivery quote, or collect from Baringa, roughly twelve minutes away.",
    driveMins: 12,
    driveVia: "Caloundra Road",
    metaTitle: "Tile Shop Golden Beach | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Golden Beach: porcelain, wood-look and outdoor tiles for coastal homes and renovations, with delivery to Golden Beach or pickup from Baringa, about 12 minutes away.",
    intro: [
      "Renovating a home along Golden Beach? OnWood Tiles is your local tile supplier at Baringa, about twelve minutes away, and we deliver right across Golden Beach.",
      "The waterfront homes and older beach shacks here renovate beautifully. We help mum-and-dad renovators and boutique builders choose tiles made for salt air and bare feet: durable, low-maintenance and relaxed.",
    ],
    guidance: [
      {
        title: "Renovating a waterfront home",
        body: "Golden Beach's older homes are prime renovation territory. Wood-look and light stone-look porcelain refresh a tired floor and suit the laid-back waterfront style, warm underfoot and easy to keep.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Outdoor & courtyards",
        body: "Between the passage and the beach, outdoor living is everything here. Slip-rated (R11 and above) porcelain stays safe around courtyards, patios and pools and stands up to salt air where other surfaces struggle.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & laundries",
        body: "A bathroom or laundry refresh is the classic Golden Beach reno. We carry the wall and floor tiles, plus matching wastes and tapware, to finish the room without chasing parts around town.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Built for salt air",
        body: "Through-body porcelain shrugs off salt, moisture and UV where natural stone would need sealing and constant upkeep, the sensible choice for a home a few steps from the water.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Golden Beach?", a: "Yes, we deliver right across Golden Beach, just tell us your street for a delivery quote, or collect from our Baringa showroom about twelve minutes away." },
      { q: "How far is your showroom from Golden Beach?", a: "About a twelve-minute drive via Caloundra Road to Baringa, easy to pop in, see full-size boards and take samples home." },
      { q: "What tiles are best for a Golden Beach home?", a: "Through-body porcelain: it handles salt air and humidity with almost no maintenance. Wood-look and light stone-looks suit the waterfront style, and slip-rated porcelain is ideal for courtyards, patios and pools." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Golden Beach job or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders at Golden Beach?", a: "Yes. Alongside mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Caloundra", "Pelican Waters", "Kings Beach", "Currimundi", "Little Mountain", "Aroona", "Bells Creek"],
  },

  buderim: {
    slug: "buderim",
    name: "Buderim",
    popularSlugs: ["heartwood-212", "woodstock-212", "esplanade-60", "ironclad-612", "terroir-60", "esplanade-36", "seaglass-309x290", "marrakesh-decor"],
    popularIntro: "Warm wood-looks, earthy browns and honed stone-looks that suit Buderim's established homes and leafy blocks. Every one is a real OnWood product with live availability.",
    guidanceIntro: "What suits a Buderim renovation, from warm timber-look floors to a calm modern extension. Follow a link to browse the exact range.",
    deliveryLine: "We deliver up the hill to Buderim and the surrounding acreage. Send us your address for a delivery quote, or make the trip to Baringa to see everything full size, about twenty-two minutes via the Sunshine Motorway.",
    driveMins: 22,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Buderim | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Buderim: porcelain, wood-look, outdoor and feature tiles for renovations and new homes, with delivery to Buderim or pickup from Baringa, about 22 minutes away.",
    intro: [
      "From character Queenslanders to sharp new extensions, Buderim renovates like nowhere else on the coast. OnWood Tiles supplies the tiles, delivered from our Baringa showroom about twenty-two minutes away.",
      "Buderim's established homes and leafy acreage renovate into something special. We help homeowners and boutique builders choose tiles that balance warmth and durability, from character renos to modern extensions.",
    ],
    guidance: [
      {
        title: "Character renovations",
        body: "Buderim homes often mix old and new. Wood-look planks and honed stone-looks add warmth to a renovation, while large-format porcelain keeps open-plan living calm and easy to maintain.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Indoor-outdoor & alfresco",
        body: "With the views and the climate, Buderim living spills outside. Slip-rated (R11 and above) porcelain carries your inside floor out to decks, alfresco and pool areas and stays safe underfoot.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "A considered bathroom is worth doing once. We carry large-format wall and floor tiles, natural stone-looks and the matching wastes and tapware to pull a Buderim ensuite together.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Buderim renovations usually run through a builder or tiler. We supply the trade with trade pricing and online ordering, so your project team can order straight from our range and match your selections.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Buderim?", a: "Yes, we deliver right across Buderim and the surrounding suburbs, just tell us your street for a delivery quote, or collect from our Baringa showroom." },
      { q: "How far is your showroom from Buderim?", a: "About a twenty-two-minute drive via the Sunshine Motorway to Baringa, worth the trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles suit a Buderim renovation?", a: "It depends on the home, but wood-look and honed stone-look porcelain add warmth to a character reno, while large-format tiles keep modern extensions calm and low-maintenance. Slip-rated porcelain is ideal for decks and alfresco." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Buderim project or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Buderim?", a: "Yes. As well as retail customers we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Sippy Downs", "Mooloolaba", "Maroochydore", "Mountain Creek", "Forest Glen", "Alexandra Headland", "Kunda Park"],
  },
};

export const SUBURB_LIST: SuburbSeo[] = Object.values(SUBURBS);

/** Suburb landing-page content (null if we don't yet have a page for that slug). */
export async function getSuburb(slug: string): Promise<SuburbSeo | null> {
  return SUBURBS[slug] ?? null;
}
