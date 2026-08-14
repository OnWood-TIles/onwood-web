// Kiln, the OnWood Tiles magazine. Batch One editorial content.
//
// Source of truth for the flick-through magazine at /magazine. This is authored
// as a DESIGNED magazine: each leaf declares a `layout`, and articles are cut
// short and split into image-led opener pages + tight feature pages + designed
// sidebars, rather than walls of text. House rules: Australian spelling, metric,
// NO em-dashes (use commas / colons / full stops), no exclamation marks, no
// visible prices.
//
// Imagery is NOT hard-coded. Leaves name product slugs; the server page
// (app/magazine/page.tsx) resolves them to the "installed" room shots already
// generated for the website feed (3-8 per product), so the book reuses real
// site imagery and stays current. Missing slugs degrade gracefully.

export type MagBlock =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "lead"; label: string; text: string }
  | { t: "list"; items: string[] }
  | { t: "diagram"; kind: "pores" | "offset" | "thermal" };

export type MagLayout =
  | "cover"
  | "contents"
  | "opener" // full-bleed hero image, title overlaid
  | "feature" // designed text page (1-2 cols) + optional pull quote / band image / sidebar
  | "sidebar" // full-page designed callout (a "test" / definition)
  | "gallery" // image grid
  | "letter"
  | "closing";

export type Sidebar = { label: string; title?: string; body: string };

export type MagLeaf = {
  id: string;
  layout: MagLayout;
  section?: string; // Space Mono eyebrow
  kicker?: string; // running title on continuation/feature pages
  title?: string;
  titleAccent?: string; // trailing word in Newsreader italic
  standfirst?: string;
  intro?: string; // short lead paragraph (opener)
  readMins?: number;
  columns?: 1 | 2; // feature body column count
  blocks?: MagBlock[];
  pullquote?: string;
  sidebar?: Sidebar; // designed callout box on a feature page
  /** Big image (opener hero / feature band). Resolves to an installed room shot. */
  heroSlug?: string;
  heroColour?: string;
  heroShot?: number; // which installed shot (0-based) to use
  /** Secondary image on a feature page. */
  sideSlug?: string;
  sideColour?: string;
  sideShot?: number;
  /** Gallery: several installed shots from one product. */
  gallerySlug?: string;
  /** Direct image (founder portrait). Wins over heroSlug. */
  imageUrl?: string;
  imageCaption?: string;
  /** Contents list. */
  contents?: { n: string; title: string; section: string }[];
  /** Quiet no-price product tie-in. */
  tieIn?: string[];
};

export const MAGAZINE_ISSUE = {
  title: "Kiln",
  by: "OnWood Tiles",
  batch: "Batch One",
  subtitle: "A magazine about tiles, and the coastal homes they belong in",
  season: "Sunshine Coast",
};

