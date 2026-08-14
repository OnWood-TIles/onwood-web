// Kiln, the OnWood Tiles magazine. Batch One editorial content.
//
// This is the source of truth for the virtual (flick-through) magazine at
// /magazine. Copy is deliberately em-dash free (house rule: em-dashes read
// AI-written; use commas / colons / full stops). Australian spelling, metric,
// no exclamation marks, no visible prices.
//
// Imagery is NOT hard-coded here. Each leaf names product slugs; the server
// page (app/magazine/page.tsx) resolves them to the "installed" room shots
// already generated for the website feed, so the book reuses real site imagery
// and stays current. Missing slugs are skipped gracefully.
//
// Pages that depended on a bespoke studio photo shoot (the six-panel grout
// spread) are intentionally left out of Batch One; they are the natural anchor
// for a future batch once a shoot happens.

export type MagBlock =
  | { t: "p"; text: string }
  | { t: "h"; text: string } // sub-heading inside an article
  | { t: "lead"; label: string; text: string } // bold lead-in then sentence
  | { t: "list"; items: string[] }
  | { t: "note"; label?: string; text: string } // boxed sidebar / definition
  | { t: "diagram"; kind: "pores" | "offset" | "thermal" }; // inline SVG figure

export type MagLeaf = {
  id: string;
  kind: "cover" | "letter" | "contents" | "article" | "showcase" | "closing";
  section?: string; // Space Mono eyebrow, e.g. "Feature / Materials"
  title?: string;
  titleAccent?: string; // trailing word rendered in Newsreader italic
  standfirst?: string;
  readMins?: number;
  blocks?: MagBlock[];
  pullquote?: string;
  /** Primary product slug -> resolves to a hero "installed" room shot. */
  imageSlug?: string;
  /** When set, pick this colourway's installed shot rather than the first. */
  imageColour?: string;
  /** Direct image override (e.g. the founder portrait); wins over imageSlug. */
  imageUrl?: string;
  /** Optional caption under the hero image. */
  imageCaption?: string;
  /** Showcase gallery: multiple slugs / multiple shots of one slug. */
  gallerySlug?: string;
  /** Quiet "in the showroom" product tie-in (no prices), 2-3 slugs. */
  tieIn?: string[];
  /** Contents list rendered on the contents leaf. */
  contents?: { n: string; title: string; section: string }[];
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
    kind: "cover",
    section: "OnWood Tiles · Batch One",
    title: "Kiln",
    standfirst:
      "A magazine about tiles, and the coastal homes they belong in.",
    imageSlug: "cuadrado-60-grip",
    imageColour: "Beige",
  },

  // ── EDITOR'S LETTER / WHY ONWOOD ──────────────────────────────────────
  {
    id: "why-onwood",
    kind: "letter",
    section: "From the founder",
    title: "Why",
    titleAccent: "OnWood",
    standfirst:
      "Every shop has a name. Most of them mean nothing. This one is at least honest about what it is.",
    readMins: 3,
    imageUrl: "/images/magazine/founder.webp",
    imageCaption: "Reagan, in a kitchen that makes the point: even the splashback is tile.",
    blocks: [
      {
        t: "p",
        text: "Start with the name, because people ask. OnWood is for the wood look. Timber look porcelain suits a coastal Queensland home better than almost anything else: it has the warmth of a timber floor and none of the arguments with water, sun, sand and dogs. When we started, that was the tile we cared about most, so that is the tile we named the shop after. If the honest answer to why OnWood is that it says what we love and it was ours to use, then that is the answer. We would rather that than a manufactured origin story, and you have heard a hundred of those.",
      },
      {
        t: "p",
        text: "The longer version is that OnWood did not start in a tile shop. It started in the software that runs them. Before there was a showroom at Baringa there was OnBase, a system we built to handle the ordering, quoting and stock behind tile and flooring shops. Building it meant seeing a lot of these businesses from the inside, the good and the frustrating, and after enough of that you get an itch to open the one you would actually want to buy from.",
      },
      { t: "p", text: "So we did, and we made a few decisions on purpose." },
      {
        t: "list",
        items: [
          "We keep real stock. A floor you cannot get for eleven weeks is not a floor you can have, so we hold ranges here rather than promising them from a catalogue.",
          "We will tell you when the tile you have fallen for is wrong for where you want to put it. A sale is never worth a floor you regret every morning.",
          "We would rather you took four samples home for a fortnight than made a decision under our lighting.",
        ],
      },
      {
        t: "p",
        text: "The showroom is built around the same idea. Full size boards instead of a folder of chips. Real light, because a tile lies to you under bright even downlights and tells the truth only in the room it will actually live in. Samples you can take home and sit with. We are supply only, we do not install, and we say so before you ask, because pretending otherwise helps nobody.",
      },
      {
        t: "p",
        text: "As for why a tile shop is printing a magazine: most of what is genuinely interesting about this material does not fit into a conversation at a sample rack, and most of what you need to know to spend your money well is never written down anywhere you would think to look. We wanted to make something worth keeping, and worth reading even if you are not buying a floor this year. However you are reading this, in the showroom with a coffee or at home on the couch, thank you for it.",
      },
      { t: "p", text: "Reagan, OnWood Tiles. Baringa, Sunshine Coast." },
    ],
    pullquote:
      "OnWood did not start in a tile shop. It started in the software that runs them.",
  },

  // ── CONTENTS ──────────────────────────────────────────────────────────
  {
    id: "contents",
    kind: "contents",
    section: "Batch One",
    title: "In this",
    titleAccent: "batch",
    contents: [
      { n: "01", title: "The white tile that went everywhere", section: "History" },
      { n: "02", title: "The scraps of Venice", section: "Materials" },
      { n: "03", title: "The year timber look tiles stopped looking fake", section: "Feature" },
      { n: "04", title: "Porcelain or ceramic, settled with a bucket of water", section: "Explainer" },
      { n: "05", title: "The two millimetres that decide everything", section: "Buying" },
      { n: "06", title: "The coolest thing in the house", section: "Climate" },
      { n: "07", title: "One tile, every room", section: "Showcase" },
    ],
  },

  // ── 01 · SUBWAY TILE ──────────────────────────────────────────────────
  {
    id: "subway",
    kind: "article",
    section: "01 / History",
    title: "The white tile that went",
    titleAccent: "everywhere",
    standfirst:
      "In 1904 two architects had to convince New Yorkers that walking underground was not a death sentence. Their solution is still on the wall of your bathroom, and most of what you have been told about it is wrong.",
    readMins: 4,
    imageSlug: "coastline-subway",
    blocks: [
      {
        t: "p",
        text: "The problem facing George C. Heins and Christopher Grant La Farge in 1904 was not really an engineering one. The tunnels were dug. The trains ran. What the Interborough Rapid Transit Company needed was for ordinary New Yorkers to willingly walk down a staircase into a hole in the ground, something almost none of them had ever done and which sounded, on the face of it, like a very poor idea.",
      },
      {
        t: "p",
        text: "So Heins and La Farge did not design a tunnel. They designed a room. Vaulted ceilings, mosaic plaques, brass, and covering everything at eye level, small rectangles of white glazed ceramic, three inches by six. The choice was made for reasons that had nothing to do with fashion, and every one of them still applies to a tile you might buy today.",
      },
      {
        t: "lead",
        label: "Light.",
        text: "Underground stations in 1904 were lit badly. A glossy white glaze is close to the most reflective interior surface available at any price. It takes whatever light you give it and throws it back into the room. In a space with no windows and poor lamps, white tile did the work of fixtures nobody could afford.",
      },
      {
        t: "lead",
        label: "Dirt.",
        text: "The late Victorians were, by modern standards, obsessive about sanitation, and with cause. A vitrified glazed surface does not absorb anything, so it cannot harbour what a plastered or painted wall harbours. In a public space handling hundreds of thousands of strangers a day, tile was not a finish. It was public health equipment.",
      },
      {
        t: "lead",
        label: "It does not wear.",
        text: "A fired ceramic glaze is functionally a thin layer of glass. It does not fade, chalk or need repainting. Some of the original 1904 tilework is still in service. It has outlasted the company that installed it, two world wars, and every trend in interior design since.",
      },
      { t: "h", text: "Now the bit that is not true" },
      {
        t: "p",
        text: "You will read, in a great many places, that subway tile was bevelled so the angled edges would scatter light down onto the platform. It is a lovely story. It is also, as far as the documented record goes, invention. The original field tiles are generally recorded as flat faced, and no reliable source supports the idea that 1904 put a bevel there to bounce light onto the platform. The bevel reads as period to us precisely because we associate it with old buildings, but as a design feature it is largely a later revival flourish. The light argument was always about the glaze.",
      },
      {
        t: "p",
        text: "We mention it because it is a useful example of how design history works. A detail gets a plausible explanation attached to it after the fact, the explanation gets repeated, and eventually it becomes something everyone knows. Most of what everyone knows about flooring is the same shape.",
      },
      { t: "h", text: "Why it never went away" },
      {
        t: "p",
        text: "Every few years someone announces that subway tile is finished. It never is, and the reason is structural rather than aesthetic. Subway tile is one of a very small number of design objects that is genuinely neutral. Put it in a Federation cottage and it reads as heritage. Put it in a rendered box in Baringa and it reads as contemporary. It does not argue with anything.",
      },
      {
        t: "p",
        text: "That neutrality is why it survives the trend cycle. It also means the decisions that actually carry the room are the ones nobody photographs: the grout colour, the layout, and the edge detail. A white subway with white grout in a stack bond is a completely different object from the same tile with charcoal grout in a herringbone. The tile is the canvas. It has been the canvas for more than a hundred and twenty years, which is a humbling thought to have in a showroom. The oldest, plainest, cheapest thing on the wall is the one that will still look right in forty years.",
      },
    ],
    pullquote: "Tile was not a finish. It was public health equipment.",
    tieIn: ["coastline-subway", "aspect-36-gloss", "gelato-75x300"],
  },

  // ── 02 · TERRAZZO ─────────────────────────────────────────────────────
  {
    id: "terrazzo",
    kind: "article",
    section: "02 / Materials",
    title: "The scraps of",
    titleAccent: "Venice",
    standfirst:
      "Terrazzo was not invented. It was salvaged, by workers who were not allowed to waste marble and had no floor of their own worth speaking of.",
    readMins: 4,
    imageSlug: "graniglia-60-matt",
    blocks: [
      {
        t: "p",
        text: "Nobody sat down and designed terrazzo. That is the first thing to understand about it, and it explains everything that follows.",
      },
      {
        t: "p",
        text: "In sixteenth century Venice the marble mosaic trade was dominated, almost monopolised, by migrant craftsmen from Friuli, the alpine foothill country in Italy's north east. They came down for the work, and the work was laying the mosaic floors of a city building itself into a display of wealth. Mosaic is brutally wasteful. Every tessera cut to size produces fragments too small and too odd to use, and in a guild trade the offcuts were nobody's to discard. So they went home with the workers.",
      },
      {
        t: "p",
        text: "And the workers, who had earth or rough timber underfoot in their own quarters, pressed the fragments into a bed of lime on their terraces and beat them flat. That is it. That is the origin of a material now specified for airports, museums and half the fashionable kitchens in Australia. Someone with no floor, using rubbish they were not allowed to bin.",
      },
      { t: "h", text: "The vocabulary tells the story" },
      {
        t: "p",
        text: "The Italian names are unusually honest about the process. Seminato means sown, as in scattering seed, because that is literally the action: chips flung across a wet bed rather than placed. Battuto alla veneziana means beaten, in the Venetian manner. The first sealer, according to the trade's own history, was goat's milk, noticed by workers who saw that a spilled coating brought up the colour of the marble underneath. The technique was good enough that it climbed the social ladder fast. By the sixteenth and seventeenth centuries these floors were in Venetian palaces, and the trade had been granted formal guild standing. A pavement improvised from waste had been given legal status as a craft.",
      },
      { t: "h", text: "The scavenger's advantage" },
      {
        t: "p",
        text: "Here is the part that is not just a good yarn. Terrazzo works, technically and not only visually, because of how it was invented. Chips of stone suspended in a binder produce a floor with almost no shrinkage, no directional grain to fail along, and no joints to open up. It moves as one plane. It can be ground back and repolished, which means a terrazzo floor does not wear out so much as get thinner, slowly, over a century.",
      },
      {
        t: "p",
        text: "It is also why terrazzo has become the design world's favourite sustainability story. The material was recycled content five hundred years before anyone had the phrase, and modern terrazzo, and the porcelain that imitates it, still leans on exactly that: fragments of something else, held together and polished flat. There is a lesson in there about the difference between expensive and valuable. Terrazzo was born as the cheapest possible floor, made by people who could afford nothing else. It is now specified as a luxury finish. Nothing about the material changed. What changed was who was looking at it.",
      },
      { t: "h", text: "If you are considering it" },
      {
        t: "p",
        text: "Real terrazzo, poured and ground in place, is a specialist trade with a long program and a price to match, and it is glorious. Porcelain terrazzo look is a different proposition: it gives you the visual language at a fraction of the cost and program, with all the practical advantages of porcelain, but it is a photograph of a material rather than the material. Neither is the wrong answer. Just know which one you are buying, and know that the difference shows most at the edges, at a step or a skirting, where real terrazzo turns the corner as one continuous mass and porcelain has to be cut and joined.",
      },
    ],
    pullquote:
      "Nothing about the material changed. What changed was who was looking at it.",
    tieIn: ["graniglia-60-matt", "graniglia-60-lappato", "terroir-60"],
  },

  // ── 03 · TIMBER-LOOK (LEAD FEATURE) ───────────────────────────────────
  {
    id: "timber-look",
    kind: "article",
    section: "03 / Feature",
    title: "The year timber look tiles stopped looking",
    titleAccent: "fake",
    standfirst:
      "For decades, timber look tile was a compromise everyone could spot from the doorway. Then a printhead problem got solved in a Spanish factory, and the entire category changed. Here is what happened, and a ten second test you can run before you buy.",
    readMins: 6,
    imageSlug: "woodstock-212",
    blocks: [
      {
        t: "p",
        text: "If you looked at timber look tile in 2004 and have not looked since, your opinion of it is correct and out of date. Back then it was, frankly, obvious. You could stand at the door of a room and see the repeat: the same knot, the same grain, the same little dark flick recurring across the floor in a rhythm your eye picked up whether you wanted it to or not. Once seen, unseeable.",
      },
      {
        t: "p",
        text: "The reason was the printing process, and it is worth understanding, because it is still the single best predictor of whether a timber look tile will look convincing or cheap.",
      },
      { t: "h", text: "How tiles used to be decorated" },
      {
        t: "p",
        text: "Before about 2010, patterns were put onto tile by screen printing, either flat screens or engraved silicone rollers. Both work by pressing something physically against the tile, and that has consequences. Fine detail is limited, and critically, each screen or roller produces exactly one image. If you want variation in your floor you need multiple screens, and every extra screen is tooling that has to be engraved, stored and changed on the line, which means stopping the line. So a typical timber look run had four faces. Sometimes six. In cheap product, fewer. Four faces laid across forty square metres is a repeat every few tiles. That is exactly what your eye was catching from the doorway.",
      },
      { t: "h", text: "What changed" },
      {
        t: "p",
        text: "Around the turn of the century a Spanish company patented a machine that printed onto tile with inkjet heads, and showed the first industrial prototype at the Cevisama trade fair in 2000. The idea landed hard, and then stalled for most of a decade. Ceramic ink is not like ordinary ink: it carries suspended mineral pigment, it is thick and abrasive, and its colours change during firing, so what leaves the printhead is not what comes out of the kiln. The heads of the era clogged and failed.",
      },
      {
        t: "p",
        text: "The breakthrough came around 2007, when printheads arrived that could continuously recirculate ink around the nozzle, keeping the pigment moving and stopping it settling. That single engineering fix is the hinge the whole category turns on, because once printing is digital, faces are free. There is no tooling. Nothing touches the tile. The image comes off a file, so a manufacturer can print forty different faces, or eighty, or scan a genuine timber board and print every one of its planks as an individual. Timber look tile did not get better because designers got better. It got better because a printhead stopped clogging.",
      },
      { t: "h", text: "The ten second test" },
      {
        t: "p",
        text: "Which brings us to something you can do in any showroom, including this one, and we would encourage you to do it here. Pull ten planks off the display and lay them side by side on the floor. Then count how many are the same.",
      },
      {
        t: "list",
        items: [
          "Two or three identical in ten: you are looking at a four to six face product. It will read as repeating in any room bigger than a laundry, and it will read worst in the biggest, best lit space in your house.",
          "All ten different: you are looking at digitally printed product with a real face count.",
        ],
      },
      {
        t: "p",
        text: "Then do the second half. Run your fingers across the grain with your eyes shut. On good product the texture follows the printed grain: press a knot, feel a knot. On lesser product the surface texture is a generic wood embossing with no relationship to the image printed on top, because the two were made by different processes that were never registered to each other. Once you have felt the difference you cannot unfeel it. Neither test requires you to know anything about tile, both take under a minute, and both are things a salesperson cannot talk you out of, which is exactly why we are printing them.",
      },
      { t: "h", text: "The honest limitations" },
      {
        t: "lead",
        label: "Length.",
        text: "Real timber comes in random lengths. Tile comes in one, so every plank ends where every other plank ends unless the layout is deliberately staggered. Face count does not help you here. Layout does.",
      },
      {
        t: "lead",
        label: "The edges.",
        text: "A timber board has a machined edge. A pressed tile has a slightly rounded one, which reads as a shadow line at every joint. Rectified product largely solves this. Unrectified product does not, and it is the most common reason a beautiful tile looks wrong once installed.",
      },
      {
        t: "lead",
        label: "It is a photograph.",
        text: "A timber floor ages: it marks, silvers, and can be sanded back in twenty years. A timber look tile is fixed at the moment it left the kiln. That is at once its greatest advantage and the one thing it can never do.",
      },
      {
        t: "p",
        text: "What you are buying, then, is not an imitation of timber. It is a different material that has borrowed timber's visual language and traded away timber's biography for porcelain's indifference to water, sunlight, dogs, sand and children. In a Queensland house that opens onto a deck, that is frequently the better trade. But it is a trade, and anyone who tells you otherwise is selling.",
      },
      {
        t: "note",
        label: "Face count",
        text: "The number of different printed images in a product range. Four faces means four images, repeating. Forty faces means the repeat is effectively invisible at room scale. It is almost never printed on the box, it is always known to the supplier, and it is the single most useful question you can ask about a timber look tile.",
      },
    ],
    pullquote:
      "Timber look tile did not get better because designers got better. It got better because a printhead stopped clogging.",
    tieIn: ["heartwood-212", "woodstock-212", "esplanade-60"],
  },

  // ── 04 · PORCELAIN OR CERAMIC ─────────────────────────────────────────
  {
    id: "porcelain-ceramic",
    kind: "article",
    section: "04 / Explainer",
    title: "Porcelain or ceramic, settled with a bucket of",
    titleAccent: "water",
    standfirst:
      "Two words used almost interchangeably in showrooms, describing two genuinely different materials. The distinction is not marketing. It is a number, and you can measure it.",
    readMins: 4,
    imageSlug: "calcare-60-matt",
    blocks: [
      {
        t: "p",
        text: "Ask five people in a hardware aisle what the difference is between porcelain and ceramic and you will get five answers, most of them about price or quality or porcelain being harder. None of these is the actual definition. The actual definition is water absorption, and it is measured by weighing a dry tile, soaking it under controlled conditions, and weighing it again.",
      },
      {
        t: "p",
        text: "Porcelain absorbs half a percent of its weight in water or less. Everything above that line is something else, and the standards recognise a whole ladder of something else, running up to wall tiles that will happily take on ten or fifteen percent. That single number is the whole distinction. Everything people believe about porcelain, the hardness, the frost resistance, the outdoor suitability, the price, descends from it.",
      },
      { t: "h", text: "Where the number comes from" },
      {
        t: "p",
        text: "Clay bodies are porous. Firing drives out water and, at sufficient temperature, begins to vitrify the body: the mineral content partially fuses into a glassy matrix that fills the spaces between the particles. Push the temperature high enough, with a finely milled low impurity clay, and you close the pore structure almost entirely. A vitrified body is essentially a manufactured stone. It does not drink. A ceramic body fired lower and left more open is lighter, cheaper, easier to cut, and perfectly good for the job it is designed for. It is not a lesser product. It is a different one.",
      },
      { t: "diagram", kind: "pores" },
      { t: "h", text: "Why it matters much more outdoors" },
      {
        t: "p",
        text: "Indoors, on a dry floor, the difference is largely academic. You will not notice your bathroom floor's water absorption rate. Outdoors it becomes the entire argument, and on this coast for one reason above the others.",
      },
      {
        t: "lead",
        label: "Salt.",
        text: "Salt laden air and pool splash carry dissolved salts into any porous surface. The water evaporates, the salt stays and crystallises, and crystal growth inside a pore does slow mechanical damage from the inside. This is why the coast is unkind to porous stone, and why porcelain around a saltwater pool is not an upsell, it is an engineering decision.",
      },
      {
        t: "lead",
        label: "Staining.",
        text: "Anything a surface can absorb, it can be stained by: sunscreen, red wine, leaf tannin, barbecue fat, oil off the driveway. A body at half a percent has almost nowhere to put them.",
      },
      { t: "h", text: "The practical version" },
      {
        t: "list",
        items: [
          "Full body porcelain carries its colour through the thickness of the tile, so a chip does not reveal a pale body underneath. Worth the money in heavy traffic settings.",
          "Glazed porcelain is a porcelain body with a decorated glazed surface. Most timber looks, marble looks and concrete looks are this. The performance is in the body, the appearance is in the glaze.",
          "Ceramic is generally the right answer on walls, where its lighter weight is a genuine advantage to the tiler and its absorption is irrelevant.",
        ],
      },
      {
        t: "p",
        text: "And one thing to be blunt about: porcelain being harder cuts both ways. It is harder to cut, harder to drill, harder on blades and slower to lay. A quote for laying porcelain should not be the same as a quote for laying ceramic, and if it is, ask why.",
      },
    ],
    pullquote: "A vitrified body is essentially a manufactured stone. It does not drink.",
    tieIn: ["calcare-60-matt", "cabarita-60", "aspect-36-matt"],
  },

  // ── 05 · OFFSET / LIPPAGE ─────────────────────────────────────────────
  {
    id: "offset",
    kind: "article",
    section: "05 / Buying",
    title: "The two millimetres that decide",
    titleAccent: "everything",
    standfirst:
      "Why some tiles can be laid almost seamlessly and others cannot, and why the pattern you picked off Pinterest might be the reason your floor ends up with a lip you can catch a toe on.",
    readMins: 5,
    imageSlug: "colonnade-612",
    blocks: [
      {
        t: "p",
        text: "Two identically sized tiles can come off the same line and need completely different grout joints. One can be laid with a two millimetre gap and look almost continuous. The other needs four or five and will look wrong if you force it tighter. The difference is one process at the end of manufacturing, and it has a name most customers have never heard: rectification.",
      },
      { t: "h", text: "What rectified means" },
      {
        t: "p",
        text: "A tile is pressed, then fired, and firing shrinks it, not uniformly and not identically from tile to tile. A pressed tile therefore leaves the kiln at approximately the nominal size, with a slightly softened, slightly irregular edge. A rectified tile goes through an extra step: after firing, the edges are mechanically ground square and true to an exact dimension. Every tile in the box is now the same size, with a sharp ninety degree edge, and that precision is what buys you the narrow joint. The trade off is that a sharp ground edge is more vulnerable to chipping, and it demands a flatter substrate, because a tight joint has nowhere to hide a bump. Rectified tile is not simply better. It is more exacting: of the tile, of the floor underneath, and of the tiler.",
      },
      { t: "h", text: "There is a minimum, and it is not zero" },
      {
        t: "p",
        text: "People occasionally ask for a butt joint, no grout at all. Do not. Tile and substrate expand and contract at different rates, and the grout joint is the only thing absorbing that movement across the field of the floor. Remove it and the floor has one remaining way to relieve stress, which is to lift, or crack a tile, or both. As a practical guide, rectified porcelain generally wants two to three millimetres and pressed tile three to five, but follow the manufacturer's instruction over any rule of thumb including this one, because it is what the warranty is written against.",
      },
      { t: "h", text: "Now the important part: the offset problem" },
      {
        t: "p",
        text: "Here is the thing almost nobody is told before they choose a layout. Fired tiles are not perfectly flat. They are not meant to be. The standards permit a curvature of up to half a percent of the tile's length and still classify it as first quality. On a six hundred millimetre tile that is up to three millimetres of bow from end to centre, in a tile that is entirely within specification and that nobody could reject.",
      },
      { t: "diagram", kind: "offset" },
      {
        t: "p",
        text: "Now lay those tiles in a classic brick pattern, offset fifty percent, so the end joint of each plank lands at the exact centre of the plank below. You have just aligned the lowest point of one tile with the highest point of its neighbour. If one bows up and its neighbour bows down, the deviations add. That is lippage, a visible and feelable step between adjacent tiles, and on a floor lit by a window or a downlight raking along its length it is merciless. It shows as a line of shadows down the whole floor.",
      },
      {
        t: "p",
        text: "This is why the standard for any tile with a side longer than about three hundred and eighty millimetres, fifteen inches in the American standard the rule comes from, is a maximum offset of about a third, not a half, unless the manufacturer approves otherwise, and why plenty of makers now specify a quarter or less for very long planks. Move the joint to a third and it lands where the neighbouring tile is much closer to flat. The pattern still reads as staggered. It just stops fighting the physics. If someone insists on fifty percent on a long plank, the correct process is a mock up on site, looked at under the actual lighting, and signed off before the rest goes down. That is not a tiler being difficult. That is a tiler protecting you.",
      },
      { t: "h", text: "What to actually ask" },
      {
        t: "list",
        items: [
          "Is this tile rectified? It determines your joint width, your substrate prep, and how the floor will read.",
          "What offset does the manufacturer specify? It is in the installation guide, and it is binding on the warranty.",
          "Which direction does the light come from? Raking light along a floor exposes lippage that cross light hides completely, so it is worth laying planks away from the main light source rather than along it.",
        ],
      },
    ],
    pullquote:
      "A tile can bow three millimetres and still be first quality. Lay it at a fifty percent offset and you have stacked the worst point of one tile against the worst point of the next.",
    tieIn: ["colonnade-612", "arcadia-grande-612", "strata-612-matt"],
  },

  // ── 06 · THERMAL MASS ─────────────────────────────────────────────────
  {
    id: "thermal",
    kind: "article",
    section: "06 / Climate",
    title: "The coolest thing in the",
    titleAccent: "house",
    standfirst:
      "Tile floors have been standard in hot climates for several thousand years. That is not tradition. It is thermodynamics, though in the subtropics the argument is more interesting than most people assume.",
    readMins: 4,
    imageSlug: "lustre-60-polished",
    blocks: [
      {
        t: "p",
        text: "Walk barefoot from a rug onto a tiled floor in February and the tile feels cold. It is not. Both are sitting at the same room temperature. What you are feeling is the tile pulling heat out of your foot faster than the rug can, because dense mineral materials conduct heat well and fibres do not. That is a small parlour trick, but the mechanism behind it is doing real work in a Queensland house, including the part where it does not work.",
      },
      { t: "h", text: "Thermal mass, briefly" },
      {
        t: "p",
        text: "Dense materials like concrete, stone and ceramic store a lot of heat energy for each degree of temperature change. Lightweight materials do not. A concrete slab with tile over it is a large thermal battery sitting in the middle of your house. When the air is hotter than the slab, the slab absorbs heat and the room warms more slowly. When the air is cooler, the slab gives it back. The effect is not that the house gets cooler on average. It is that the peaks get flattened and delayed. A high mass house does not hit its hottest point at two in the afternoon with the outside air. It lags by hours, and rides out the worst of the afternoon on stored coolness from the night before.",
      },
      { t: "diagram", kind: "thermal" },
      { t: "h", text: "The subtropical complication" },
      {
        t: "p",
        text: "Now the honest part, because this is where most articles on thermal mass stop and should not. Thermal mass only pays off if you can discharge it. The slab has to be able to dump its stored heat overnight, or by morning it is still warm and you start the next day already behind. On the Sunshine Coast in February, when the overnight low is twenty two degrees and the humidity is brutal, the swing is narrow, and a slab that cannot cool down becomes a liability rather than an asset.",
      },
      {
        t: "p",
        text: "So the correct statement is not that thermal mass is good in Queensland. It is that thermal mass works in the subtropics when it is shaded and when night air can move across it. Which is why the traditional Queensland answer was the opposite approach entirely: a lightweight timber house up on stumps that dumped its heat the moment the sun went down. Both strategies are valid. They are just different bets. If you have a slab on ground house, and most new building on the coast is, you already own the mass. The question is only whether it is working for you: keep summer sun off the floor with eaves and shading, open the house up at night, and keep the slab out of the western afternoon sun through unshaded glass.",
      },
      { t: "h", text: "The things nobody puts in the brochure" },
      {
        t: "lead",
        label: "Humidity.",
        text: "A dense, non absorbent floor does not hold moisture. In a coastal climate carpet and its underlay do, and the difference over a decade, in smell and in what grows in it, is not subtle.",
      },
      {
        t: "lead",
        label: "Sand.",
        text: "A tiled floor and a house forty minutes from a beach are made for each other. Sand does not bed into it, does not grind fibres, and comes off with a broom.",
      },
      {
        t: "lead",
        label: "Water.",
        text: "The relevant scenario here is not a spilled drink. It is a storm or a failed hot water service. A porcelain floor over a slab is one of very few finishes that can be under water and then, once dried and cleaned properly, simply be a floor again.",
      },
      {
        t: "lead",
        label: "Acoustics.",
        text: "The honest counterweight. Hard floors are reflective, and a large tiled open plan space will ring. This is solvable with rugs, soft furnishings and considered ceilings, but it should be solved deliberately at design stage rather than discovered at the housewarming.",
      },
    ],
    pullquote:
      "Thermal mass is not good or bad in Queensland. It is good if it is shaded and can breathe at night, and a liability if it cannot.",
    tieIn: ["lustre-60-polished", "riviera-60-polished", "estella-60"],
  },

  // ── 07 · SHOWCASE: ONE TILE, EVERY ROOM ───────────────────────────────
  {
    id: "one-tile",
    kind: "showcase",
    section: "07 / Showcase",
    title: "One tile, every",
    titleAccent: "room",
    standfirst:
      "The hardest thing to do in a showroom is imagine. So we took a single tile from our own range and followed it through one coastal home, room to room.",
    readMins: 2,
    gallerySlug: "heartwood-212",
    blocks: [
      {
        t: "p",
        text: "A three hundred millimetre sample held at chest height under showroom lights is a genuinely poor way to judge a floor, and everyone in this industry knows it. Three things go wrong. Scale, because a sample cannot show you how a pattern reads at ten paces. Light, because showroom lighting is bright and even and your house is neither. And context, because a tile is never seen alone. It is seen against your joinery, your walls, and whatever the afternoon sun is doing through the western window.",
      },
      {
        t: "p",
        text: "So rather than explain that, we have shown it. What follows is one tile, a single product you could order this afternoon, running through the rooms of one home: the living floor, the kitchen, the bathroom, and out to the covered alfresco. Notice what changes and what does not. The tile is the same in every image. The differences are grout colour, layout, the materials beside it, and the light. Those four things are the actual design decisions, and all four are free.",
      },
      {
        t: "note",
        label: "A note on honesty",
        text: "These room images are visualisations, generated to show a real product from our range in a range of real world settings. We would rather tell you that than pretend a new shop has photographed forty finished homes. The tile is real, the colour is true, and every one is in stock. When we have photographed enough finished OnWood projects, these pages will be the first to change.",
      },
    ],
    tieIn: ["heartwood-212", "cabarita-612", "terroir-60"],
  },

  // ── CLOSING ───────────────────────────────────────────────────────────
  {
    id: "closing",
    kind: "closing",
    section: "Thanks for reading",
    title: "Come and see it full",
    titleAccent: "size",
    standfirst:
      "Everything in these pages is on a board in the showroom, in real light, waiting for you to take a corner of it home.",
    imageSlug: "cortile",
    blocks: [
      {
        t: "p",
        text: "A magazine can start an idea. A full size board in the light of the room it will live in is how you finish one. Our showroom is at Baringa, inside the Aura community on the southern Sunshine Coast, an easy run from Caloundra, Pelican Waters, Kawana and the hinterland. Bring your plans, a photo, or nothing at all. Take four samples home and sit with them for a fortnight. We are supply only, we will help you work out your quantities, and we will tell you honestly when the tile you love is wrong for the room you love it for.",
      },
      {
        t: "p",
        text: "If you are a builder or a tiler, we run a trade partner program with trade pricing and online ordering, so your project team can order straight from our range. And if you simply enjoyed the read, that is enough. We will see you in the next batch.",
      },
    ],
    tieIn: ["marrakesh-decor", "estella-60", "arcadia-grande-612"],
  },
];
