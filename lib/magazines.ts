// OnWood's printed + online magazines. Each one is laid out as a print PDF, then rendered with PDFium
// to exact-colour page images in public/magazines/<slug>/pages (01.webp .. NN.webp) plus a lean
// download PDF. Kept as a bundled constant (not a runtime fs read): public/ is not reliably on the
// Vercel serverless filesystem. Render with onwood-web/_work/pdfium/_web-render.mjs.

export type Magazine = {
  slug: string;
  title: string;
  issue: string;
  /** One line for cards and metadata. */
  standfirst: string;
  description: string;
  pages: number;
  /** Rendered page size in px, so the flip viewer matches the print shape. */
  pageW: number;
  pageH: number;
  download: string;
  cover: string;
  /** Short list for the landing page card. */
  inside: string[];
};

export const MAGAZINES: Magazine[] = [
  {
    slug: "kiln",
    title: "Kiln",
    issue: "Issue 01 · 2027",
    standfirst: "A magazine about inspiration, and a deeper understanding of what goes underfoot.",
    description:
      "Kiln is the OnWood Tiles magazine: the history of the subway tile, terrazzo, timber look, porcelain or ceramic, grout, terracotta, pool mosaics and honest buying guides for coastal Queensland homes.",
    pages: 40,
    pageW: 1786,
    pageH: 2523,
    download: "/kiln.pdf",
    cover: "/images/magazines/kiln-cover.webp",
    inside: ["The white tile that went everywhere", "When timber look stopped looking fake", "Glazed by hand, and terracotta comes home", "Why you cannot have no grout at all"],
  },
  {
    slug: "vanity-edition",
    title: "Kiln: The Vanity Edition",
    issue: "Issue 01 · 2027",
    standfirst: "Made to order, made here. Everything you need to choose a Marquis vanity.",
    description:
      "Kiln: The Vanity Edition is OnWood's guide to Marquis vanities: sizes and mounting, handles and fingerpulls, benchtops, basins, Duragrain, Thermograin and painted finishes, measuring up and the little extras.",
    pages: 40,
    pageW: 1783,
    pageH: 2524,
    download: "/kiln-vanity-edition.pdf",
    cover: "/images/magazines/vanity-edition-cover.webp",
    inside: ["Seven decisions that make a vanity yours", "Board, wrap or paint? The finish guide", "Know your benchtop", "Measure before you fall in love"],
  },
];

export const magazineBySlug = (slug: string) => MAGAZINES.find((m) => m.slug === slug);
