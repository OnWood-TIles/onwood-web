import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getTaxonomy, listRanges } from "../../lib/onbase/client";
import { makeCandidates, MOOD_IMAGES } from "../../lib/quiz";
import QuizClient from "./QuizClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Your Tile — Style Quiz",
  description:
    "Answer a few playful questions and we'll match you with a tile that suits your style — and show you it in a real room. A fun little tool from OnWood Tiles on the Sunshine Coast.",
  keywords: "tile style quiz, which tile is right for me, find your tile, tile finder, bathroom tile ideas, Sunshine Coast tiles",
  alternates: { canonical: "https://onwoodtiles.com.au/quiz" },
  openGraph: {
    title: "Find Your Tile — OnWood Style Quiz",
    description: "A few questions, one tile that's *so* you — see it installed.",
    url: "https://onwoodtiles.com.au/quiz",
    siteName: "OnWood Tiles",
    locale: "en_AU",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Find Your Tile — OnWood Style Quiz", description: "A few questions, one tile that's so you." },
};

// Tiles ONLY (Reagan's call) — exclude stone veneer / cladding and hardware.
const isTile = (s: string) => /tile/i.test(s) && !/stone|veneer|cladd/i.test(s);

export default async function QuizPage() {
  const taxonomy = await getTaxonomy().catch(() => []);
  const depts = taxonomy.filter((d) => isTile(d.slug) || isTile(d.label));
  const lists = await Promise.all(depts.map((d) => listRanges({ department: d.slug }).catch(() => [])));
  // Dedupe colourways by room-shot url (a range can surface under >1 department).
  const seen = new Set<string>();
  const candidates = makeCandidates(lists.flat()).filter((c) => (seen.has(c.img) ? false : (seen.add(c.img), true)));

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <QuizClient candidates={candidates} moodImages={MOOD_IMAGES} />
      <MarketingFooter />
    </div>
  );
}