export const MAGAZINE: MagLeaf[] = [
  // ── COVER ─────────────────────────────────────────────────────────────
  {
    id: "cover",
    layout: "cover",
    section: "OnWood Tiles · Batch One",
    title: "Kiln",
    standfirst: "A magazine about tiles, and the coastal homes they belong in.",
    heroSlug: "cuadrado-60-grip",
    heroColour: "Beige",
  },

  // ── CONTENTS ──────────────────────────────────────────────────────────
  {
    id: "contents",
    layout: "contents",
    section: "Batch One",
    title: "In this",
    titleAccent: "batch",
    contents: [
      { n: "01", title: "Why we made a magazine", section: "From the founder" },
      { n: "02", title: "The white tile that went everywhere", section: "History" },
      { n: "03", title: "The scraps of Venice", section: "Materials" },
      { n: "04", title: "When timber look stopped looking fake", section: "Feature" },
      { n: "05", title: "Porcelain or ceramic, in one number", section: "Explainer" },
      { n: "06", title: "The two millimetres that decide a floor", section: "Buying" },
      { n: "07", title: "The coolest thing in the house", section: "Climate" },
      { n: "08", title: "One tile, every room", section: "Showcase" },
    ],
  },

  // ── 01 · FOUNDER'S LETTER ─────────────────────────────────────────────
  {
    id: "why-onwood",
    layout: "letter",
    section: "01 / From the founder",
    title: "Why we made a",
    titleAccent: "magazine",
    standfirst:
      "Every shop has a name. Most mean nothing. Ours is at least honest about what it is.",
    imageUrl: "/images/magazine/founder.webp",
    imageCaption: "Reagan, in a kitchen that makes the point: even the splashback is tile.",
    blocks: [
      {
        t: "p",
        text: "Start with the name, because people ask. OnWood is for the wood look. Timber look porcelain suits a coastal Queensland home better than almost anything else, the warmth of a timber floor with none of the arguments with water, sun and sand. That was the tile we cared about most, so that is the tile we named the shop after.",
      },
      {
        t: "p",
        text: "The longer version is that OnWood did not start in a tile shop. It started in the software that runs them. Before there was a showroom at Baringa there was OnBase, a system we built to handle the ordering and stock behind tile and flooring shops. After enough of that, you get the itch to open the one you would actually want to buy from.",
      },
      {
        t: "p",
        text: "So we made a few decisions on purpose. We keep real stock, because a floor you cannot get for months is not a floor you can have. We tell you when the tile you love is wrong for the room you love it for. And we would rather you took samples home for a fortnight than decided under our lights.",
      },
      {
        t: "p",
        text: "As for why a tile shop prints a magazine: most of what is genuinely interesting about this material never fits into a conversation at a sample rack. We wanted to make something worth keeping. Thank you for reading it.",
      },
      { t: "p", text: "Reagan, OnWood Tiles. Baringa, Sunshine Coast." },
    ],
    pullquote: "OnWood did not start in a tile shop. It started in the software that runs them.",
  },

  // ── 02 · SUBWAY ───────────────────────────────────────────────────────
  {
    id: "subway-open",
    layout: "opener",
    section: "02 / History",
    title: "The white tile that went",
    titleAccent: "everywhere",
    standfirst:
      "In 1904, two architects had to convince New Yorkers that walking into a hole in the ground was not a death sentence. Most of what you have been told about their solution is wrong.",
    readMins: 3,
    heroSlug: "coastline-subway",
    heroShot: 0,
  },
  {
    id: "subway-feature",
    layout: "feature",
    section: "02 / History",
    kicker: "The white tile that went everywhere",
    blocks: [
      {
        t: "p",
        text: "The subway did not need a tunnel. It needed ordinary people to walk down into the dark, something almost none of them had ever done. So Heins and La Farge designed a room, lined at eye level in small white glazed tiles. The reasons had nothing to do with fashion, and every one still holds.",
      },
      {
        t: "lead",
        label: "Light.",
        text: "A glossy glaze is close to the most reflective surface money can buy, and in a station with no windows it did the work of lamps nobody could afford.",
      },
      {
        t: "lead",
        label: "Cleanliness.",
        text: "A glazed surface absorbs nothing. Handling thousands of strangers a day, tile was not a finish. It was public health equipment.",
      },
      {
        t: "lead",
        label: "Endurance.",
        text: "A fired glaze is a thin layer of glass. Some of the original 1904 tile is still on the wall today.",
      },
    ],
    pullquote: "Tile was not a finish. It was public health equipment.",
    sidebar: {
      label: "The myth",
      title: "The bevel that never was",
      body: "You will read that subway tile was bevelled to bounce light onto the platform. The originals were flat, and no reliable source supports the story. The bevel is a later revival flourish.",
    },
  },

  // ── 03 · TERRAZZO ─────────────────────────────────────────────────────
  {
    id: "terrazzo-open",
    layout: "opener",
    section: "03 / Materials",
    title: "The scraps of",
    titleAccent: "Venice",
    standfirst:
      "Terrazzo was not invented. It was salvaged, by workers who were not allowed to waste marble and had no floor of their own worth the name.",
    readMins: 3,
    heroSlug: "graniglia-60-matt",
    heroShot: 0,
  },
  {
    id: "terrazzo-feature",
    layout: "feature",
    section: "03 / Materials",
    kicker: "The scraps of Venice",
    blocks: [
      {
        t: "p",
        text: "In sixteenth century Venice the marble mosaic trade was run by migrant workers from Friuli. Mosaic is brutally wasteful, and in a guild trade the offcuts were nobody's to bin. So they went home with the workers, who pressed the marble into a bed of lime on their own terraces and beat it flat.",
      },
      {
        t: "p",
        text: "The names are honest about it. Seminato means sown, because the chips were flung across a wet bed rather than placed. The first sealer, by the trade's own account, was goat's milk, noticed when a spill brought up the colour of the stone. Within a century these floors were in Venetian palaces.",
      },
      {
        t: "p",
        text: "Real terrazzo is a specialist trade with a price to match. Porcelain terrazzo look gives you the language for a fraction of the cost, but it is a photograph of a material, not the material. Neither is wrong. Just know which you are buying, because the difference shows most at the edges.",
      },
    ],
    pullquote: "Nothing about the material changed. What changed was who was looking at it.",
    sidebar: {
      label: "The word",
      title: "Seminato",
      body: "Italian for sown, as in scattering seed. It is the literal action: marble chips flung across a wet bed, then ground flat once set.",
    },
  },

  // ── 04 · TIMBER LOOK (LEAD FEATURE) ───────────────────────────────────
  {
    id: "timber-open",
    layout: "opener",
    section: "04 / Feature",
    title: "When timber look stopped looking",
    titleAccent: "fake",
    standfirst:
      "For decades you could spot a timber look tile from the doorway. Then a printhead problem got solved in a Spanish factory, and the whole category changed.",
    readMins: 4,
    heroSlug: "woodstock-212",
    heroShot: 0,
  },
  {
    id: "timber-feature",
    layout: "feature",
    section: "04 / Feature",
    kicker: "When timber look stopped looking fake",
    blocks: [
      {
        t: "p",
        text: "If you looked at timber look tile in 2004 and have not since, your opinion is correct and out of date. Back then you could stand at the door and see the repeat: the same knot, the same grain, recurring in a rhythm your eye caught whether you wanted it to or not.",
      },
      {
        t: "p",
        text: "The reason was the printing. Screens press one image onto the tile, and each extra image is another screen to change on the line, so a typical run had just four faces. Four faces across forty square metres is a repeat every few tiles, and that is exactly what your eye was catching.",
      },
      {
        t: "p",
        text: "Then, around 2007, printheads arrived that continuously recirculate the ink so the ceramic pigment cannot settle and clog. Printing went digital, and faces were free. A maker could print forty different planks, or scan a real board and print every one of them.",
      },
    ],
    pullquote:
      "Timber look tile did not get better because designers got better. It got better because a printhead stopped clogging.",
  },
  {
    id: "timber-test",
    layout: "sidebar",
    section: "04 / Feature",
    kicker: "When timber look stopped looking fake",
    title: "The ten second",
    titleAccent: "test",
    standfirst: "Two checks you can run in any showroom, including ours. Neither needs you to know a thing about tile.",
    blocks: [
      {
        t: "lead",
        label: "Count the planks.",
        text: "Pull ten off the display and lay them side by side. Two or three the same means a four to six face product that will repeat in any real room. All ten different means a proper digital face count.",
      },
      {
        t: "lead",
        label: "Feel the grain.",
        text: "Run your fingers across it with your eyes shut. On good product the texture follows the printed grain, so you press a knot and feel a knot. On lesser product the surface is a generic emboss with no relationship to the image on top.",
      },
    ],
    sidebar: {
      label: "Jargon",
      title: "Face count",
      body: "The number of different printed images in a range. Four faces repeat visibly. Forty makes the repeat invisible at room scale. It is almost never on the box, always known to the supplier, and the single most useful question to ask about a timber look tile.",
    },
    heroSlug: "esplanade-60",
    heroShot: 1,
  },

  // ── 05 · PORCELAIN OR CERAMIC ─────────────────────────────────────────
  {
    id: "porcelain-open",
    layout: "opener",
    section: "05 / Explainer",
    title: "Porcelain or ceramic, in one",
    titleAccent: "number",
    standfirst:
      "Two words used as if they mean the same thing, describing two genuinely different materials. The distinction is not marketing. It is a number you can measure.",
    readMins: 3,
    heroSlug: "calcare-60-matt",
    heroShot: 0,
  },
  {
    id: "porcelain-feature",
    layout: "feature",
    section: "05 / Explainer",
    kicker: "Porcelain or ceramic, in one number",
    blocks: [
      {
        t: "p",
        text: "The definition is water absorption. Weigh a dry tile, soak it, weigh it again. Porcelain absorbs half a percent of its weight or less. Fire a fine clay hot enough and the mineral fuses into glass that closes the pores, so a vitrified body does not drink. Everything above that line is ceramic, lighter and cheaper and perfectly good on a wall.",
      },
      { t: "diagram", kind: "pores" },
      {
        t: "lead",
        label: "Where it counts.",
        text: "Indoors the difference is academic. On the coast it is not. Salt air carries dissolved salt into any porous surface, the water evaporates and the salt crystallises inside the pore. Porcelain around a saltwater pool is not an upsell, it is an engineering decision.",
      },
    ],
    pullquote: "A vitrified body is essentially a manufactured stone. It does not drink.",
  },

  // ── 06 · OFFSET / LIPPAGE ─────────────────────────────────────────────
  {
    id: "offset-open",
    layout: "opener",
    section: "06 / Buying",
    title: "The two millimetres that decide a",
    titleAccent: "floor",
    standfirst:
      "Why some tiles lay almost seamlessly and others cannot, and why the pattern you picked off Pinterest might be the reason your floor has a lip you can catch a toe on.",
    readMins: 4,
    heroSlug: "colonnade-612",
    heroShot: 0,
  },
  {
    id: "offset-feature",
    layout: "feature",
    section: "06 / Buying",
    kicker: "The two millimetres that decide a floor",
    blocks: [
      {
        t: "p",
        text: "Here is the part nobody mentions. Fired tiles are not flat, and are not meant to be. The standards allow a bow of half a percent of the tile's length in first quality product, so a 600 millimetre tile can rise up to three millimetres in the middle, and nobody could reject it.",
      },
      { t: "diagram", kind: "offset" },
      {
        t: "p",
        text: "Lay those in a classic 50 percent brick pattern and the end of each plank lands at the centre of the one below, stacking the high point of one tile against the low point of the next. That is lippage, and raking light makes it merciless. The fix is a maximum offset of about a third, not a half, for any tile with a side over 380 millimetres.",
      },
    ],
    pullquote: "A tile can bow three millimetres and still be first quality.",
  },

  // ── 07 · THERMAL MASS ─────────────────────────────────────────────────
  {
    id: "thermal-open",
    layout: "opener",
    section: "07 / Climate",
    title: "The coolest thing in the",
    titleAccent: "house",
    standfirst:
      "Tile floors have been standard in hot climates for thousands of years. That is not tradition, it is thermodynamics. Though in the subtropics the argument is more interesting than most assume.",
    readMins: 3,
    heroSlug: "lustre-60-polished",
    heroShot: 0,
  },
  {
    id: "thermal-feature",
    layout: "feature",
    section: "07 / Climate",
    kicker: "The coolest thing in the house",
    blocks: [
      {
        t: "p",
        text: "Step barefoot onto tile in February and it feels cold. It is not. It simply pulls heat from your foot faster than a rug can. A concrete slab under tile is a thermal battery: when the air is hotter than the slab it soaks up heat, so the room's peak flattens and lags by hours.",
      },
      { t: "diagram", kind: "thermal" },
      {
        t: "p",
        text: "The honest part is that mass only pays off if it can discharge overnight. On the Sunshine Coast in February the overnight low is twenty two degrees, the swing is narrow, and a slab that cannot cool becomes a liability. Mass works here only when it is shaded and night air can move across it.",
      },
    ],
    pullquote: "Good if it is shaded and can breathe at night. A liability if it cannot.",
  },

  // ── 08 · SHOWCASE ─────────────────────────────────────────────────────
  {
    id: "one-tile-open",
    layout: "opener",
    section: "08 / Showcase",
    title: "One tile, every",
    titleAccent: "room",
    standfirst:
      "The hardest thing to do in a showroom is imagine. So we followed a single tile from our own range through the rooms of one coastal home.",
    heroSlug: "heartwood-212",
    heroShot: 2,
  },
  {
    id: "one-tile-gallery",
    layout: "gallery",
    section: "08 / Showcase",
    kicker: "One tile, every room",
    intro:
      "The tile is the same in every photograph. What changes is the grout, the layout, the materials beside it and the light. Those four things are the real design decisions, and all four are free.",
    blocks: [
      {
        t: "p",
        text: "A sample held at chest height under showroom lights is a poor way to judge a floor. Scale, light and context all lie to you. So rather than explain it, we have shown it. These room images are visualisations of a real product from our range. We would rather tell you that than pretend a new shop has photographed forty finished homes. The tile is real, the colour is true, and every one is in stock.",
      },
    ],
    gallerySlug: "heartwood-212",
    tieIn: ["heartwood-212", "cabarita-612", "terroir-60"],
  },

  // ── CLOSING ───────────────────────────────────────────────────────────
  {
    id: "closing",
    layout: "closing",
    section: "Thanks for reading",
    title: "Come and see it full",
    titleAccent: "size",
    standfirst:
      "Everything in these pages is on a board in the showroom, in real light, waiting for you to take a corner of it home.",
    heroSlug: "cortile",
    heroShot: 0,
    blocks: [
      {
        t: "p",
        text: "A magazine can start an idea. A full size board in the light of the room it will live in is how you finish one. Our showroom is at Baringa, an easy run from Caloundra, Pelican Waters, Kawana and the hinterland. Bring your plans, a photo, or nothing at all. We are supply only, we will help you work out your quantities, and we will tell you honestly when the tile you love is wrong for the room.",
      },
      {
        t: "p",
        text: "If you are a builder or a tiler, we run a trade partner program with trade pricing and online ordering. And if you simply enjoyed the read, that is enough. We will see you in the next batch.",
      },
    ],
    tieIn: ["marrakesh-decor", "estella-60", "arcadia-grande-612"],
  },
];
