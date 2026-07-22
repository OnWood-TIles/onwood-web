import Link from "next/link";

// A featured-product card that shows off BOTH the product photo and its
// "see it installed" room shot. At rest: the tile/product photo fills the card
// with the room shot peeking in a corner inset. On hover the card cross-fades to
// the full room shot and the inset flips to the product photo - so you always see
// both. Pure CSS (the shared styles live once in FeaturedProducts); no client JS.
// Products without a room shot fall back to a clean single-image card.

export type FeaturedProduct = {
  name: string;
  slug: string;
  productImage: string;
  roomImage: string | null;
  tag: string;
  special: { price: number | null; was: number | null } | null;
};

const money = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

export default function FeaturedProductCard({ p }: { p: FeaturedProduct }) {
  const hasRoom = !!p.roomImage;
  return (
    <Link href={`/product/${p.slug}`} className={`owf-card${hasRoom ? " owf-has-room" : ""}`} aria-label={p.name}>
      <div className="owf-media">
        {/* eslint-disable @next/next/no-img-element */}
        <img className="owf-front" src={p.productImage} alt={p.name} loading="lazy" />
        {hasRoom && <img className="owf-back" src={p.roomImage as string} alt={`${p.name} installed`} loading="lazy" />}
        {/* eslint-enable @next/next/no-img-element */}

        <span className="owf-bar" aria-hidden />
        <div className="owf-scrim" aria-hidden />

        {p.special && p.special.price != null && (
          <span className="owf-special">
            Special {money(p.special.price)}
            {p.special.was != null && <s> {money(p.special.was)}</s>}
          </span>
        )}

        {hasRoom && <span className="owf-peek">See it installed</span>}

        {hasRoom && (
          <span className="owf-inset" aria-hidden>
            {/* eslint-disable @next/next/no-img-element */}
            <img className="owf-inset-room" src={p.roomImage as string} alt="" loading="lazy" />
            <img className="owf-inset-tile" src={p.productImage} alt="" loading="lazy" />
            {/* eslint-enable @next/next/no-img-element */}
          </span>
        )}

        <div className="owf-body">
          <div className="owf-tag">{p.tag}</div>
          <h3 className="owf-name">{p.name}</h3>
          <span className="owf-cta">
            View product <span aria-hidden>&rarr;</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
