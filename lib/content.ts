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
      { href: "/sunshine-coast", label: "Tiles Sunshine Coast" },
      { href: "/tile-shop", label: "Areas We Service" },
      { href: "/book", label: "Book a Visit" },
    ],
  },
  {
    title: "Popular tiles",
    links: [
      { href: "/tiles/outdoor", label: "Outdoor Tiles" },
      { href: "/tiles/timber-look", label: "Timber-Look Tiles" },
      { href: "/tiles/bathroom", label: "Bathroom Tiles" },
      { href: "/tiles/white", label: "White Tiles" },
      { href: "/tiles/floor", label: "Floor Tiles" },
      { href: "/tile-shops-near-me", label: "Tile Shops Near Me" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/magazine", label: "Kiln, Our Magazine" },
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
  ctaPrimary: { label: "Shop Now", href: "/shop/tiles" },
  ctaSecondary: { label: "Search by Inspiration", href: "/gallery" },
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
  p2: "Not just tiles: we help finish the job with the adhesives, trims, wastes and a select range of tapware to match. Honest advice from a local, family-run Sunshine Coast team with no franchise script, no pushy upsell.",
  stats: [
    { to: 450, suffix: "+", label: "Products to choose from", isPostcode: true },
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
      "Covers about 28.8m² of walls + 9m² of floor (approx 3×3m bathroom), wastage allowed",
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
    popularIntro: "The coastal-friendly tiles our Maroochydore customers reach for, from beach-house floors to unit splashbacks. Every one is a real OnWood product.",
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
    popularIntro: "A versatile starting palette for a new Aura home: hard-wearing floors, an easy splashback and a warm wood-look, all real OnWood products.",
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
    popularIntro: "Affordable, everyday 450 x 450 tiles that suit a new Harmony home, easy to lay and easy to live with. Every one is a real OnWood product.",
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
    popularIntro: "Coastal floors, easy-care splashbacks and slip-rated outdoor tiles our Caloundra customers reach for. Every one is a real OnWood product.",
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
    popularIntro: "The large-format and polished coastal tiles that suit premium Pelican Waters homes: calm, low-maintenance and beautifully understated. Every one is a real OnWood product.",
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
    popularIntro: "Light, low-maintenance coastal tiles that suit a Golden Beach renovation, with slip-rated options for courtyards and pools. Every one is a real OnWood product.",
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
        body: "A bathroom or laundry refresh is the classic Golden Beach reno. We carry the wall and floor tiles, plus matching wastes, trims and a select range of tapware, so more of the job comes from one place.",
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
    popularIntro: "Warm wood-looks, earthy browns and honed stone-looks that suit Buderim's established homes and leafy blocks. Every one is a real OnWood product.",
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

  mooloolaba: {
    slug: "mooloolaba",
    name: "Mooloolaba",
    popularSlugs: ["riviera-60-polished", "arcadia-60", "coastline-subway", "lustre-60-polished", "alabastro-60", "formentera-45-in-out", "aspect-36-gloss-wave", "cinerea-60"],
    popularIntro: "Easy-care coastal tiles our Mooloolaba customers choose for beachfront units, canal homes and holiday-let refreshes. Every one is a real OnWood product.",
    guidanceIntro: "What holds up in a home this close to the water, from unit floors to a bright splashback. Follow a link to browse the exact range.",
    deliveryLine: "We run tiles down to Mooloolaba, the Esplanade and the canal streets most weeks. Send your address for a delivery quote, or collect from Baringa, around twenty minutes south.",
    driveMins: 20,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Mooloolaba | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Mooloolaba: porcelain, wood-look, outdoor and pool tiles for beachfront homes, canal builds and apartment renovations, with delivery to Mooloolaba or pickup from Baringa.",
    intro: [
      "Mooloolaba lives half in and half out of the water, and its tiles have to keep up. OnWood Tiles is a Sunshine Coast tile shop about twenty minutes south at Baringa, and we deliver right across Mooloolaba.",
      "From beachfront apartments and canal-front homes to holiday-let refreshes, we help homeowners, investors and boutique builders pick tiles made for coastal living: hard-wearing, low-maintenance and lovely in the sea light.",
    ],
    guidance: [
      {
        title: "Apartments & unit renos",
        body: "Refreshing a Mooloolaba unit or holiday let? Large-format, rectified tiles make compact spaces feel bigger and are faster to lay, with fewer grout lines to keep clean between guests.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Balconies, canal decks and pools are part of Mooloolaba life. We stock slip-rated (R11 and above) porcelain and textured finishes that stay safe underfoot and shrug off salt where other surfaces struggle.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bright coastal splashbacks",
        body: "A crisp splashback lifts a beach-side kitchen or bathroom. We carry gloss subways, soft matt finishes and feature tiles that catch the light and pair with white or timber-look joinery.",
        href: "/shop/tiles?f=location-use:splashback",
        hrefLabel: "Splashback tiles",
      },
      {
        title: "Built for salt air",
        body: "Through-body porcelain handles salt, humidity and UV with almost no upkeep, the sensible pick for a home a few streets from the beach. It comes in polished, matt and wood-look finishes.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Mooloolaba?", a: "Yes, we deliver across Mooloolaba, the Esplanade and the canal streets, just tell us your suburb for a delivery quote when you order. You're also welcome to collect from our Baringa showroom." },
      { q: "How far is your showroom from Mooloolaba?", a: "About a twenty-minute drive south via the Sunshine Motorway to Baringa, an easy trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles suit a Mooloolaba apartment or beach house?", a: "Through-body porcelain is the pick: it handles salt air and humidity with almost no maintenance. Large-format tiles open up compact units, and slip-rated porcelain is ideal for balconies, canal decks and pool surrounds." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Mooloolaba job or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Mooloolaba?", a: "Yes. As well as homeowners and investors we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Alexandra Headland", "Buddina", "Minyama", "Mountain Creek", "Kawana", "Maroochydore", "Buderim"],
  },

  currimundi: {
    slug: "currimundi",
    name: "Currimundi",
    popularSlugs: ["cottesloe-60", "haven-45", "strata-60-matt", "cabarita-60", "calcare-60-grip", "aspect-36-matt", "relic-45", "heartwood-212"],
    popularIntro: "Durable, good-value tiles our Currimundi customers reach for when they refresh a family home. Every one is a real OnWood product.",
    guidanceIntro: "Sensible picks for a Currimundi family home, from hard-wearing floors to an easy bathroom. Follow a link to browse the exact range.",
    deliveryLine: "Currimundi is a quick run for us. Tell us your street for a delivery quote, or pick up from the Baringa showroom, about ten minutes away.",
    driveMins: 10,
    driveVia: "Nicklin Way",
    metaTitle: "Tile Shop Currimundi | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Currimundi: porcelain, wood-look, outdoor and bathroom tiles for family homes and renovations, with delivery to Currimundi or pickup from Baringa, about 10 minutes away.",
    intro: [
      "Between the lake and the beach, Currimundi is full of family homes getting a new lease of life. OnWood Tiles is your local tile supplier about ten minutes away at Baringa, and we deliver right across Currimundi.",
      "From bathroom and kitchen refreshes to whole-home renos, we help mum-and-dad renovators and boutique builders choose tiles that are tough, low-maintenance and easy to live with, day in and day out.",
    ],
    guidance: [
      {
        title: "Hard-wearing family floors",
        body: "A busy household floor takes a beating. Wood-look and stone-look porcelain handle kids, pets and sandy feet, stay warm underfoot and wipe clean, so a Currimundi living area still looks good years on.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Bathrooms & laundries",
        body: "A bathroom or laundry refresh is the classic Currimundi reno. We carry the wall and floor tiles, plus matching wastes, trims and a select range of tapware, so more of the job comes from one place.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "With the lake and beach on the doorstep, outdoor living matters here. Slip-rated (R11 and above) porcelain stays safe around patios, pools and BBQ zones and stands up to salt air.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Good value, well made",
        body: "You don't have to spend big to renovate well. We stock affordable everyday porcelain and ceramic alongside premium ranges, so you can match the tile to the room and the budget.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Currimundi?", a: "Yes, we deliver across Currimundi and the surrounding suburbs, just tell us your street for a delivery quote, or collect from our Baringa showroom about ten minutes away." },
      { q: "How far is your showroom from Currimundi?", a: "About a ten-minute drive via Nicklin Way to Baringa, easy to pop in, see full-size boards and take samples home before you commit." },
      { q: "What tiles suit a Currimundi family home?", a: "Wood-look and stone-look porcelain are ideal for busy family floors: tough, warm underfoot and easy to clean. For wet areas we recommend slip-rated finishes, and there are good-value ranges for a budget-friendly refresh." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Currimundi job or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Currimundi?", a: "Yes. As well as mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Little Mountain", "Aroona", "Caloundra", "Wurtulla", "Battery Hill", "Meridan Plains", "Kawana"],
  },

  "little-mountain": {
    slug: "little-mountain",
    name: "Little Mountain",
    popularSlugs: ["estella-60", "cabarita-60", "strata-60-matt", "cottesloe-45", "haven-30", "calcare-60-matt", "aspect-36-matt", "formentera-45-matt"],
    popularIntro: "Practical, low-maintenance tiles that suit a Little Mountain family home, easy to lay and easy to live with. Every one is a real OnWood product.",
    guidanceIntro: "Where Little Mountain families usually start, from open-plan floors to the bathroom. Follow a link to browse the exact range.",
    deliveryLine: "We deliver right across Little Mountain, and the showroom is only a few minutes down the road at Baringa if you would rather collect.",
    driveMins: 8,
    driveVia: "Caloundra Road",
    metaTitle: "Tile Shop Little Mountain | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Little Mountain: porcelain, wood-look and bathroom tiles for family homes and renovations, with delivery to Little Mountain or pickup from Baringa, only about 8 minutes away.",
    intro: [
      "Little Mountain is family-home country, and a good tile choice here is the one you never have to think about again. OnWood Tiles is only about eight minutes away at Baringa, and we deliver right across Little Mountain.",
      "From new family builds to bathroom and living-room refreshes, we help homeowners and boutique builders pick tiles that are hard-wearing, low-maintenance and easy on the eye in the Queensland light.",
    ],
    guidance: [
      {
        title: "Open-plan living floors",
        body: "One calm floor running through the living, kitchen and dining ties a family home together. Large-format porcelain gives you fewer grout lines and an easy-clean surface that copes with everyday life.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "Large-format wall and floor tiles make compact bathrooms feel bigger and are quicker for your tiler to lay, with fewer grout lines to keep clean. We carry the matching wastes and tapware too.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Outdoor & alfresco",
        body: "Family life spills out to the patio here. Slip-rated (R11 and above) porcelain carries your inside floor out to the alfresco and pool and stays safe underfoot in the wet.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Easy to look after",
        body: "Through-body porcelain wipes clean and needs no sealing, unlike natural stone, so a Little Mountain home stays looking sharp with next to no upkeep.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Little Mountain?", a: "Yes, we deliver right across Little Mountain, just tell us your street for a delivery quote, or collect from our Baringa showroom only a few minutes away." },
      { q: "How far is your showroom from Little Mountain?", a: "About an eight-minute drive via Caloundra Road to Baringa, close enough to pop in, see full-size boards and take samples home the same day." },
      { q: "What tiles suit a Little Mountain family home?", a: "Large-format porcelain is ideal for open-plan living: fewer grout lines and easy to clean. Wood-look finishes add warmth, and slip-rated porcelain suits alfresco and pool areas. For wet rooms we help you pick the right grip rating." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Little Mountain home or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Little Mountain?", a: "Yes. As well as families we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Caloundra", "Currimundi", "Meridan Plains", "Aroona", "Pelican Waters", "Baringa"],
  },

  "meridan-plains": {
    slug: "meridan-plains",
    name: "Meridan Plains",
    popularSlugs: ["colonnade-60", "cabarita-60", "strata-612-matt", "cottesloe-60", "calcare-60-grip", "haven-45", "aspect-36-gloss", "heartwood-212"],
    popularIntro: "A versatile starting palette for a newer Meridan Plains home: hard-wearing floors, an easy splashback and a warm wood-look. Every one is a real OnWood product.",
    guidanceIntro: "Where new Meridan Plains homeowners and their builders usually start, from handover floors to alfresco. Follow a link to browse the exact range.",
    deliveryLine: "Meridan Plains is just up the road, so delivery is easy and pickup from Baringa is barely ten minutes. Give us your street for a quote.",
    driveMins: 8,
    driveVia: "Caloundra Road",
    metaTitle: "Tile Shop Meridan Plains | Tiles for New Homes | OnWood Tiles",
    metaDescription:
      "Local tile shop for Meridan Plains: porcelain, wood-look and outdoor tiles for new builds and renovations, with delivery to Meridan Plains or pickup from Baringa, only about 8 minutes away.",
    intro: [
      "The newer estates around Meridan Plains are still finding their finishing touches, and that is where we come in. OnWood Tiles is only about eight minutes away at Baringa, and we deliver right across Meridan Plains.",
      "We help new homeowners, renovators and boutique builders pick tiles that suit brand-new coastal homes: hard-wearing, low-maintenance and easy to live with, from floors and bathrooms to alfresco and pool areas.",
    ],
    guidance: [
      {
        title: "Finishing a new build",
        body: "Handover tiles, splashbacks, laundry and alfresco, the details that make a new Meridan Plains home feel like yours. We help you match floors, walls and outdoor tiles into one considered scheme.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Large-format floors",
        body: "Large-format rectified porcelain keeps open-plan living calm, with fewer grout lines and an easy-clean surface. It is a popular choice for new homes across the Meridan estates.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "New homes here are built for indoor-outdoor living. Slip-rated (R11 and above) porcelain stays safe underfoot around pools, patios and BBQ zones and ties back to your inside floor.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Working with a boutique builder or your own tiler? We supply the trade across Meridan Plains with trade pricing and online ordering, so your project team can order straight from our range.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Meridan Plains?", a: "Yes, we deliver right across Meridan Plains, just tell us your street for a delivery quote, or collect from our Baringa showroom only a few minutes away." },
      { q: "How far is your showroom from Meridan Plains?", a: "About an eight-minute drive via Caloundra Road to Baringa, easy to pop in, see full-size boards and take samples home." },
      { q: "I've just built in Meridan Plains, what tiles suit a new home here?", a: "For new coastal homes we lean on through-body porcelain: it handles salt air and humidity with almost no upkeep. Large-format floors keep open-plan living calm, and slip-rated porcelain is ideal for alfresco and pool areas." },
      { q: "Can you help match tiles across my whole house?", a: "Yes, bring your plans or a photo in and we'll help you run a consistent look through floors, bathrooms, laundry, splashback and outdoor areas, with matching wastes, tapware and trims." },
      { q: "Do you supply tilers and builders in Meridan Plains?", a: "Yes. As well as retail customers we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Little Mountain", "Caloundra West", "Currimundi", "Baringa", "Aura", "Kawana"],
  },

  birtinya: {
    slug: "birtinya",
    name: "Birtinya",
    popularSlugs: ["arcadia-grande-612", "lustre-60-matt", "colonnade-612", "cabarita-612", "riviera-60-matt", "coastline-subway", "strata-612-matt", "cinerea-60"],
    popularIntro: "The contemporary large-format tiles that suit Birtinya's new waterfront homes, apartments and townhouses. Every one is a real OnWood product.",
    guidanceIntro: "How to get the crisp, contemporary look new Birtinya homes are built for, inside and out. Follow a link to browse the exact range.",
    deliveryLine: "We deliver across Birtinya and the Kawana suburbs, or collect from Baringa, around a twelve-minute drive. Send your address for a delivery quote.",
    driveMins: 12,
    driveVia: "Kawana Way",
    metaTitle: "Tile Shop Birtinya Kawana | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Birtinya and Kawana: large-format, wood-look and outdoor tiles for new waterfront homes, apartments and townhouses, with delivery or pickup from nearby Baringa.",
    intro: [
      "Birtinya has gone up fast, all waterfront apartments, townhouses and fresh family builds around the Kawana health hub. OnWood Tiles is about twelve minutes away at Baringa, and we deliver right across Birtinya and Kawana.",
      "We help new homeowners, investors and boutique builders choose tiles made for contemporary coastal living: large-format porcelain, crisp splashbacks and seamless indoor-outdoor floors that are easy to keep.",
    ],
    guidance: [
      {
        title: "Large-format & seamless floors",
        body: "New Birtinya homes suit a calm, open look. Large-format rectified porcelain gives you fewer grout lines and a floor that carries from living to balcony, easy to keep and beautifully understated.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Apartments & townhouses",
        body: "Fitting out or refreshing a unit? Large-format tiles open up compact spaces, and a light, consistent floor makes a townhouse feel bigger and brighter, and easier to lease or sell.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Balconies & outdoor",
        body: "With the lake and canals on the doorstep, outdoor living is everywhere here. Slip-rated (R11 and above) porcelain matches your inside floor and stays safe underfoot on balconies and around pools.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Most Birtinya projects run through a builder or tiler. We supply the trade locally with trade pricing and online ordering, so your project team can order from our range and match selections exactly.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Birtinya and Kawana?", a: "Yes, we deliver across Birtinya, Bokarina, Wurtulla, Warana and the Kawana suburbs, just tell us your street for a delivery quote, or collect from our Baringa showroom about twelve minutes away." },
      { q: "How far is your showroom from Birtinya?", a: "About a twelve-minute drive via Kawana Way to Baringa, handy for seeing full-size boards, big-format samples and taking a few home." },
      { q: "What tiles suit a new Birtinya home or apartment?", a: "Large-format through-body porcelain is the go: understated, low-maintenance and it handles salt air and humidity. It opens up apartments and townhouses, and slip-rated outdoor porcelain works on balconies and around pools." },
      { q: "Can you help match tiles across a whole build?", a: "Yes, bring your plans or selections in and we'll help you run a consistent look through floors, bathrooms, laundry and outdoor areas, with matching wastes, tapware and trims." },
      { q: "Do you supply builders and tilers around Kawana?", a: "Yes. We run a trade partner program for boutique builders and tilers, with trade pricing and online ordering, ideal for the new builds and unit fit-outs common around Birtinya. Get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Bokarina", "Wurtulla", "Warana", "Buddina", "Minyama", "Kawana", "Meridan Plains"],
  },

  "sippy-downs": {
    slug: "sippy-downs",
    name: "Sippy Downs",
    popularSlugs: ["estella-36", "cabarita-60", "strata-60-matt", "haven-45", "cottesloe-60", "aspect-36-matt", "calcare-60-matt", "peregian-45"],
    popularIntro: "Tough, easy-care tiles that suit a Sippy Downs family home or investment property. Every one is a real OnWood product.",
    guidanceIntro: "Practical picks for a Sippy Downs home, whether you live in it or lease it out. Follow a link to browse the exact range.",
    deliveryLine: "We deliver to Sippy Downs, Chancellor Park and the university end most weeks. Tell us your street for a quote, or collect from Baringa about fifteen minutes south.",
    driveMins: 15,
    driveVia: "the Bruce Highway",
    metaTitle: "Tile Shop Sippy Downs | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Sippy Downs: porcelain, wood-look and bathroom tiles for family homes, rentals and renovations, with delivery to Sippy Downs or pickup from Baringa, about 15 minutes away.",
    intro: [
      "From family homes to investment properties, Sippy Downs asks a lot of a floor, and we plan tiles around that. OnWood Tiles is about fifteen minutes away at Baringa, and we deliver right across Sippy Downs.",
      "Whether you are renovating to live or to lease, we help homeowners, investors and boutique builders choose tiles that are hard-wearing, low-maintenance and neutral enough to suit any tenant or buyer.",
    ],
    guidance: [
      {
        title: "Hard-wearing floors",
        body: "A home or rental floor needs to take everything and still look good. Wood-look and stone-look porcelain handle heavy traffic, wipe clean and never need sealing, so they hold up year after year.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Bathrooms & ensuites",
        body: "Bathrooms make or break a reno or a rental. We carry the wall and floor tiles, plus matching wastes and tapware, to finish a Sippy Downs bathroom cleanly and on budget.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Neutral, broad-appeal looks",
        body: "For a property you plan to lease or sell, neutral wins. Soft greys, warm beiges and light wood-looks suit any style and keep the home feeling fresh to the widest set of tenants and buyers.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Good value, well made",
        body: "You can renovate well without over-capitalising. We stock affordable everyday porcelain and ceramic alongside premium ranges, so you can match the tile to the room and the budget.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Sippy Downs?", a: "Yes, we deliver across Sippy Downs, Chancellor Park and Palmview, just tell us your street for a delivery quote, or collect from our Baringa showroom about fifteen minutes away." },
      { q: "How far is your showroom from Sippy Downs?", a: "About a fifteen-minute drive via the Bruce Highway to Baringa, an easy trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles suit a Sippy Downs rental or family home?", a: "Hard-wearing porcelain in neutral tones is ideal: it takes heavy traffic, wipes clean, never needs sealing and appeals to the widest set of tenants and buyers. We can point you to good-value ranges that still look the part." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Sippy Downs property or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Sippy Downs?", a: "Yes. As well as homeowners and investors we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Palmview", "Buderim", "Mountain Creek", "Chancellor Park", "Tanawha", "Mooloolaba"],
  },

  "alexandra-headland": {
    slug: "alexandra-headland",
    name: "Alexandra Headland",
    popularSlugs: ["riviera-60-polished", "lustre-60-polished", "coastline-subway", "arcadia-60", "marchese-60-polished", "formentera-45-in-out", "cinerea-60", "aspect-36-gloss"],
    popularIntro: "Refined coastal tiles our Alexandra Headland customers choose for beachside units and premium home renovations. Every one is a real OnWood product.",
    guidanceIntro: "How to get a calm, high-end beach look at Alex that still copes with the salt. Follow a link to browse the exact range.",
    deliveryLine: "We bring tiles down to Alex and the headland streets regularly. Send your address for a delivery quote, or collect from the Baringa showroom, around twenty minutes away.",
    driveMins: 20,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Alexandra Headland | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Alexandra Headland: porcelain, polished, wood-look and outdoor tiles for beachside units and premium renovations, with delivery to Alex or pickup from Baringa.",
    intro: [
      "Alex is beachfront living at its most relaxed, and the renovations here reward tiles that can take the salt. OnWood Tiles is about twenty minutes south at Baringa, and we deliver right across Alexandra Headland.",
      "From beachside apartments to premium home renos, we help homeowners and boutique builders choose tiles that suit refined coastal living: polished and large-format porcelain, natural stone-looks and seamless indoor-outdoor floors.",
    ],
    guidance: [
      {
        title: "Premium beach-house renos",
        body: "Alex renovations often aim high. Polished and large-format porcelain, plus natural stone-looks, give a calm, luxe finish that handles salt air far better than the real stone it imitates.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Apartments & unit renos",
        body: "Refreshing a beachfront unit? Large-format, rectified tiles make compact spaces feel bigger and brighter, with fewer grout lines to keep clean between the beach and the balcony.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Outdoor & pool areas",
        body: "Balconies and pools are the whole point at Alex. We stock slip-rated (R11 and above) porcelain that matches your inside floor and stays safe underfoot where the salt and water meet.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bright coastal splashbacks",
        body: "A crisp splashback lifts a beach-side kitchen or bathroom. We carry gloss subways and feature tiles that catch the coastal light and pair beautifully with white and timber-look joinery.",
        href: "/shop/tiles?f=location-use:splashback",
        hrefLabel: "Splashback tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Alexandra Headland?", a: "Yes, we deliver across Alexandra Headland and the surrounding beaches, just tell us your suburb for a delivery quote, or collect from our Baringa showroom about twenty minutes away." },
      { q: "How far is your showroom from Alexandra Headland?", a: "About a twenty-minute drive south via the Sunshine Motorway to Baringa, an easy trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles suit a premium Alex renovation?", a: "Polished and large-format through-body porcelain and natural stone-looks give a calm, high-end finish while handling salt air with almost no upkeep. Slip-rated outdoor porcelain works on balconies and around pools." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Alexandra Headland job or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Alexandra Headland?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Mooloolaba", "Maroochydore", "Buddina", "Cotton Tree", "Minyama", "Buderim"],
  },

  "coolum-beach": {
    slug: "coolum-beach",
    name: "Coolum Beach",
    popularSlugs: ["heartwood-212", "cabarita-60", "calcare-60-grip", "esplanade-36", "whitehaven-45", "coastline-subway", "cinerea-60", "formentera-45-in-out"],
    popularIntro: "Easy, sun-washed tiles that suit a laid-back Coolum home, with slip-rated options for the outdoor areas. Every one is a real OnWood product.",
    guidanceIntro: "What works in a relaxed Coolum beach home, from wood-look floors to the alfresco. Follow a link to browse the exact range.",
    deliveryLine: "Coolum is a comfortable delivery run for us up the Sunshine Motorway. Tell us your address for a quote, and if you would like to see boards full size the Baringa showroom is worth the trip.",
    driveMins: 35,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Coolum Beach | Tiles + Sunshine Coast Delivery | OnWood Tiles",
    metaDescription:
      "Tiles for Coolum Beach homes and renovations, delivered: porcelain, wood-look, outdoor and pool tiles built for coastal living, from OnWood Tiles at Baringa on the Sunshine Coast.",
    intro: [
      "Coolum keeps things laid-back, and its homes look best in easy, sun-washed tiles that shrug off the salt. OnWood Tiles delivers to Coolum from our Baringa showroom on the southern Sunshine Coast.",
      "From beach-house renos to new builds, we help homeowners and boutique builders choose tiles made for the coast: hard-wearing, low-maintenance and relaxed, with the wood-looks and light stone-looks that suit Coolum style.",
    ],
    guidance: [
      {
        title: "Relaxed coastal floors",
        body: "Wood-look and light stone-look porcelain suit the easy Coolum vibe: warm underfoot, easy to keep and they bounce the beach light around a room. They shrug off sandy feet where timber would mark.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Outdoor & pool areas",
        body: "Beach-house life is mostly outdoors here. Slip-rated (R11 and above) porcelain stays safe around patios, pools and outdoor showers and stands up to salt air where other surfaces struggle.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Bathrooms & laundries",
        body: "A bathroom or laundry refresh is the classic Coolum reno. We carry the wall and floor tiles, plus matching wastes and tapware, so the room comes together in one delivery.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Built for salt air",
        body: "Through-body porcelain shrugs off salt, moisture and UV where natural stone would need sealing and constant upkeep, the sensible choice for a home this close to the surf.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Coolum Beach?", a: "Yes, we deliver to Coolum Beach and the northern beaches from our Baringa base, just tell us your street for a delivery quote. You're also welcome to visit the showroom to choose in person first." },
      { q: "How far is your showroom from Coolum?", a: "About a thirty-five-minute drive south via the Sunshine Motorway to Baringa. Many Coolum customers have their tiles delivered, though the trip is worth it to see full-size boards and take samples home." },
      { q: "What tiles suit a Coolum beach house?", a: "Through-body porcelain is the pick: it handles salt air and humidity with almost no maintenance. Wood-look and light stone-looks suit the relaxed Coolum style, and slip-rated porcelain is ideal for patios, pools and outdoor showers." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Coolum project." },
      { q: "Do you supply tilers and builders at Coolum?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Peregian Beach", "Marcoola", "Yaroomba", "Mount Coolum", "Point Arkwright", "Maroochydore"],
  },

  noosaville: {
    slug: "noosaville",
    name: "Noosaville",
    popularSlugs: ["arcadia-grande-612", "lustre-60-polished", "hakkari-natural-stone-tile", "colonnade-612", "marchese-60-polished", "riviera-60-polished", "alabastro-60", "ironclad-612"],
    popularIntro: "The calm, natural and large-format tiles that suit Noosa's premium coastal homes. Every one is a real OnWood product.",
    guidanceIntro: "How to get the understated, high-end Noosa look, inside and out. Follow a link to browse the exact range.",
    deliveryLine: "We deliver right up to Noosa and Noosaville. Given the distance most Noosa customers have their tiles delivered, though you are always welcome to visit the Baringa showroom to choose in person first.",
    driveMins: 50,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Noosa & Noosaville | Tiles Delivered | OnWood Tiles",
    metaDescription:
      "Tiles for Noosa and Noosaville homes and renovations, delivered: large-format, natural stone-look, polished and outdoor tiles for premium coastal living, from OnWood Tiles on the Sunshine Coast.",
    intro: [
      "Noosa sets the bar for coastal style on this coast, and the tiles that suit it are calm, natural and beautifully made. OnWood Tiles delivers to Noosa and Noosaville from our Sunshine Coast showroom at Baringa.",
      "From Hastings Street apartments to riverfront and Hamptons-style homes, we help homeowners and boutique builders choose tiles for premium coastal living: large-format porcelain, natural stone-looks and seamless indoor-outdoor floors.",
    ],
    guidance: [
      {
        title: "Large-format & natural looks",
        body: "The Noosa look is understated. Large-format porcelain and natural stone-looks give a calm, seamless floor with fewer grout lines, all the warmth of stone and none of the sealing and upkeep.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Indoor-outdoor & pools",
        body: "Noosa living flows straight outside. We stock slip-rated (R11 and above) porcelain that matches your inside floor, so the transition from living room to deck and pool feels effortless and stays safe underfoot.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Resort-style bathrooms",
        body: "For a Noosa ensuite we carry large-format wall and floor tiles, natural stone-looks and the matching wastes and tapware, so a resort-style bathroom comes together in one considered scheme.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "For your builder or tiler",
        body: "Most Noosa projects run through an architect, builder or tiler. We supply the trade with trade pricing and online ordering, so your project team can order from our range and match your selections exactly.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Noosa and Noosaville?", a: "Yes, we deliver right up to Noosa, Noosaville, Noosa Heads and the surrounding beaches from our Baringa base, just tell us your street for a delivery quote." },
      { q: "How far is your showroom from Noosa?", a: "About a fifty-minute drive south via the Sunshine Motorway to Baringa. Most Noosa customers have their tiles delivered, though you're welcome to visit the showroom to see full-size boards and choose in person first." },
      { q: "What tiles suit a premium Noosa home?", a: "Large-format through-body porcelain and natural stone-looks give the calm, understated Noosa look while handling salt air with almost no upkeep. Slip-rated outdoor porcelain works beautifully around decks and pools." },
      { q: "Can you help match tiles across a whole build?", a: "Yes, send your plans or selections and we'll help you run a consistent look through floors, bathrooms, laundry and outdoor areas, with matching wastes, tapware and trims, then deliver to Noosa." },
      { q: "Do you supply builders and tilers in Noosa?", a: "Yes. We run a trade partner program for boutique builders and tilers, with trade pricing and online ordering, ideal for the custom builds common in Noosa. Get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Noosa Heads", "Tewantin", "Sunshine Beach", "Sunrise Beach", "Peregian Beach", "Cooroy"],
  },

  nambour: {
    slug: "nambour",
    name: "Nambour",
    popularSlugs: ["heartwood-212", "cottesloe-45", "esplanade-36", "haven-45", "cabarita-60", "marrakesh-decor", "relic-45", "aspect-36-matt"],
    popularIntro: "Warm, good-value tiles that suit a Nambour character home or a budget-conscious reno. Every one is a real OnWood product.",
    guidanceIntro: "What suits a Nambour Queenslander or hinterland home, from warm timber-look floors to a value bathroom. Follow a link to browse the exact range.",
    deliveryLine: "We deliver out to Nambour and the surrounding hinterland towns. Send your address for a delivery quote, or make the trip down to Baringa to see everything full size.",
    driveMins: 30,
    driveVia: "the Bruce Highway",
    metaTitle: "Tile Shop Nambour | Tiles + Hinterland Delivery | OnWood Tiles",
    metaDescription:
      "Tiles for Nambour homes and renovations, delivered: porcelain, wood-look and value bathroom tiles for character Queenslanders and hinterland homes, from OnWood Tiles at Baringa.",
    intro: [
      "Nambour is Queenslander country, full of character homes that renovate into something special on a sensible budget. OnWood Tiles delivers to Nambour from our Baringa showroom on the southern Sunshine Coast.",
      "From timber Queenslanders to newer family homes, we help mum-and-dad renovators and boutique builders choose tiles that add warmth and last: hard-wearing, low-maintenance and kind to the budget.",
    ],
    guidance: [
      {
        title: "Character renovations",
        body: "Nambour's Queenslanders take beautifully to warm tiles. Wood-look planks and earthy stone-looks add character to a renovation, while large-format porcelain keeps an open-plan extension calm and easy to maintain.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Value bathrooms & laundries",
        body: "Redoing a bathroom or laundry is the classic Nambour reno. We carry good-value wall and floor tiles, plus matching wastes and tapware, so you finish the room well without overspending.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Hard-wearing floors",
        body: "Wood-look and stone-look porcelain handle a busy household, wipe clean and never need sealing, so a Nambour family floor still looks good years down the track, whatever the weather does.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Good value, well made",
        body: "You don't have to spend big to renovate well. We stock affordable everyday porcelain and ceramic alongside premium ranges, so you can match the tile to the room and the budget.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Nambour?", a: "Yes, we deliver to Nambour and the surrounding hinterland towns from our Baringa base, just tell us your street for a delivery quote. You're also welcome to visit the showroom to choose in person first." },
      { q: "How far is your showroom from Nambour?", a: "About a thirty-minute drive south via the Bruce Highway to Baringa. Many Nambour customers have their tiles delivered, though the trip is worth it to see full-size boards and take samples home." },
      { q: "What tiles suit a Nambour Queenslander?", a: "Warm wood-look and earthy stone-look porcelain add character to a renovation, while large-format tiles keep modern extensions calm and low-maintenance. We can point you to good-value ranges that still look the part." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Nambour project." },
      { q: "Do you supply tilers and builders in Nambour?", a: "Yes. As well as mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Woombye", "Palmwoods", "Yandina", "Bli Bli", "Burnside", "Kulangoor", "Nambour Heights"],
  },

  palmwoods: {
    slug: "palmwoods",
    name: "Palmwoods",
    popularSlugs: ["woodstock-212", "terroir-60", "esplanade-60", "graniglia-60-matt", "cottesloe-60", "marrakesh-decor", "calcare-60-grip", "hakkari-natural-stone-tile"],
    popularIntro: "Warm, natural tiles that suit Palmwoods acreage, cottages and new hinterland builds. Every one is a real OnWood product.",
    guidanceIntro: "What suits a Palmwoods home, from warm timber-look floors to an alfresco that copes with hinterland weather. Follow a link to browse the exact range.",
    deliveryLine: "We deliver up to Palmwoods and the nearby hinterland villages. Tell us your address for a quote, or come down to the Baringa showroom to see boards and samples in person.",
    driveMins: 25,
    driveVia: "the Bruce Highway",
    metaTitle: "Tile Shop Palmwoods | Tiles + Hinterland Delivery | OnWood Tiles",
    metaDescription:
      "Tiles for Palmwoods homes, acreage and renovations, delivered: warm wood-look, natural stone-look and outdoor tiles for hinterland living, from OnWood Tiles at Baringa on the Sunshine Coast.",
    intro: [
      "Up in the green behind the coast, Palmwoods mixes acreage, cottages and new builds, and warm, natural tiles suit all three. OnWood Tiles delivers to Palmwoods from our Baringa showroom down on the coast.",
      "From character cottages to modern acreage homes, we help homeowners and boutique builders choose tiles that balance warmth and durability: wood-looks, natural stone-looks and slip-rated outdoor porcelain for the hinterland climate.",
    ],
    guidance: [
      {
        title: "Warm, natural floors",
        body: "Wood-look planks and earthy stone-look porcelain suit the Palmwoods setting: warm underfoot, easy to keep and full of character, with none of the sealing and marking of real timber or stone.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Verandahs & alfresco",
        body: "Hinterland living is all about the verandah and the view. Slip-rated (R11 and above) porcelain carries your inside floor out to decks and alfresco and stays safe underfoot through the dew and rain.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Character renovations",
        body: "Palmwoods cottages renovate beautifully. We carry the wall and floor tiles, feature tiles and matching wastes and tapware to give a hinterland home warmth without losing its character.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Built to last",
        body: "Through-body porcelain shrugs off moisture, wear and temperature swings where natural stone would need sealing and upkeep, a sensible choice for an acreage home working hard through every season.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Palmwoods?", a: "Yes, we deliver to Palmwoods and the nearby hinterland villages from our Baringa base, just tell us your street for a delivery quote. You're also welcome to visit the showroom to choose in person first." },
      { q: "How far is your showroom from Palmwoods?", a: "About a twenty-five-minute drive down via the Bruce Highway to Baringa, an easy enough trip to see full-size boards, big-format samples and take a few home." },
      { q: "What tiles suit a Palmwoods home?", a: "Warm wood-look and natural stone-look porcelain suit the hinterland setting and add character, while slip-rated outdoor porcelain handles verandahs and alfresco through the dew and rain. Everything is low-maintenance and hard-wearing." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Palmwoods project." },
      { q: "Do you supply tilers and builders in Palmwoods?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Woombye", "Nambour", "Chevallum", "Hunchy", "Buderim", "Eudlo", "Mooloolah Valley"],
  },

  maleny: {
    slug: "maleny",
    name: "Maleny",
    popularSlugs: ["hakkari-natural-stone-tile", "terroir-60", "heartwood-212", "marrakesh-decor", "esplanade-36", "cortile", "contour-60", "woodstock-212"],
    popularIntro: "Warm, grounded tiles that suit the character cottages and modern retreats of Maleny and Montville. Every one is a real OnWood product.",
    guidanceIntro: "What suits a home up in the cool hinterland air, from warm floors to a character feature wall. Follow a link to browse the exact range.",
    deliveryLine: "We deliver up the range to Maleny and Montville. Most hinterland customers have their tiles delivered, and you are welcome to visit Baringa first to choose from full-size boards.",
    driveMins: 40,
    driveVia: "Landsborough",
    metaTitle: "Tile Shop Maleny & Montville | Tiles Delivered | OnWood Tiles",
    metaDescription:
      "Tiles for Maleny and Montville homes and renovations, delivered: warm wood-look, natural stone-look and feature tiles for hinterland cottages and retreats, from OnWood Tiles on the Sunshine Coast.",
    intro: [
      "Maleny and Montville sit up in the cool hinterland air, where character cottages and modern retreats call for warm, grounded tiles. OnWood Tiles delivers up the range from our Baringa showroom on the coast.",
      "From heritage cottages to architect-designed retreats, we help homeowners and boutique builders choose tiles that suit the hinterland: warm wood-looks, natural stone-looks and character features that feel right in the green.",
    ],
    guidance: [
      {
        title: "Warm, grounded floors",
        body: "Up in the cool air, warmth matters. Wood-look planks and natural stone-look porcelain feel right underfoot in a Maleny home and carry character through the living areas without the upkeep of timber or stone.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Character feature walls",
        body: "A cottage or retreat loves a feature. We carry handmade-look, brick-look and stone-look feature tiles that add texture and warmth to a fireplace wall, a kitchen or a hinterland bathroom.",
        href: "/shop/tiles?f=location-use:wall",
        hrefLabel: "Wall tiles",
      },
      {
        title: "Verandahs & alfresco",
        body: "Hinterland living is built around the view. Slip-rated (R11 and above) porcelain carries your inside floor out to decks and verandahs and stays safe underfoot through the mist, dew and rain.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Built for the climate",
        body: "Through-body porcelain handles moisture and temperature swings far better than natural stone, which needs sealing and care, so a Maleny or Montville home stays looking good through every season.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Maleny and Montville?", a: "Yes, we deliver up the range to Maleny, Montville and the surrounding hinterland from our Baringa base, just tell us your street for a delivery quote." },
      { q: "How far is your showroom from Maleny?", a: "About a forty-minute drive up the range from Baringa. Most hinterland customers have their tiles delivered, though you're welcome to visit the showroom first to see full-size boards and choose in person." },
      { q: "What tiles suit a Maleny or Montville home?", a: "Warm wood-look and natural stone-look porcelain suit the hinterland character, and handmade-look or brick-look feature tiles add texture to a cottage or retreat. Slip-rated outdoor porcelain handles verandahs through the mist and rain." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Maleny or Montville project." },
      { q: "Do you supply tilers and builders in the Maleny hinterland?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Montville", "Mapleton", "Witta", "Conondale", "Landsborough", "Mooloolah Valley", "Flaxton"],
  },

  beerwah: {
    slug: "beerwah",
    name: "Beerwah",
    popularSlugs: ["heartwood-212", "esplanade-60", "cabarita-60", "strata-60-matt", "calcare-60-grip", "colonnade-60", "haven-45", "terroir-60"],
    popularIntro: "The hard-wearing floors and warm wood-looks Beerwah homeowners and their builders reach for, from town homes to acreage. Every one is a real OnWood product.",
    guidanceIntro: "What actually works in a Beerwah home or on an acreage block, from tough floors to alfresco. Follow a link to browse the exact range.",
    deliveryLine: "We run tiles down Steve Irwin Way to Beerwah and the hinterland most weeks. Tell us your suburb for a delivery quote, or collect from the Baringa showroom about 15 minutes away.",
    driveMins: 15,
    driveVia: "Steve Irwin Way",
    metaTitle: "Tile Shop Beerwah | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Beerwah: hard-wearing porcelain, wood-look, outdoor and pool tiles for hinterland homes and acreage, with delivery to Beerwah or pickup from Baringa, about 15 minutes away.",
    intro: [
      "Building or renovating around Beerwah? OnWood Tiles is a quick run down Steve Irwin Way in Baringa, and we deliver right across Beerwah and the surrounding hinterland.",
      "From town homes to acreage blocks and sheds, we help you choose tiles that earn their keep: hard-wearing, low-maintenance porcelain that handles busy family life and the odd muddy boot.",
    ],
    guidance: [
      {
        title: "Made for busy, practical homes",
        body: "Beerwah homes cop plenty of foot traffic, pets and the odd muddy boot. Through-body porcelain floors take it all in their stride and wipe clean, with none of the sealing a timber or natural-stone floor needs.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Acreage, sheds & alfresco",
        body: "Big blocks mean big outdoor areas. We stock slip-rated (R11 and above) porcelain for patios, pool surrounds, sheds and outdoor kitchens that stays safe and solid underfoot in all weather.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Warm wood-look floors",
        body: "For a relaxed hinterland feel, wood-look planks bring the warmth of timber to living areas and verandahs without the upkeep, and they suit both a new build and an older Beerwah home.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "One stop for the whole job",
        body: "Floors, bathroom walls, splashbacks, laundry and the matching wastes and tapware, all from one place, so your Beerwah project comes together without chasing parts across town.",
        href: "/shop",
        hrefLabel: "Shop everything",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Beerwah?", a: "Yes, we deliver across Beerwah and the surrounding hinterland, just tell us your street for a delivery quote when you order. You're also welcome to collect from our Baringa showroom." },
      { q: "How far is your showroom from Beerwah?", a: "About a 15-minute drive down Steve Irwin Way from Beerwah to our Baringa showroom, an easy trip to see full-size boards and take a few samples home." },
      { q: "What tiles suit a Beerwah home or acreage block?", a: "Hard-wearing through-body porcelain floors handle busy family and acreage life with almost no upkeep. Wood-look planks add warmth, and slip-rated outdoor porcelain is ideal for patios, sheds and pool surrounds." },
      { q: "Do you supply outdoor and pool tiles?", a: "Yes, slip-rated outdoor porcelain, pool-surround tiles and matching indoor tiles so your alfresco flows naturally from inside." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Beerwah project or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Beerwah?", a: "Yes. Alongside homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Glass House Mountains", "Landsborough", "Peachester", "Beerburrum", "Mooloolah Valley", "Caloundra"],
  },

  landsborough: {
    slug: "landsborough",
    name: "Landsborough",
    popularSlugs: ["cottesloe-60", "heartwood-212", "coastline-subway", "cabarita-60", "alba-45", "haven-45", "esplanade-36", "calcare-60-matt"],
    popularIntro: "Classic whites and warm timber-looks that suit Landsborough's character homes and new estates alike. Every one is a real OnWood product.",
    guidanceIntro: "What suits a Landsborough home, whether you're renovating a Queenslander or building fresh. Follow a link to browse the exact range.",
    deliveryLine: "We deliver into Landsborough and the hinterland most weeks. Tell us your suburb for a delivery quote, or collect from the Baringa showroom about 15 minutes down Steve Irwin Way.",
    driveMins: 15,
    driveVia: "Steve Irwin Way",
    metaTitle: "Tile Shop Landsborough | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your local tile shop for Landsborough: classic white, wood-look and outdoor tiles for character homes and new estates, with delivery to Landsborough or pickup from Baringa, about 15 minutes away.",
    intro: [
      "Renovating a character home or building in one of Landsborough's new estates? OnWood Tiles is just down Steve Irwin Way in Baringa, and we deliver right across town.",
      "Landsborough mixes old Queenslanders with brand-new builds, so we help you choose tiles that suit either: classic whites and warm timber-looks for character homes, and clean, durable porcelain for new estate living.",
    ],
    guidance: [
      {
        title: "Renovating a character home",
        body: "Older Landsborough homes suit a classic look. Crisp white floor tiles and subway-style splashbacks keep the character while giving you a hard-wearing, easy-care surface that a timber floor can't.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "New estate builds",
        body: "Building fresh? Large-format rectified porcelain lays fast with fewer grout lines, makes rooms feel bigger and ties your floors, bathrooms and alfresco into one clean scheme.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Warm timber-look floors",
        body: "Wood-look planks bring warmth to a Queenslander's living areas or a new build's open plan, with the durability of porcelain and none of timber's sanding, sealing or water worries.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Verandahs & outdoor",
        body: "Landsborough living spills onto the verandah. Slip-rated (R11 and above) porcelain carries your inside floor out to decks, patios and pool areas and stays safe underfoot through dew and rain.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Landsborough?", a: "Yes, we deliver across Landsborough and the surrounding hinterland, just tell us your street for a delivery quote. You're welcome to collect from Baringa too." },
      { q: "How far is your showroom from Landsborough?", a: "About a 13 to 15-minute drive down Steve Irwin Way from Landsborough to our Baringa showroom, easy to pop in for full-size boards and samples." },
      { q: "What tiles suit a Landsborough home?", a: "For character Queenslanders, classic white floors and subway splashbacks keep the era right while wearing far better than timber. New estate homes suit large-format porcelain, and wood-look planks add warmth to either." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Landsborough project or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Landsborough?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Beerwah", "Mooloolah Valley", "Glass House Mountains", "Peachester", "Maleny", "Caloundra"],
  },

  "glass-house-mountains": {
    slug: "glass-house-mountains",
    name: "Glass House Mountains",
    popularSlugs: ["calcare-60-grip", "strata-60-grip", "colonnade-612", "cabarita-612", "graniglia-60-grip", "ironclad-612", "terroir-60", "woodstock-212"],
    popularIntro: "Tough outdoor porcelain and earthy stone-looks built for acreage living, big alfresco areas and sheds. Every one is a real OnWood product.",
    guidanceIntro: "What stands up to acreage life around the Glass House Mountains, from alfresco to sheds. Follow a link to browse the exact range.",
    deliveryLine: "Most Glass House Mountains customers have their tiles delivered to the block. Tell us your street for a delivery quote, or visit the Baringa showroom about twenty minutes down Steve Irwin Way to choose in person.",
    driveMins: 20,
    driveVia: "Steve Irwin Way",
    metaTitle: "Tile Shop Glass House Mountains | Tiles Delivered | OnWood Tiles",
    metaDescription:
      "Tiles for Glass House Mountains homes and acreage: tough outdoor porcelain, earthy stone-looks and wood-looks for big alfresco areas, sheds and pools, delivered from OnWood Tiles at Baringa.",
    intro: [
      "Out on the acreage around the Glass House Mountains, homes are built for big skies, big blocks and big alfresco living. OnWood Tiles delivers tough, good-looking tiles from our Baringa showroom, about twenty minutes down Steve Irwin Way.",
      "From rural-residential builds to sheds, pool areas and outdoor kitchens, we help you choose earthy, hard-wearing porcelain that suits the landscape and stands up to everything acreage life throws at it.",
    ],
    guidance: [
      {
        title: "Big alfresco & outdoor living",
        body: "With that mountain outlook, the outdoor area is the main event. Slip-rated (R11 and above) porcelain in stone and concrete looks handles patios, outdoor kitchens and pool surrounds and stays safe underfoot in every season.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Earthy, grounded looks",
        body: "Stone-look, terrazzo-look and concrete-look porcelain sit naturally against the Glass House landscape, bringing an earthy, grounded feel to floors indoors and out without the upkeep of real stone.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Sheds, studios & workshops",
        body: "Acreage means sheds and studios. Industrial concrete-look and heavy-duty porcelain floors take knocks, spills and traffic and clean up with a hose or a mop, ready for the next job.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Pools & entertaining",
        body: "A pool is almost standard out here. We stock textured, slip-rated surround tiles and matching indoor floors so the whole entertaining area flows as one, inside to out.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to the Glass House Mountains?", a: "Yes, we deliver to Glass House Mountains and the surrounding acreage from our Baringa base, just tell us your street for a delivery quote." },
      { q: "How far is your showroom from the Glass House Mountains?", a: "About a twenty-minute drive down Steve Irwin Way. Many acreage customers have their tiles delivered, though you're welcome to visit the showroom first to see full-size boards and big-format samples." },
      { q: "What tiles suit an acreage home out here?", a: "For acreage homes we lean on tough through-body porcelain in earthy stone, terrazzo and concrete looks. Slip-rated outdoor porcelain suits big alfresco areas, sheds and pool surrounds, and wood-look planks warm the living areas." },
      { q: "Do you supply outdoor and pool tiles?", a: "Yes, slip-rated outdoor and pool-surround porcelain, plus matching indoor floors so your alfresco and entertaining areas flow together." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Glass House Mountains project." },
      { q: "Do you supply tilers and builders in the area?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Beerwah", "Beerburrum", "Landsborough", "Peachester", "Elimbah"],
  },

  "bli-bli": {
    slug: "bli-bli",
    name: "Bli Bli",
    popularSlugs: ["cottesloe-45", "haven-45", "cabarita-60", "strata-60-matt", "aspect-36-matt", "peregian-45", "relic-45", "heartwood-212"],
    popularIntro: "Easy-care family floors and smart-value large-format that suit new Bli Bli builds and estate homes. Every one is a real OnWood product.",
    guidanceIntro: "What works in a busy Bli Bli family home, from tough floors to easy bathrooms. Follow a link to browse the exact range.",
    deliveryLine: "We deliver across Bli Bli, Parklakes and the riverside estates most weeks. Tell us your suburb for a delivery quote, or collect from the Baringa showroom about 25 minutes away.",
    driveMins: 25,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Bli Bli | Tiles + Local Delivery | OnWood Tiles",
    metaDescription:
      "Your tile shop for Bli Bli: value large-format, wood-look and easy-care porcelain for new family homes and estates like Parklakes, with delivery to Bli Bli or pickup from Baringa.",
    intro: [
      "Building in Parklakes or renovating a family home in Bli Bli? OnWood Tiles supplies the Sunshine Coast from our Baringa showroom and delivers across Bli Bli and the riverside estates.",
      "Bli Bli is young-family country, so we focus on tiles that work hard for busy households: easy-care floors, value large-format and warm wood-looks that look great and forgive everyday life.",
    ],
    guidance: [
      {
        title: "Family-proof floors",
        body: "Kids, pets and everyday traffic are no match for through-body porcelain. It wipes clean, resists scratches and never needs sealing, so a Bli Bli family floor still looks good years down the track.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Smart-value large-format",
        body: "Large 450 and 600 tiles cover more ground for less, lay quickly and make open-plan living feel bigger, a smart choice for a new Bli Bli build or estate home on a budget.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Easy bathrooms & laundries",
        body: "Large-format wall and floor tiles make compact new-build bathrooms and laundries feel bigger and quicker to lay, with fewer grout lines to keep clean. We carry the matching wastes and tapware too.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
      {
        title: "Alfresco for the backyard",
        body: "Bli Bli backyards are made for entertaining. Slip-rated (R11 and above) porcelain runs your inside floor out to the patio and pool and stays safe underfoot year round.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Bli Bli?", a: "Yes, we deliver across Bli Bli, Parklakes and the riverside estates, just tell us your street for a delivery quote when you order. You're also welcome to collect from our Baringa showroom." },
      { q: "How far is your showroom from Bli Bli?", a: "About a 25-minute drive from Bli Bli via the Sunshine Motorway. Pop in to see full-size boards, or let us deliver straight to your build." },
      { q: "What tiles are best for a new Bli Bli family home?", a: "Easy-care through-body porcelain floors handle kids and pets with no sealing, value large-format covers open-plan living affordably, and wood-look planks add warmth. Slip-rated outdoor porcelain suits the backyard and pool." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and either deliver to your Bli Bli project or hold it for pickup at Baringa." },
      { q: "Do you supply tilers and builders in Bli Bli?", a: "Yes. Alongside mum-and-dad renovators we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Maroochydore", "Nambour", "Pacific Paradise", "Coolum", "Marcoola", "Diddillibah"],
  },

  "peregian-springs": {
    slug: "peregian-springs",
    name: "Peregian Springs",
    popularSlugs: ["arcadia-grande-612", "lustre-60-matt", "riviera-60-polished", "colonnade-612", "marchese-60-matt", "cinerea-60", "calcare-60-matt", "estella-60"],
    popularIntro: "Premium large-format, polished and stone-look tiles that match the considered style of Peregian Springs homes. Every one is a real OnWood product.",
    guidanceIntro: "What suits a considered Peregian Springs build or renovation, from polished floors to seamless indoor-outdoor. Follow a link to browse the exact range.",
    deliveryLine: "Most Peregian Springs customers have their tiles delivered up the coast. Tell us your street for a delivery quote, or visit the Baringa showroom to choose from full-size boards first.",
    driveMins: 35,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Peregian Springs | Tiles Delivered | OnWood Tiles",
    metaDescription:
      "Tiles for Peregian Springs homes: premium large-format porcelain, polished and stone-looks for considered new builds and renovations, delivered from OnWood Tiles on the Sunshine Coast.",
    intro: [
      "Peregian Springs is a considered, master-planned pocket of the northern Sunshine Coast, where new homes deserve tiles to match. OnWood Tiles delivers from our Baringa showroom, and we make the trip worth skipping with big-format samples and a full online range.",
      "For architect-influenced builds and quality renovations, we help homeowners and builders choose premium large-format, polished and natural stone-look porcelain that sets a calm, considered tone through the whole home.",
    ],
    guidance: [
      {
        title: "Premium large-format",
        body: "Big 600x1200 and 600x600 rectified porcelain lays with fine grout lines for a seamless, high-end finish that suits the calibre of a Peregian Springs home, indoors and out.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Polished & stone-looks",
        body: "Soft polished porcelain and natural stone-looks bring quiet luxury to living areas, ensuites and entrances, with the durability and easy care that real marble and stone can't offer.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Considered indoor-outdoor",
        body: "Peregian living blurs inside and out. We match your interior floor to a slip-rated (R11 and above) outdoor version so the alfresco, pool and courtyard read as one continuous space.",
        href: "/shop/tiles?f=location-use:outdoor",
        hrefLabel: "Outdoor tiles",
      },
      {
        title: "Ensuites & bathrooms",
        body: "Large-format walls and floors make ensuites feel like a retreat, with fewer grout lines and a clean, calm look. We carry the matching wastes and tapware to finish the scheme.",
        href: "/shop/tiles?f=location-use:bathroom",
        hrefLabel: "Bathroom tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Peregian Springs?", a: "Yes, we deliver to Peregian Springs and the northern beaches. Most customers up this way have their tiles delivered, just tell us your street for a quote." },
      { q: "How far is your showroom from Peregian Springs?", a: "About a 35-minute drive north via the Sunshine Motorway. Many Peregian Springs customers choose from our online range and big-format samples and have everything delivered, though the showroom is always open if you'd like to visit." },
      { q: "What tiles suit a Peregian Springs home?", a: "Premium large-format, soft polished and natural stone-look porcelain suit the considered style of Peregian Springs homes, with the durability real stone can't match. Slip-rated outdoor versions carry the look to alfresco and pool." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Peregian Springs project." },
      { q: "Do you supply tilers and builders in Peregian Springs?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Coolum Beach", "Peregian Beach", "Marcus Beach", "Noosa", "Yaroomba", "Twin Waters"],
  },

  "peregian-beach": {
    slug: "peregian-beach",
    name: "Peregian Beach",
    popularSlugs: ["cottesloe-60", "hakkari-natural-stone-tile", "coastline-subway", "riviera-60-polished", "whitehaven-45", "cinerea-60", "seaglass-309x290", "esplanade-60"],
    popularIntro: "Coastal whites, natural stone-looks and salt-tough porcelain for relaxed Peregian Beach homes. Every one is a real OnWood product.",
    guidanceIntro: "What suits a Peregian Beach house or coastal renovation, from breezy whites to salt-tough floors. Follow a link to browse the exact range.",
    deliveryLine: "Most Peregian Beach customers have their tiles delivered up the coast. Tell us your street for a delivery quote, or visit the Baringa showroom to see full-size boards and samples first.",
    driveMins: 38,
    driveVia: "the Sunshine Motorway",
    metaTitle: "Tile Shop Peregian Beach | Tiles Delivered | OnWood Tiles",
    metaDescription:
      "Tiles for Peregian Beach homes and renovations: coastal whites, natural stone-looks and salt-tough porcelain for beach-house living, delivered from OnWood Tiles on the Sunshine Coast.",
    intro: [
      "Peregian Beach keeps its relaxed, village feel, and its beach houses call for tiles that are light, natural and salt-tough. OnWood Tiles delivers up the coast from our Baringa showroom, with the full range online and samples to try at home.",
      "For coastal renovations and boutique builds, we help you choose crisp whites, natural stone-looks and textured feature tiles that catch the beachside light and shrug off salt air and sand.",
    ],
    guidance: [
      {
        title: "Coastal light & whites",
        body: "Crisp white and soft off-white porcelain bounce the beachside light through a Peregian Beach home and keep that easy, breezy coastal feel underfoot and on the walls.",
        href: "/shop/tiles",
        hrefLabel: "Browse tiles",
      },
      {
        title: "Natural stone-looks & texture",
        body: "Natural stone-look porcelain and textured feature tiles add organic warmth to a beach house without the sealing and staining worries of real stone by the sea.",
        href: "/gallery?dept=tiles",
        hrefLabel: "See the gallery",
      },
      {
        title: "Salt-tough & low-maintenance",
        body: "Salt air and sand are hard on surfaces. Through-body porcelain handles both with almost no upkeep, ideal for a Peregian Beach house you'd rather enjoy than maintain.",
        href: "/shop/tiles?f=location-use:floor",
        hrefLabel: "Floor tiles",
      },
      {
        title: "Splashbacks & features",
        body: "A glass mosaic or a subway splashback adds a coastal accent to a kitchen or bathroom. We carry the feature tiles and the matching wastes and tapware to pull the beach-house look together.",
        href: "/shop/tiles?f=location-use:splashback",
        hrefLabel: "Splashback tiles",
      },
    ],
    faqs: [
      { q: "Do you deliver tiles to Peregian Beach?", a: "Yes, we deliver to Peregian Beach and the surrounding coast. Most customers up this way have their tiles delivered, just tell us your street for a quote." },
      { q: "How far is your showroom from Peregian Beach?", a: "About a 38-minute drive north via the Sunshine Motorway. Many Peregian Beach customers browse the online range, order samples and have everything delivered, and you're welcome to visit the Baringa showroom any time." },
      { q: "What tiles suit a Peregian Beach house?", a: "Light whites and off-whites suit the coastal feel, natural stone-looks add texture, and through-body porcelain shrugs off salt air and sand with almost no maintenance. Glass mosaics make lovely coastal splashbacks." },
      { q: "Are you a supply-only tile shop?", a: "Yes, we're supply only. We don't install, but we'll help you choose, work out your quantities, and deliver to your Peregian Beach project." },
      { q: "Do you supply tilers and builders in Peregian Beach?", a: "Yes. As well as homeowners we run a trade partner program for tilers and boutique builders, with trade pricing and online ordering, just get in touch or apply through the Trade area of our site." },
    ],
    nearby: ["Peregian Springs", "Marcus Beach", "Coolum Beach", "Sunrise Beach", "Noosa", "Castaways Beach"],
  },
};

export const SUBURB_LIST: SuburbSeo[] = Object.values(SUBURBS);

/** Suburb landing-page content (null if we don't yet have a page for that slug). */
export async function getSuburb(slug: string): Promise<SuburbSeo | null> {
  return SUBURBS[slug] ?? null;
}

// ── Tile collection landing pages ("shop tiles by look / use") ───────────────
// Genuine curated pages for high-intent searches (outdoor tiles, bathroom tiles,
// white tiles, timber-look tiles, etc.). The route pulls REAL matching products
// from the live catalogue at request time, either by a live filter group/value or
// by a keyword in the product name (for looks with no filter, e.g. timber-look),
// and deep-links into the filtered shop. Wired into the /tile-shop hub, the footer
// and the sitemap so they are discoverable on-site, not orphan pages.
export type TileCollection = {
  slug: string;
  name: string; // H1, e.g. "Outdoor tiles"
  eyebrow: string; // kicker, e.g. "Shop by use"
  metaTitle: string;
  metaDescription: string;
  intro: string[]; // 2 hero paragraphs
  filterGroup?: string; // curate by a live filter group…
  filterValues?: string[]; // …matching any of these values
  keywords?: string[]; // …or by a keyword in the product name (looks with no filter)
  shopHref: string; // deep-link into the filtered shop
  guidanceIntro?: string;
  guidance: { title: string; body: string; href: string; hrefLabel: string }[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

export const TILE_COLLECTIONS: Record<string, TileCollection> = {
  outdoor: {
    slug: "outdoor",
    name: "Outdoor tiles",
    eyebrow: "Shop by use",
    metaTitle: "Outdoor Tiles Sunshine Coast | Non-Slip & Pool | OnWood Tiles",
    metaDescription:
      "Outdoor tiles for Sunshine Coast patios, alfresco areas and pool surrounds. Slip-rated porcelain built for sun, salt and rain, with local delivery and a Baringa showroom.",
    intro: [
      "Queensland outdoor living is hard on a surface. Sun, salt air, sudden downpours and bare feet all ask a lot of a tile. Our outdoor range is slip-rated porcelain chosen to take it, from alfresco floors to pool surrounds.",
      "Every tile here is a real OnWood product with a price. Browse the looks below, then order online or see the full-size boards at our Baringa showroom.",
    ],
    filterGroup: "location-use",
    filterValues: ["outdoor"],
    shopHref: "/shop/tiles?f=location-use:outdoor",
    guidanceIntro: "A few honest pointers for choosing tiles that live outside on the Sunshine Coast.",
    guidance: [
      { title: "Grip where it counts", body: "Around pools and on wet patios, look for a higher slip rating and a textured face. It reads as barely there underfoot but makes a real difference when the tiles are wet.", href: "/tiles/floor", hrefLabel: "Floor tiles" },
      { title: "Match inside to out", body: "Running the same look from your living floor onto the alfresco makes a small home feel bigger. Many of our floor tiles have an outdoor-rated match.", href: "/tiles/floor", hrefLabel: "Floor tiles" },
      { title: "Timber warmth, tile toughness", body: "Wood-look porcelain gives you the warmth of decking on a surface that will not grey off, splinter or need oiling every season.", href: "/tiles/timber-look", hrefLabel: "Timber-look tiles" },
    ],
    faqs: [
      { q: "Are your outdoor tiles non-slip?", a: "The tiles in this range are slip-rated porcelain suited to outdoor and wet areas. Ratings vary by tile, so the slip rating is listed on each product page. For pool surrounds and wet patios we can point you to the higher-rated options." },
      { q: "Can I use the same tile indoors and outdoors?", a: "Often yes. A number of our ranges offer an indoor floor tile and an outdoor-rated match in the same look, so you can flow one surface from the living room to the alfresco. Ask us and we will confirm which ranges pair up." },
      { q: "Do you deliver outdoor tiles on the Sunshine Coast?", a: "Yes. We deliver across the Sunshine Coast from our Baringa base, or you can collect. Tell us your suburb for a delivery quote. We supply tiles only and do not install." },
    ],
    related: [
      { label: "Floor tiles", href: "/tiles/floor" },
      { label: "Timber-look tiles", href: "/tiles/timber-look" },
      { label: "Bathroom tiles", href: "/tiles/bathroom" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
  "timber-look": {
    slug: "timber-look",
    name: "Timber-look tiles",
    eyebrow: "Shop by look",
    metaTitle: "Timber-Look Tiles Sunshine Coast | Wood-Look Porcelain | OnWood Tiles",
    metaDescription:
      "Wood-look and timber-look porcelain tiles on the Sunshine Coast. The warmth of a timber floor with none of the upkeep, ready for indoors, outdoors and wet areas.",
    intro: [
      "It is in our name. Timber-look tiles give you the warmth and grain of a timber floor on a surface that shrugs off water, scratches and Queensland humidity. No sanding, no oiling, no cupped boards after a wet summer.",
      "These are real porcelain planks with a price, chosen for believable grain and colour. Browse the looks below, then order online or come and stand on the full-size boards in Baringa.",
    ],
    keywords: ["timber", "wood", "oak", "spotted gum", "blackbutt", "walnut", "teak", "hickory", "cabarita", "plank", "grain", "birch", "elm"],
    shopHref: "/shop/tiles",
    guidanceIntro: "Why so many Sunshine Coast homes are choosing tile over timber.",
    guidance: [
      { title: "Built for wet feet", body: "Unlike real timber, a wood-look tile does not mind a wet towel, a splash from the pool or a mopped floor, so it works in bathrooms, laundries and alfresco areas too.", href: "/tiles/bathroom", hrefLabel: "Bathroom tiles" },
      { title: "Take it outside", body: "Many timber-look ranges include an outdoor-rated tile, so your deck and your living floor can be the same warm plank without the annual re-oil.", href: "/tiles/outdoor", hrefLabel: "Outdoor tiles" },
      { title: "Lay it like a floorboard", body: "Long plank formats and a brick-bond lay make a genuinely convincing floor. We will help you work out quantities for the pattern you want.", href: "/calculator", hrefLabel: "Tile calculator" },
    ],
    faqs: [
      { q: "Do timber-look tiles really look like wood?", a: "Modern porcelain printing has come a long way. Up close you see real grain, knots and colour variation across the range, and underfoot it stays cool and flat. The best way to judge is to see a full-size board, which we have in the showroom." },
      { q: "Where can I use wood-look tiles?", a: "Just about anywhere. Because they are porcelain, they suit living floors, bathrooms, laundries and, in the outdoor-rated ranges, patios and alfresco areas. One warm look can run through the whole home." },
      { q: "Are they cheaper than timber flooring?", a: "Prices are on every product page so you can compare. Beyond the tile price, a wood-look tile skips the ongoing sanding and oiling a timber floor needs, which many owners value over the life of the floor." },
    ],
    related: [
      { label: "Outdoor tiles", href: "/tiles/outdoor" },
      { label: "Floor tiles", href: "/tiles/floor" },
      { label: "Shop all tiles", href: "/shop/tiles" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
  white: {
    slug: "white",
    name: "White tiles",
    eyebrow: "Shop by colour",
    metaTitle: "White Tiles Sunshine Coast | Wall & Floor | OnWood Tiles",
    metaDescription:
      "White tiles for walls, floors and splashbacks on the Sunshine Coast. Gloss and matt whites, subways and large format, with prices and local delivery.",
    intro: [
      "White never dates. It bounces the Queensland light around a room, makes a small bathroom feel bigger and sits happily under any tapware or cabinetry you pair it with. Our white range spans crisp gloss, soft matt, classic subways and large-format walls and floors.",
      "Each tile is a real OnWood product with a price. Browse the whites below, then order online or see them full-size at the Baringa showroom.",
    ],
    filterGroup: "colour",
    filterValues: ["white"],
    shopHref: "/shop/tiles?f=colour:white",
    guidanceIntro: "How to make white work, from choosing a finish to picking a grout.",
    guidance: [
      { title: "Gloss or matt?", body: "Gloss whites reflect the most light and wipe clean easily, which suits splashbacks and shower walls. Matt whites hide water spotting and give a calmer, more contemporary feel underfoot.", href: "/tiles/splashback", hrefLabel: "Splashback tiles" },
      { title: "It is all in the grout", body: "A white grout keeps a wall seamless, while a grey or greige grout turns the same white subway into a feature. A small choice that changes the whole look.", href: "/blog", hrefLabel: "Read our guides" },
      { title: "White on the floor", body: "Large-format white floor tiles make open-plan living feel bright and expansive. Choose a matt or textured face for grip in wet areas.", href: "/tiles/floor", hrefLabel: "Floor tiles" },
    ],
    faqs: [
      { q: "Are white tiles hard to keep clean?", a: "Not really. Porcelain and ceramic wipe clean, and a white face actually hides dust and lint better than a dark one. On floors and in showers it is the grout that shows wear, so a slightly toned grout can be easier to live with than bright white." },
      { q: "What white tile is best for a splashback?", a: "A gloss white subway is the classic, easy-clean splashback, and it never dates. For a more seamless look, a large-format matt white keeps grout lines to a minimum. Both are in our white range." },
      { q: "Do you deliver white tiles locally?", a: "Yes, across the Sunshine Coast from Baringa, or collect in store. We supply tiles only. Tell us your suburb for a delivery quote." },
    ],
    related: [
      { label: "Splashback tiles", href: "/tiles/splashback" },
      { label: "Bathroom tiles", href: "/tiles/bathroom" },
      { label: "Floor tiles", href: "/tiles/floor" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
  bathroom: {
    slug: "bathroom",
    name: "Bathroom tiles",
    eyebrow: "Shop by use",
    metaTitle: "Bathroom Tiles Sunshine Coast | Floor, Wall & Shower | OnWood Tiles",
    metaDescription:
      "Bathroom tiles on the Sunshine Coast: floor, wall and shower tiles in porcelain and ceramic. Slip-rated floors, easy-clean walls, prices and local delivery.",
    intro: [
      "A bathroom asks a lot of a tile: grip underfoot when it is wet, an easy-clean face on the walls, and a look you will still love in ten years. Our bathroom range covers floors, walls and shower recesses in hard-wearing porcelain and ceramic.",
      "Every tile is a real OnWood product with a price. Browse the looks below, then order online or see the full-size boards in Baringa.",
    ],
    filterGroup: "location-use",
    filterValues: ["bathroom"],
    shopHref: "/shop/tiles?f=location-use:bathroom",
    guidanceIntro: "Practical pointers for choosing tiles that make a bathroom easy to live with.",
    guidance: [
      { title: "Grip on the floor", body: "Bathroom floors get wet, so look for a matt or textured face with a slip rating suited to wet areas. The rating is on each product page.", href: "/tiles/floor", hrefLabel: "Floor tiles" },
      { title: "Easy-clean walls", body: "A gloss or satin wall tile wipes down in seconds and keeps a shower bright. Larger formats mean fewer grout lines to scrub.", href: "/tiles/white", hrefLabel: "White tiles" },
      { title: "One look, floor to wall", body: "Carrying a similar tone across floor and walls makes a small bathroom feel calm and larger. Mix a matt floor with a gloss wall in the same family.", href: "/gallery", hrefLabel: "See it in a room" },
    ],
    faqs: [
      { q: "What tiles are best for a shower floor?", a: "A smaller tile or mosaic on a shower floor gives more grout lines for grip and follows the fall to the drain more easily, while a slip-rated finish keeps it safe underfoot. We can point you to suitable options for wet areas." },
      { q: "Can I use large tiles in a small bathroom?", a: "Yes, and it often helps. Fewer grout lines make a small room feel more open and are easier to keep clean. On the floor, choose a matt or textured face for grip." },
      { q: "Do you deliver bathroom tiles on the Sunshine Coast?", a: "Yes, from our Baringa base across the Sunshine Coast, or collect in store. We supply tiles only and do not install. Tell us your suburb for a delivery quote." },
    ],
    related: [
      { label: "Floor tiles", href: "/tiles/floor" },
      { label: "White tiles", href: "/tiles/white" },
      { label: "Splashback tiles", href: "/tiles/splashback" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
  splashback: {
    slug: "splashback",
    name: "Splashback tiles",
    eyebrow: "Shop by use",
    metaTitle: "Splashback Tiles Sunshine Coast | Kitchen & Subway | OnWood Tiles",
    metaDescription:
      "Kitchen splashback tiles on the Sunshine Coast: subways, gloss, matt and feature tiles that wipe clean and lift a kitchen. Prices and local delivery.",
    intro: [
      "The splashback is the one part of a kitchen you see at eye level all day, so it earns its keep as both a feature and a wipe-clean surface. Our splashback range runs from the timeless subway to bold feature tiles that become the talking point of the room.",
      "Each tile is a real OnWood product with a price. Browse the looks below, then order online or see them full-size in Baringa.",
    ],
    filterGroup: "location-use",
    filterValues: ["splashback"],
    shopHref: "/shop/tiles?f=location-use:splashback",
    guidanceIntro: "How to pick a splashback that lifts the kitchen and still wipes clean.",
    guidance: [
      { title: "The classic subway", body: "A gloss subway is the safe, timeless choice. Change the grout colour or the lay pattern, stacked or herringbone, to make it feel current.", href: "/tiles/white", hrefLabel: "White tiles" },
      { title: "Make it the feature", body: "If the cabinetry is simple, a patterned or textured splashback is where you can have fun without committing the whole room to a look.", href: "/shop/tiles", hrefLabel: "Browse all tiles" },
      { title: "Keep it wipe-clean", body: "Behind a cooktop, a gloss or satin face and minimal grout lines make daily cleaning easy. Larger tiles mean fewer joins.", href: "/gallery", hrefLabel: "See it in a room" },
    ],
    faqs: [
      { q: "What is the most popular splashback tile?", a: "The subway tile remains the most popular, because it suits almost any kitchen and never dates. Beyond that, we see plenty of large-format and feature tiles chosen to make the splashback a talking point." },
      { q: "Are patterned splashbacks hard to keep clean?", a: "Most of our patterned tiles have a smooth, sealed porcelain or ceramic face that wipes clean like any other tile. The pattern is printed and fired in, not raised, so grease and splashes come straight off." },
      { q: "Do you deliver splashback tiles locally?", a: "Yes, across the Sunshine Coast from Baringa, or collect in store. We supply tiles only. Tell us your suburb for a delivery quote." },
    ],
    related: [
      { label: "White tiles", href: "/tiles/white" },
      { label: "Bathroom tiles", href: "/tiles/bathroom" },
      { label: "Shop all tiles", href: "/shop/tiles" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
  floor: {
    slug: "floor",
    name: "Floor tiles",
    eyebrow: "Shop by use",
    metaTitle: "Floor Tiles Sunshine Coast | Porcelain & Timber-Look | OnWood Tiles",
    metaDescription:
      "Floor tiles on the Sunshine Coast: hard-wearing porcelain in stone, concrete and timber looks for living areas, wet areas and outdoors. Prices and local delivery.",
    intro: [
      "The floor is the biggest surface in the house and the one that takes the most punishment, from sandy feet to dropped pans. Our floor range is hard-wearing porcelain in stone, concrete and timber looks, chosen to stay looking good for the long haul.",
      "Every tile is a real OnWood product with a price. Browse the looks below, then order online or see the full-size boards in Baringa.",
    ],
    filterGroup: "location-use",
    filterValues: ["floor"],
    shopHref: "/shop/tiles?f=location-use:floor",
    guidanceIntro: "What to weigh up when you are choosing a floor that has to last.",
    guidance: [
      { title: "Grip for wet areas", body: "In bathrooms, laundries and near pools, a matt or textured face with a wet-area slip rating keeps the floor safe. The rating is on each product page.", href: "/tiles/bathroom", hrefLabel: "Bathroom tiles" },
      { title: "Go large to feel open", body: "Large-format floor tiles have fewer grout lines, so an open-plan living area feels bigger and is easier to keep clean.", href: "/shop/tiles?f=size:large-format", hrefLabel: "Large-format tiles" },
      { title: "Timber warmth underfoot", body: "Wood-look porcelain brings the warmth of a timber floor to living areas and stays flat and cool in the Queensland heat.", href: "/tiles/timber-look", hrefLabel: "Timber-look tiles" },
    ],
    faqs: [
      { q: "What is the toughest tile for floors?", a: "Porcelain is the hard-wearing choice for floors: it is dense, low-maintenance and resists scratches and stains. Most of our floor range is porcelain for exactly this reason." },
      { q: "Can I run the same floor tile through the whole house?", a: "Yes, and it is a great way to make a home feel calm and larger. Just make sure wet areas use a tile with a suitable slip rating, which many ranges offer alongside the standard floor tile." },
      { q: "Do you deliver floor tiles on the Sunshine Coast?", a: "Yes, from Baringa across the Sunshine Coast, or collect in store. We supply tiles only and do not install. Tell us your suburb for a delivery quote." },
    ],
    related: [
      { label: "Timber-look tiles", href: "/tiles/timber-look" },
      { label: "Outdoor tiles", href: "/tiles/outdoor" },
      { label: "Bathroom tiles", href: "/tiles/bathroom" },
      { label: "Areas we service", href: "/tile-shop" },
    ],
  },
};

export const COLLECTION_LIST: TileCollection[] = Object.values(TILE_COLLECTIONS);

/** Tile-collection landing-page content (null if the slug has no collection). */
export async function getCollection(slug: string): Promise<TileCollection | null> {
  return TILE_COLLECTIONS[slug] ?? null;
}
