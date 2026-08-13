import type { ProductReview } from "../../../lib/onbase/client";
import { Stars } from "./shared";
import ReviewForm from "./ReviewForm";

// Reviews section for a product page (server component). Renders the aggregate
// header + each approved review (with any photos + a business reply), then the
// review form below. Shown even with zero reviews so a shopper can be the first.

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Stars value={review.rating} size={16} />
        <span style={{ fontWeight: 800, fontSize: 14.5, color: "var(--ink)" }}>{review.authorName}</span>
        {review.verified && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 800, color: "#1f7a54", background: "rgba(31,122,84,.1)", padding: "2px 8px", borderRadius: 99 }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
            Verified purchase
          </span>
        )}
        {review.createdAt && (
          <span style={{ fontSize: 12.5, color: "#8a8577", marginLeft: "auto" }}>{formatDate(review.createdAt)}</span>
        )}
      </div>

      {review.title && (
        <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 17, letterSpacing: "-.01em" }}>
          {review.title}
        </h3>
      )}

      <p style={{ margin: "9px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#3a4750", whiteSpace: "pre-line" }}>
        {review.body}
      </p>

      {review.images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {review.images.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "block", width: 96, height: 96, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo from ${review.authorName}'s review`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </a>
          ))}
        </div>
      )}

      {review.reply && (
        <div style={{ marginTop: 16, marginLeft: 4, padding: "14px 16px", borderLeft: "3px solid var(--accent)", background: "color-mix(in oklab, var(--accent) 5%, transparent)", borderRadius: "0 12px 12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--accent)" }}>
              Reply from OnWood Tiles
            </span>
            {review.repliedAt && <span style={{ fontSize: 11.5, color: "#8a8577" }}>{formatDate(review.repliedAt)}</span>}
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#3a4750", whiteSpace: "pre-line" }}>{review.reply}</p>
        </div>
      )}
    </article>
  );
}

export default function ProductReviews({
  productId,
  productName,
  reviews,
  average,
  count,
}: {
  productId: string;
  productName: string;
  reviews: ProductReview[];
  average: number;
  count: number;
}) {
  return (
    <section style={{ marginTop: 64 }} aria-label="Customer reviews">
      <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 820, fontSize: "clamp(24px,3vw,30px)", letterSpacing: "-.015em", margin: "0 0 4px" }}>
        Reviews<span style={{ color: "var(--accent)" }}>.</span>
      </h2>

      {count > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 4px", flexWrap: "wrap" }}>
          <Stars value={average} size={22} label={`Rated ${average.toFixed(1)} out of 5 from ${count} reviews`} />
          <span style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>
            {average.toFixed(1)}
          </span>
          <span style={{ fontSize: 14, color: "#8a8577" }}>
            based on {count} {count === 1 ? "review" : "reviews"}
          </span>
        </div>
      ) : (
        <p style={{ color: "#8a8577", fontSize: 14.5, margin: "0 0 4px" }}>
          No reviews yet &mdash; if you&rsquo;ve bought this, you could be the first.
        </p>
      )}

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: count > 0 ? "minmax(0, 1.4fr) minmax(0, 1fr)" : "1fr",
          gap: 40,
          alignItems: "start",
        }}
        className="ow-reviews-grid"
      >
        {count > 0 && (
          <div>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
        <div style={{ maxWidth: count > 0 ? "none" : 620 }}>
          <ReviewForm productId={productId} productName={productName} hasReviews={count > 0} />
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .ow-reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
