import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getRange, getReviews, getTaxonomy, listPairCandidates } from "../../../lib/onbase/client";
import { pickPairs } from "../../../lib/pairs";
import ProductView from "../../components/shop/ProductView";
import ProductReviews from "../../components/shop/ProductReviews";
import { TechnicalSpecs } from "../../components/shop/shared";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const range = await getRange(slug);
  if (!range) return { title: "Product not found" };
  const description =
    range.description?.slice(0, 155) ||
    `${range.name} at OnWood Tiles - see it in our Sunshine Coast showroom.`;
  const url = `https://onwoodtiles.com.au/product/${slug}`;
  // Primary product image (same precedence as the Product JSON-LD): range hero ->
  // a swatch photo -> a gallery image. Absolutised so social + Pinterest previews
  // show the actual tile, not the generic site brand card. Without this, product
  // pages inherit the layout's default OpenGraph (homepage title/url/image).
  // Prefer the "installed" room shot for shares/pins (a styled room reads far
  // better on Pinterest/social than a flat tile swatch); fall back to the tile
  // photo, then the range hero / gallery image if a product has no room shot.
  const rawImg =
    range.swatches.find((s) => s.installedImage)?.installedImage ||
    range.heroImage ||
    range.swatches.find((s) => s.image)?.image ||
    range.images.find(Boolean);
  const image = rawImg ? (rawImg.startsWith("http") ? rawImg : `https://onwoodtiles.com.au${rawImg}`) : undefined;
  const ogTitle = `${range.name} | OnWood Tiles`;
  return {
    title: range.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "OnWood Tiles",
      locale: "en_AU",
      type: "website",
      ...(image ? { images: [{ url: image, alt: range.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { slug } = await params;
  const { c } = await searchParams;
  // Fetch the range first, then the taxonomy + its department's ranges in
  // parallel. "Pairs well with" only ever suggests within/near the same
  // department, so we no longer pull the WHOLE catalogue (~100 ranges) on every
  // product open - just this department's, which also shares the department
  // shop's cache entry. Big cut to the per-click payload.
  // Fetch everything in PARALLEL (getRange no longer blocks the rest). allRanges is
  // the long-cached pairing candidate list (every department, so "Pairs well with"
  // can suggest cross-department complements). pickPairs handles the scoring.
  const [range, taxonomy, allRanges] = await Promise.all([
    getRange(slug),
    getTaxonomy(),
    listPairCandidates(),
  ]);
  if (!range) notFound();

  // Approved reviews for this product (keyed off the range/product id). Fails
  // open to an empty summary, so a hiccup never breaks the product render.
  const { reviews, average, count } = await getReviews(range.id);

  const dept = taxonomy.find((d) => d.slug === range.department);
  const catLabels = range.categories
    .map((c) => dept?.categories.find((x) => x.slug === c)?.label || c)
    .filter(Boolean);
  const pairs = pickPairs(range, allRanges, dept?.label);

  // schema.org/Product structured data (rich results). Emits an Offer when a price
  // is published (special price wins, else the standard "from" price) so search can
  // show a price; a product with the price hidden in OnBase emits no Offer. Any
  // field that isn't available is omitted rather than sent as null/empty. Same
  // in-page <script> technique as app/layout.tsx.
  const SITE = "https://onwoodtiles.com.au";
  // Pick a representative product image: the range hero, else the first
  // colourway's swatch photo, else the first gallery image. normalizeRange has
  // already absolutized OnBase-relative paths, but if a bare relative path ever
  // slips through, prefix the public site origin so the URL is always absolute.
  const rawImage =
    range.heroImage ||
    range.swatches.find((s) => s.image)?.image ||
    range.images.find(Boolean) ||
    null;
  const image = rawImage ? (rawImage.startsWith("/") ? `${SITE}${rawImage}` : rawImage) : null;
  const description = range.description?.trim() || null;
  const category = dept?.label || catLabels[0] || null;
  // Reviews enrich the Product schema with an aggregate rating + individual
  // reviews (rich results / star ratings in search). Only emitted when there is
  // at least one review - Google flags an aggregateRating with no reviews.
  const reviewLd =
    count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(average.toFixed(1)),
            reviewCount: count,
          },
          review: reviews.map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            author: { "@type": "Person", name: r.authorName },
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.body,
            datePublished: r.createdAt,
          })),
        }
      : {};
  // Offer: the price actually shown (a range-level special wins, else the standard
  // "from" price), GST-inclusive AUD. Omitted when the price is hidden / unset.
  const offerPrice = range.special?.price ?? range.price ?? null;
  const offerLd =
    offerPrice != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "AUD",
            price: offerPrice.toFixed(2),
            availability: range.availability === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            url: `${SITE}/product/${slug}`,
          },
        }
      : {};
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: range.name,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    brand: { "@type": "Brand", name: "OnWood Tiles" },
    ...(category ? { category } : {}),
    ...offerLd,
    ...reviewLd,
    url: `${SITE}/product/${slug}`,
  };

  // BreadcrumbList structured data: Home -> Shop -> Department -> Product, using
  // absolute URLs. The Department step is only included when the range resolves
  // to a known department (otherwise we skip straight from Shop to the product).
  const crumbs = [
    { name: "Home", item: `${SITE}/` },
    { name: "Shop", item: `${SITE}/shop` },
    ...(dept ? [{ name: dept.label, item: `${SITE}/shop/${dept.slug}` }] : []),
    { name: range.name, item: `${SITE}/product/${slug}` },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <MarketingNav />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(92px,15vw,140px) 28px 90px" }}>
        <ProductView
          range={range}
          deptLabel={dept?.label ?? null}
          deptSlug={dept?.slug ?? null}
          catLabels={catLabels}
          initialColour={c ?? null}
          pairs={pairs}
          productBase="/product"
          specsSlot={
            <TechnicalSpecs
              specs={range.specs}
              material={range.specs.find((s) => /material|construction/i.test(s.label))?.value ?? null}
              documents={range.documents}
            />
          }
          reviewsSlot={
            <ProductReviews
              productId={range.id}
              productName={range.name}
              reviews={reviews}
              average={average}
              count={count}
            />
          }
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
