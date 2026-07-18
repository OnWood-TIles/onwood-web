import type { Metadata } from "next";
import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";
import { getBusiness } from "../../lib/onbase/client";
import BookAVisit from "../components/book/BookAVisit";

export const metadata: Metadata = {
  title: "Book a Visit",
  description: "Book a showroom visit at OnWood Tiles in Baringa - pick a time that suits and we'll have the space ready for you.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const business = await getBusiness();
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "140px 28px 90px" }}>
        <BookAVisit business={business} />
      </main>
      <MarketingFooter />
    </div>
  );
}
