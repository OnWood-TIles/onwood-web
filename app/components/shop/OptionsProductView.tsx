import Link from "next/link";
import type { ReactNode } from "react";
import type { WebsiteRange } from "../../../lib/onbase/client";
import { BUILDER_CSS } from "./builderCss";
import OptionsBuilder from "./OptionsBuilder";
import PhotoGallery from "./OptionsPhotoGallery";
import OptionsQuickPick from "./OptionsQuickPick";
import { isQuickPick, SUPPLY } from "./quickPick";
import { Open3DButton } from "./vanity3d/Vanity3DLoader";
import { FAQ_CATEGORIES } from "../../../lib/faq";
import { Markdown } from "../../../lib/markdown";
import type { TradeBuild } from "../../../lib/tradeBuild";

// Made-to-order departments show the vanity FAQ (lead times, freight, changes) by the builder.
const MADE_TO_ORDER = new Set(["vanities", "bathroom-storage", "mirrors"]);

// Page body for a product with options (e.g. a Marquis vanity range): heading, the
// builder, then the usual specs / reviews below. Used by /product/[slug], and by the trade
// portal's product page with `trade` (their prices, Add to order, links kept in the portal).
export default function OptionsProductView({ range, deptLabel, deptSlug, query, specsSlot, reviewsSlot, trade }: {
  range: WebsiteRange; deptLabel: string | null; deptSlug: string | null; query: Record<string, string>;
  specsSlot?: ReactNode; reviewsSlot?: ReactNode; trade?: TradeBuild;
}) {
  const shop = trade ? "/trade/catalogue" : "/shop";
  // Pages outside the portal open in a new tab, so a trade partner keeps their place.
  const away = trade ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const steps = (range.options?.groups ?? []).filter((g) => g.type !== "text").slice(0, 5).map((g) => g.label.toLowerCase());
  const photos = [...new Set([range.heroImage, ...(range.images ?? [])].filter((x): x is string => !!x))].slice(0, 5);
  // A few options only (e.g. a mirror's sizes + LED): pick them beside the photo, no builder.
  const quick = !trade && isQuickPick(range.options, range.department);
  // Brands with their own landing page (app/brands/*): linked from the crumbs and the eyebrow.
  const brandHref = !trade && range.options?.source?.supplier === "Marquis" ? "/brands/marquis" : null;
  return (
    <>
      <style>{BUILDER_CSS}</style>
      <p className="vb-crumbs">
        <Link href={shop}>{trade ? "Catalogue" : "Shop"}</Link>
        {deptSlug && deptLabel && <> / <Link href={`${shop}/${deptSlug}`}>{deptLabel}</Link></>}
        {brandHref && <> / <Link href={brandHref}>{range.options?.source?.supplier}</Link></>}
      </p>
      <div className={`vb-intro ${photos.length ? "has-photo" : ""}`}>
        {photos.length > 0 && <PhotoGallery photos={photos} name={range.name} />}
        <header className="vb-head">
          <div className="vb-eyebrow">{SUPPLY.has(range.department ?? "") ? (deptLabel ?? "") : brandHref ? <><Link href={brandHref} style={{ color: "inherit" }}>{range.options?.source?.supplier}</Link> · made to order</> : range.options?.source?.supplier ? `${range.options.source.supplier} · made to order` : quick ? "Made to order" : "Build your own"}</div>
          <h1>{range.name}</h1>
          <p>{range.description || (trade ? "Choose your options and watch your price update as you go, then add the build to your order." : "Choose your options and watch the price update as you go. Send the build to us for a quote, or save it for later.")}</p>
          {quick && <OptionsQuickPick range={range} query={query} />}
          {!quick && range.options?.drawing === "vanity" && (
            <p className="vb-3d"><Open3DButton slug={range.slug} base={trade?.base} className="vb-3d-btn" /><span>Turn it round, open the drawers and see your colours in 3D. Same options and {trade ? "your prices" : "prices"}.</span></p>
          )}
          {!quick && range.options?.drawing === "vanity" && (
            <p className="vb-brochure" style={{ margin: "14px 0 0" }}>
              {/* Same pill as the tile pages' "Download brochure" button. */}
              <a href={`/brochure/${range.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none", background: "#fff", color: "var(--ink)", fontWeight: 700, fontSize: 15, padding: "14px 26px", borderRadius: 99, border: "1px solid var(--line)" }}>
                Download brochure ↓
              </a>
              <span style={{ display: "block", marginTop: 8, fontSize: 12.5, color: "#8a8577" }}>Every size and option, with drawings.</span>
            </p>
          )}
          {!quick && steps.length >= 3 && <p className="vb-custom-note">Fully customisable: choose your {steps.join(", ").replace(/, ([^,]*)$/, " and $1")} below. Photos show one example build.</p>}
        </header>
      </div>
      {!quick && <OptionsBuilder range={range} query={query} trade={trade} />}
      {MADE_TO_ORDER.has(range.department ?? "") && (() => {
        const faq = FAQ_CATEGORIES.find((c) => c.slug === "vanities");
        return faq ? (
          <section className="vb-faq" aria-labelledby="vb-faq-h">
            <h2 id="vb-faq-h">Good to know before you order</h2>
            {faq.items.map((it) => (
              <details key={it.q}>
                <summary>{it.q}</summary>
                <div className="vb-faq-a"><Markdown source={it.a} /></div>
              </details>
            ))}
            <p className="vb-fine"><Link href="/faq" {...away}>More questions answered</Link> · <Link href="/terms-of-sale" {...away}>Terms of Sale</Link></p>
          </section>
        ) : null;
      })()}
      {(specsSlot || reviewsSlot) && <div className="vb-below">{specsSlot}{reviewsSlot}</div>}
    </>
  );
}
