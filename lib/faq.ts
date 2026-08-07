// FAQ content for OnWood Tiles. Kept as plain data (separated from the page's
// presentation) so the design can be re-skinned or moved into OnBase later
// without touching the copy. Answers are Markdown (inline [links](/path) only),
// rendered by lib/markdown.tsx. No em-dashes in customer copy (brand rule).

export type FaqItem = { q: string; a: string };
export type FaqCategory = { slug: string; title: string; items: FaqItem[] };

export const FAQ_HEAD = {
  eyebrow: "Help centre",
  headA: "Questions,",
  headAccent: "answered",
  intro:
    "Everything we get asked in the showroom, written down plainly. If your question is not here, ask us and a real person on the Sunshine Coast will answer it.",
  tipsTitle: "Three things worth doing",
  tips: [
    "Take a full-size sample home and look at it in daylight.",
    "Allow 10% extra for straight lays, 15% for patterns.",
    "Order the lot at once so it all comes from one batch.",
  ],
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    slug: "ordering",
    title: "Ordering & Samples",
    items: [
      {
        q: "Do you sell to the public, or trade only?",
        a: "Both. Anyone is welcome to buy from us, whether you are a homeowner doing one bathroom or a builder tiling a whole project. Trade partners get their own pricing through our online [trade portal](/trade/login).",
      },
      {
        q: "Can I get samples before I commit?",
        a: "Yes, and we recommend it. Tiles shift in colour and scale depending on the light, so take a sample home and look at it in the actual room, in daylight, before you decide. Pop into the showroom or [send us an enquiry](/contact) and we will sort samples for you.",
      },
      {
        q: "How do I place an order?",
        a: "Browse the [range online](/shop), then enquire or visit the showroom and we will put your order together. Trade partners can order directly online through the trade portal, and web orders flow straight through to our team.",
      },
      {
        q: "Can you reserve or hold stock for me?",
        a: "Yes. A deposit will hold your quantity so it does not sell out from under you while you finalise your plans. Specials and clearance stock can move quickly, so it is worth reserving early.",
      },
      {
        q: "Do you only sell tiles, or the bits around them too?",
        a: "We can supply the whole job: your tiles plus the matched adhesive, grout, trims and accessories your tiler needs, worked out for your space and supplied as one package, ready to lay.",
      },
    ],
  },
  {
    slug: "pricing",
    title: "Pricing & Trade",
    items: [
      {
        q: "Are your prices per square metre, and do they include GST?",
        a: "Yes. Prices are shown per square metre, GST inclusive, and supply only.",
      },
      {
        q: "I am a builder, tiler or designer. Can I get trade pricing?",
        a: "Absolutely. We set up trade partners with their own account and pricing, then you order online and see your price against the full range. [Get in touch](/contact) to get started.",
      },
      {
        q: "How do I become a trade partner?",
        a: "Send us a message with a few details about your business and we will set up your trade account and pricing tier, then send your login for the [trade portal](/trade/login).",
      },
      {
        q: "Do you run specials?",
        a: "Yes, we refresh clearance runs, end-of-line stone and whole-home tile packages regularly. Have a look at our [Specials page](/specials) for what is on right now, while stocks last.",
      },
      {
        q: "Is there a minimum order?",
        a: "No minimum for most orders. Some bundle or special-buy deals have their own terms, and we will always spell those out up front.",
      },
    ],
  },
  {
    slug: "delivery",
    title: "Delivery & Pickup",
    items: [
      {
        q: "Do you deliver?",
        a: "Yes. We deliver across our Sunshine Coast zones, or you are welcome to collect from the showroom. Delivery is quoted with your order based on size and location.",
      },
      {
        q: "Can I pick up from the showroom?",
        a: "Yes. Once your order is ready we will let you know, and you can collect it from us at a time that suits.",
      },
      {
        q: "How long until my order is ready?",
        a: "In-stock lines are usually ready quickly. Special-order or indent ranges have a lead time from the supplier, and we will give you a realistic timeframe when you order.",
      },
      {
        q: "Do you deliver beyond the Sunshine Coast?",
        a: "Our home patch is the Sunshine Coast and wider South East Queensland. If you are further afield, [ask us](/contact) and we will let you know what is possible.",
      },
      {
        q: "How should I check my order when it arrives?",
        a: "Give it a quick once-over on delivery or collection. If anything looks damaged or is not right, let us know promptly and we will make it right.",
      },
    ],
  },
  {
    slug: "products",
    title: "Products & Suitability",
    items: [
      {
        q: "What is the difference between porcelain, ceramic and natural stone?",
        a: "In short: porcelain is the dense, hard-wearing all-rounder for floors and wet areas, ceramic is lighter and lovely on walls and splashbacks, and natural stone brings real texture but needs a little more care. Our [room-by-room guide](/blog/porcelain-ceramic-natural-stone-guide) walks through it.",
      },
      {
        q: "Which tiles are safe outdoors or around a pool?",
        a: "Look for slip-rated porcelain. Around pools and wet zones you want a grippier finish, a higher P or R rating, and ideally something barefoot-friendly. Our [slip ratings guide](/blog/tile-slip-ratings-explained) explains exactly what to use where, and we will match a finish to each zone.",
      },
      {
        q: "Can I use the same tile inside and out?",
        a: "Often, yes. Many ranges come in a smooth indoor version and a matched grippy in-out version of the same colour, so you can carry one look from the living room straight out to the alfresco.",
      },
      {
        q: "Do you have timber-look tiles?",
        a: "We do, in wood-look porcelain. You get the warmth and grain of timber with none of the swelling, sealing or scratching, so it works in wet areas and outdoors where real timber cannot. Here is [how it compares to real timber](/blog/timber-look-tiles-vs-timber-flooring).",
      },
      {
        q: "Will the tiles look exactly like the photos on the website?",
        a: "Treat online images as a guide, not a perfect match. Some are digitally rendered, screens vary, and tiles and natural stone shift naturally between batches. Always confirm your choice from a current physical sample, and you can [read our imagery note](/terms-of-use#ai-imagery) for the detail.",
      },
      {
        q: "Do tiles need sealing?",
        a: "Most porcelain does not need sealing. Natural stone and grout will thank you for it, and we will tell you what your specific selection needs.",
      },
    ],
  },
  {
    slug: "measuring",
    title: "Measuring & Quantities",
    items: [
      {
        q: "How do I work out how much tile I need?",
        a: "Measure the area in square metres, then add wastage for cuts and offcuts. Bring your measurements or plans in and we will do the maths with you, including how many boxes or sheets that comes to.",
      },
      {
        q: "How much extra should I order?",
        a: "As a rule of thumb, allow around 10% extra for straight lays and 15% for patterns, herringbone or diagonal work. It is also worth keeping a few spares from the same batch, just in case.",
      },
      {
        q: "Can you help me calculate quantities?",
        a: "Yes, that is one of our favourite parts. Share your room sizes or plans and we will convert them into the right number of tiles, allowing for wastage so you are not caught short.",
      },
      {
        q: "What is a dye lot or batch, and why does it matter?",
        a: "Tiles are made in batches, and colour can vary slightly from one batch to the next. Order all you need at once so it comes from the same batch, and keep a few spares aside for future repairs.",
      },
      {
        q: "Do you supply everything my tiler needs?",
        a: "Yes. We can bundle your tiles with matched adhesive, grout, trims and accessories, coverage worked out with wastage allowed, and supplied from one batch wherever possible.",
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Warranty",
    items: [
      {
        q: "Can I return leftover or unopened tiles?",
        a: "Returns are considered case by case on unopened, full boxes within a reasonable time, and a restocking fee may apply. Special-order and clearance items are generally not returnable. See our [Terms of Sale](/terms-of-sale) for the details.",
      },
      {
        q: "What if my tiles arrive damaged?",
        a: "Let us know as soon as you spot it after delivery or collection and we will arrange replacements. A little breakage in transit occasionally happens, which is why we suggest ordering a few spares.",
      },
      {
        q: "Are the tiles under warranty?",
        a: "Tiles carry their manufacturer warranties, which we pass on to you. As we are supply only, installation itself is between you and your tiler.",
      },
      {
        q: "Do I need to pay a deposit?",
        a: "Yes. A 50% deposit confirms your order and secures your stock, with the balance due before delivery or collection.",
      },
      {
        q: "Is colour or batch variation a fault?",
        a: "No, natural variation in tone, veining and finish is part of the character of tiles and stone, not a defect. Viewing a full-size sample before you buy is the best way to know what to expect.",
      },
    ],
  },
  {
    slug: "visiting",
    title: "Visiting Us",
    items: [
      {
        q: "Can I visit the showroom?",
        a: "Yes, we would love that. We are on the Sunshine Coast, and seeing full-size boards and big-format samples in person makes choosing so much easier. [Book a visit](/book) and we will send you the details.",
      },
      {
        q: "Do I need an appointment?",
        a: "Walk-ins are welcome during opening hours. If you would like a dedicated selections session, [book a time](/book) and we will set aside someone to help you.",
      },
      {
        q: "What are your opening hours?",
        a: "We are open Monday to Saturday. Current hours are always shown at the bottom of the website.",
      },
      {
        q: "Can I bring my plans and other finishes?",
        a: "Please do. Bring your plans, photos, and any joinery, benchtop or paint samples, and we will help you match the whole room, not just the tile.",
      },
      {
        q: "Do you offer design or selection help?",
        a: "Yes. From matching a wood-look to your deck to building a full palette, we help you choose and lay it out so the whole room works together. Our [vision board](/#showroom) is a good place to start online.",
      },
    ],
  },
];

/** Flat list of every Q&A, for the FAQPage JSON-LD schema. */
export const allFaqItems = (): FaqItem[] => FAQ_CATEGORIES.flatMap((c) => c.items);
