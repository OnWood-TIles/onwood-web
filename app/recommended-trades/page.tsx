import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import Reveal from "../components/ui/Reveal";
import TradeEnquiry from "./TradeEnquiry";
import { getBusiness, getTrades, type TradeListing } from "../../lib/onbase/client";
import { rs } from "../../lib/rs";

// Our recommended trades: the published trades from OnBase (Contacts > Recommended Trades), grouped by
// category, with Call / Website / Send an enquiry. Enquiries go to OnWood, who pass them on.

export const dynamic = "force-dynamic";

const SITE = "https://onwoodtiles.com.au";
const URL_ = `${SITE}/recommended-trades`;
const QBCC_SEARCH = "https://www.qbcc.qld.gov.au/node/7086";

export const metadata: Metadata = {
  title: { absolute: "Recommended Tilers & Trades Sunshine Coast | OnWood Tiles" },
  description: "Local tilers, waterproofers, builders and trades we know and recommend on the Sunshine Coast. Call them, visit their website or send an enquiry.",
  alternates: { canonical: URL_ },
  openGraph: { title: "Our recommended trades | OnWood Tiles", description: "Local tradies we know and recommend on the Sunshine Coast.", url: URL_, type: "website" },
};

const ld = (o: object) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(o).replace(/</g, "\\u003c") }} />;
const it: React.CSSProperties = { fontFamily: "var(--font-newsreader)", fontStyle: "italic", fontWeight: 400, color: "var(--sea)" };
const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const shortUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const abnText = (a: string) => (a.length === 11 ? `${a.slice(0, 2)} ${a.slice(2, 5)} ${a.slice(5, 8)} ${a.slice(8)}` : a);
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

function TradeCard({ t, anchor }: { t: TradeListing; anchor: boolean }) {
  const name = t.businessName || t.contactName || "";
  return (
    <article id={anchor ? t.slug : undefined} className="rt-card">
      <div className="rt-card-top">
        <div className="rt-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {t.logoUrl ? <img src={rs(t.logoUrl, 256)} alt={`${name} logo`} loading="lazy" /> : <span>{initials(name)}</span>}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 className="rt-name">{name}</h3>
          {t.contactName && t.businessName && <p className="rt-contact">{t.contactName}</p>}
          <div className="rt-badges">
            {t.qbccLicence && <a href={QBCC_SEARCH} target="_blank" rel="noopener noreferrer nofollow" className="rt-badge rt-badge-qbcc" title="Check this licence on the QBCC register">QBCC licence {t.qbccLicence}</a>}
            {t.abn && <span className="rt-badge">ABN {abnText(t.abn)}</span>}
          </div>
        </div>
      </div>
      {t.blurb && <p className="rt-blurb">{t.blurb}</p>}
      {t.skills.length > 0 && <ul className="rt-chips" aria-label="Skills">{t.skills.map((s) => <li key={s}>{s}</li>)}</ul>}
      {t.serviceAreas.length > 0 && (
        <p className="rt-areas">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          <span>{t.serviceAreas.join(" · ")}</span>
        </p>
      )}
      <div className="rt-actions">
        {t.phone && <a href={telHref(t.phone)} className="rt-btn rt-btn-solid">Call {t.phone}</a>}
        {t.website && <a href={t.website} target="_blank" rel="noopener noreferrer nofollow" className="rt-btn rt-btn-outline">{shortUrl(t.website)} ↗</a>}
        <TradeEnquiry slug={t.slug} name={name} />
      </div>
    </article>
  );
}

