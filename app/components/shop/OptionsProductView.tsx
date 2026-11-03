import Link from "next/link";
import type { ReactNode } from "react";
import type { WebsiteRange } from "../../../lib/onbase/client";
import { BUILDER_CSS } from "./builderCss";
import OptionsBuilder from "./OptionsBuilder";

// Page body for a product with options (e.g. a Marquis vanity range): heading, the
// builder, then the usual specs / reviews below. Used by /product/[slug] and the
// staff-only /build preview.
export default function OptionsProductView({ range, deptLabel, deptSlug, query, preview, specsSlot, reviewsSlot }: {
  range: WebsiteRange; deptLabel: string | null; deptSlug: string | null; query: Record<string, string>;
  preview?: boolean; specsSlot?: ReactNode; reviewsSlot?: ReactNode;
}) {
  return (
    <>
      <style>{BUILDER_CSS}</style>
      {preview && <span className="vb-preview">Staff preview · not public yet</span>}
      <p className="vb-crumbs">
        <Link href="/shop">Shop</Link>
        {deptSlug && deptLabel && <> / <Link href={`/shop/${deptSlug}`}>{deptLabel}</Link></>}
      </p>
      <header className="vb-head">
        <div className="vb-eyebrow">{range.options?.source?.supplier ? `${range.options.source.supplier} · made to order` : "Build your own"}</div>
        <h1>{range.name}</h1>
        <p>{range.description || "Choose your options and watch the price update as you go. Send the build to us for a quote, or save it for later."}</p>
      </header>
      <OptionsBuilder range={range} query={query} />
      {(specsSlot || reviewsSlot) && <div className="vb-below">{specsSlot}{reviewsSlot}</div>}
    </>
  );
}
