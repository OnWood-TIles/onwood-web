import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarketingNav from "../../../components/marketing/MarketingNav";
import MarketingFooter from "../../../components/marketing/MarketingFooter";
import { getBuilder } from "../../../../lib/onbase/client";
import { VANITY_BUILDER_PUBLIC } from "../../../../lib/flags";
import { BUILDER_CSS } from "../builderCss";
import VanityBuilder from "./VanityBuilder";

export const dynamic = "force-dynamic";

// Until launch the builder is staff-only (proxy.ts) and reads unpublished models.
const PREVIEW = !VANITY_BUILDER_PUBLIC;
const shortName = (n: string) => n.replace(/^Marquis\s+/i, "");
const kindWord = (kinds: string[]) => (kinds.includes("vanity") ? "vanity" : kinds[0] === "tallboy" ? "tallboy" : kinds[0] === "shaver" ? "shaving cabinet" : "mirror");

export async function generateMetadata({ params }: { params: Promise<{ range: string }> }): Promise<Metadata> {
  const { range } = await params;
  const b = await getBuilder(range, PREVIEW);
  if (!b) return { title: "Vanity builder" };
  const kind = kindWord(b.kinds);
  return {
    title: `Build your ${shortName(b.name)} ${kind}`,
    description: `Choose the size, mounting, benchtop and extras for a ${b.name} ${kind} and see the price as you go. Made to order in Australia.`,
    alternates: { canonical: `https://onwoodtiles.com.au/vanities/build/${b.slug}` },
    ...(PREVIEW ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function BuilderPage({ params, searchParams }: { params: Promise<{ range: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ range }, sp] = await Promise.all([params, searchParams]);
  const b = await getBuilder(range, PREVIEW);
  if (!b) notFound();
  const query = Object.fromEntries(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
  const kind = kindWord(b.kinds);

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <style>{BUILDER_CSS}</style>
      <MarketingNav />
      <main className="vb-wrap">
        {PREVIEW && <span className="vb-preview">Staff preview · not public yet</span>}
        <header className="vb-head">
          <div className="vb-eyebrow"><Link href="/vanities/build" style={{ color: "inherit", textDecoration: "none" }}>Build your own</Link> · {b.supplier}</div>
          <h1>{shortName(b.name)}</h1>
          <p>{b.description || `Pick your size, mounting, benchtop and extras and watch the price update as you go. Every ${kind} is made to order in Australia, and we help you choose the finish and handles.`}</p>
        </header>
        <VanityBuilder builder={b} query={query} />
      </main>
      <MarketingFooter />
    </div>
  );
}