export default async function RecommendedTradesPage() {
  const [groups, biz] = await Promise.all([getTrades().catch(() => []), getBusiness().catch(() => null)]);
  const seen = new Set<string>();
  const total = new Set(groups.flatMap((g) => g.trades.map((t) => t.slug))).size;

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Recommended trades", item: URL_ },
      ] })}
      <MarketingNav />
      <main>
        <section className="rt-hero">
          <div className="rt-wrap">
            <Reveal>
              <p className="rt-eyebrow">Recommended trades</p>
              <h1 className="rt-h1">Trades we know and <em style={it}>recommend.</em></h1>
              <p className="rt-lede">
                Local tilers, waterproofers, builders and trades on the Sunshine Coast that our customers ask us about.
                Call them directly, visit their website, or send an enquiry and we&apos;ll pass it on.
              </p>
              {total > 0 && (
                <div className="rt-stats">
                  <span><strong>{total}</strong> local {total === 1 ? "trade" : "trades"}</span>
                  <span><strong>{groups.length}</strong> {groups.length === 1 ? "category" : "categories"}</span>
                  <span><strong>Free</strong> to contact</span>
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {groups.length > 0 && (
          <nav className="rt-catnav" aria-label="Trade categories">
            <div className="rt-wrap rt-catnav-inner">
              {groups.map((g) => <a key={g.slug} href={`#${g.slug}`} className="rt-catlink">{g.name} <span>{g.trades.length}</span></a>)}
            </div>
          </nav>
        )}

        <div className="rt-wrap" style={{ paddingBottom: 40 }}>
          {groups.length === 0 ? (
            <div className="rt-empty">
              <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 24, margin: "0 0 8px" }}>We&apos;re putting our list together</h2>
              <p style={{ margin: 0, color: "#3a444a" }}>Ask us in the showroom{biz?.phone ? <> or call <a href={telHref(biz.phone)} style={{ color: "var(--accent)" }}>{biz.phone}</a></> : null} and we&apos;ll point you to a trade we trust.</p>
            </div>
          ) : groups.map((g) => (
            <section key={g.slug} id={g.slug} className="rt-section">
              <div className="rt-section-head">
                <h2 className="rt-h2">{g.name}</h2>
                {g.description && <p className="rt-section-desc">{g.description}</p>}
              </div>
              <div className="rt-grid">
                {g.trades.map((t) => {
                  const anchor = !seen.has(t.slug);
                  seen.add(t.slug);
                  return <TradeCard key={t.slug} t={t} anchor={anchor} />;
                })}
              </div>
            </section>
          ))}

          <section className="rt-band">
            <div>
              <h2 className="rt-h2" style={{ color: "#fff", margin: "0 0 8px" }}>Are you a local tradie?</h2>
              <p style={{ margin: 0, color: "#cfe3e1", lineHeight: 1.6, maxWidth: "52ch" }}>We&apos;re always keen to hear from great tilers, waterproofers and builders. Come and say hello in the showroom, or get in touch and tell us about your work.</p>
            </div>
            <Link href="/contact" className="rt-btn rt-btn-light">Get in touch</Link>
          </section>

          <p className="rt-disclaimer">
            These businesses are independent of OnWood Tiles. We recommend them based on our experience, but we don&apos;t supervise their work and aren&apos;t responsible for it.
            Before you go ahead, get a written quote and check their licence and insurance. You can check a QBCC licence on the{" "}
            <a href={QBCC_SEARCH} target="_blank" rel="noopener noreferrer nofollow">QBCC licence register</a>.
          </p>
        </div>
      </main>
      <MarketingFooter />
      <style>{`
        .rt-wrap { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
        .rt-hero { position: relative; overflow: hidden; padding: clamp(96px,16vw,150px) 0 26px;
          background: radial-gradient(1100px 460px at 85% -10%, color-mix(in srgb, var(--sea) 13%, transparent), transparent 62%); }
        .rt-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); margin: 0; }
        .rt-h1 { font-family: var(--font-archivo); font-weight: 900; letter-spacing: -.03em; font-size: clamp(36px,5.6vw,64px); line-height: 1.02; margin: 14px 0 0; max-width: 16ch; }
        .rt-lede { font-size: 17.5px; line-height: 1.7; color: #3a444a; max-width: 60ch; margin: 18px 0 0; }
        .rt-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
        .rt-stats span { background: var(--surface); border: 1px solid var(--line); border-radius: 99px; padding: 8px 14px; font-size: 14px; color: #3a444a; }
        .rt-stats strong { color: var(--ink); }
        .rt-catnav { position: sticky; top: 64px; z-index: 5; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
        .rt-catnav-inner { display: flex; gap: 8px; overflow-x: auto; padding-top: 12px; padding-bottom: 12px; scrollbar-width: none; }
        .rt-catlink { flex-shrink: 0; text-decoration: none; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 99px; padding: 8px 14px; font-weight: 700; font-size: 14px; }
        .rt-catlink span { color: var(--muted); font-weight: 600; margin-left: 4px; }
        .rt-catlink:hover { border-color: var(--accent); color: var(--accent); }
        .rt-section { padding-top: 46px; scroll-margin-top: 130px; }
        .rt-section-head { margin-bottom: 18px; }
        .rt-h2 { font-family: var(--font-archivo); font-weight: 800; font-size: clamp(24px,3vw,32px); letter-spacing: -.02em; margin: 0; }
        .rt-section-desc { color: #3a444a; margin: 6px 0 0; max-width: 70ch; line-height: 1.6; }
        .rt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
        .rt-card { scroll-margin-top: 140px; display: flex; flex-direction: column; gap: 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 22px; padding: 22px;
          box-shadow: 0 18px 44px -34px rgba(30,20,10,.45); transition: transform .2s ease, box-shadow .2s ease; }
        .rt-card:hover { transform: translateY(-2px); box-shadow: 0 26px 54px -34px rgba(30,20,10,.5); }
        .rt-card:target { outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent); outline-offset: 3px; }
        .rt-card-top { display: flex; gap: 14px; align-items: center; }
        .rt-logo { width: 72px; height: 72px; flex-shrink: 0; border-radius: 16px; border: 1px solid var(--line); background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .rt-logo img { width: 100%; height: 100%; object-fit: contain; }
        .rt-logo span { font-family: var(--font-archivo); font-weight: 900; font-size: 24px; color: #fff; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(140deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--sea))); }
        .rt-name { font-family: var(--font-archivo); font-weight: 800; font-size: 20px; line-height: 1.2; margin: 0; }
        .rt-contact { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
        .rt-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .rt-badge { font-size: 11.5px; font-weight: 700; letter-spacing: .02em; color: #3a444a; background: color-mix(in srgb, var(--sea) 9%, var(--surface)); border-radius: 99px; padding: 4px 9px; text-decoration: none; }
        .rt-badge-qbcc { color: #11613b; background: #e6f4ec; }
        .rt-blurb { margin: 0; font-size: 15px; line-height: 1.65; color: #3a444a; }
        .rt-chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px; }
        .rt-chips li { font-size: 12.5px; font-weight: 600; color: var(--ink); background: color-mix(in srgb, var(--accent) 10%, var(--surface)); border-radius: 99px; padding: 5px 10px; }
        .rt-areas { display: flex; gap: 6px; align-items: flex-start; margin: 0; font-size: 13.5px; color: var(--muted); line-height: 1.5; }
        .rt-areas svg { flex-shrink: 0; margin-top: 3px; color: var(--accent); }
        .rt-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 4px; }
        .rt-btn { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border-radius: 99px; padding: 11px 16px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; line-height: 1.1; }
        .rt-btn-solid { background: var(--accent); color: #fff6ee; border: 1px solid var(--accent); }
        .rt-btn-outline { background: var(--surface); color: var(--ink); border: 1px solid var(--line); }
        .rt-btn-outline:hover { border-color: var(--ink); }
        .rt-btn-light { background: #fff; color: var(--ink); border: none; white-space: nowrap; }
        .rt-btn:disabled { opacity: .7; }
        .rt-band { margin-top: 56px; background: #17262d; border-radius: 22px; padding: clamp(24px,4vw,40px); display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; }
        .rt-empty { margin-top: 30px; border: 1.5px dashed var(--line); border-radius: 22px; padding: 40px 24px; text-align: center; background: var(--surface); }
        .rt-disclaimer { font-size: 13px; color: var(--muted); line-height: 1.6; margin: 28px 0 0; max-width: 90ch; }
        .rt-disclaimer a { color: var(--accent); }
        .rt-dialog { border: none; border-radius: 22px; padding: 0; width: min(560px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); background: var(--bg); color: var(--ink); box-shadow: 0 30px 80px -30px rgba(0,0,0,.5); }
        .rt-dialog::backdrop { background: rgba(14,26,32,.55); }
        .rt-dialog-inner { position: relative; padding: 26px; }
        .rt-close { position: absolute; top: 10px; right: 12px; border: none; background: none; font-size: 28px; line-height: 1; color: var(--muted); cursor: pointer; }
        @media (max-width: 520px) { .rt-grid { grid-template-columns: 1fr; } .rt-card { padding: 18px; } .rt-catnav { top: 56px; } }
      `}</style>
    </div>
  );
}
