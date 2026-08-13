"use client";

import { useState } from "react";

// Customer review form, shown on a product page. Posts to /api/reviews, which
// creates a PENDING (moderated) review in OnBase - so the success state makes
// clear the review won't appear instantly. Photos upload one-by-one to
// /api/reviews/upload (which strips EXIF + re-encodes to webp) and their returned
// URLs ride along with the submission. Style mirrors the site's ContactForm.

const MAX_PHOTOS = 4;

const field: React.CSSProperties = {
  width: "100%",
  padding: "13px 15px",
  borderRadius: 12,
  border: "1.5px solid var(--line)",
  background: "#fff",
  fontFamily: "inherit",
  fontSize: 14.5,
  color: "var(--ink)",
  outline: "none",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "#8a8577",
  margin: "0 0 7px",
};

function focusOn(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--accent)";
  e.currentTarget.style.boxShadow = "0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent)";
}
function focusOff(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "var(--line)";
  e.currentTarget.style.boxShadow = "none";
}

const CONSENT_TEXT =
  "I'm happy for OnWood to display my review and photos, including in the gallery.";

export default function ReviewForm({
  productId,
  productName,
  hasReviews,
}: {
  productId: string;
  productName: string;
  /** When there are no approved reviews yet, invite the shopper to be the first. */
  hasReviews: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file after a remove
    if (!file || photos.length >= MAX_PHOTOS) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.ok && json.url) {
        setPhotos((p) => [...p, json.url].slice(0, MAX_PHOTOS));
      } else {
        setError(json.error || "That photo wouldn't upload. Please try another.");
      }
    } catch {
      setError("That photo wouldn't upload. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos((p) => p.filter((u) => u !== url));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    if (!consent) {
      setError("Please tick the box to let us display your review.");
      return;
    }
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      productId,
      rating,
      authorName: String(fd.get("authorName") || "").trim(),
      authorEmail: String(fd.get("authorEmail") || "").trim(),
      title: String(fd.get("title") || "").trim(),
      body: String(fd.get("body") || "").trim(),
      orderRef: String(fd.get("orderRef") || "").trim(),
      images: photos,
      company: String(fd.get("company") || ""), // honeypot
      consentText: CONSENT_TEXT,
    };
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setDone(true);
      } else {
        setError(
          json.error ||
            "Sorry - that didn't send. Please try again shortly, or email sales@onwoodtiles.com.au.",
        );
      }
    } catch {
      setError("We couldn't reach the server just now. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 20px 50px -30px rgba(32,48,58,.32)",
        }}
      >
        <div style={{ width: 60, height: 60, margin: "0 auto 16px", borderRadius: "50%", background: "color-mix(in srgb, var(--accent) 14%, var(--surface))", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
        </div>
        <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 23, letterSpacing: "-.01em", margin: "0 0 8px" }}>
          Thanks for your review!
        </h3>
        <p style={{ color: "#5a6067", fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 420, marginInline: "auto" }}>
          We&rsquo;ve sent it in for a quick check before it goes live &mdash; that keeps reviews genuine.
          It&rsquo;ll appear on this page once our team has approved it. We appreciate you taking the time.
        </p>
      </div>
    );
  }

  const activeStars = hover || rating;

  return (
    <form
      onSubmit={onSubmit}
      aria-label={`Write a review for ${productName}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "28px 26px", boxShadow: "0 20px 50px -30px rgba(32,48,58,.3)" }}
    >
      <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 23, letterSpacing: "-.01em", margin: "0 0 6px" }}>
        {hasReviews ? "Write a review" : "Be the first to review"}
      </h3>
      <p style={{ color: "#5a6067", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
        Bought {productName}? Share how it looks in your place &mdash; your review helps other Sunshine Coast homeowners.
      </p>

      {/* star picker */}
      <div style={{ marginBottom: 18 }}>
        <span style={label}>Your rating</span>
        <div style={{ display: "inline-flex", gap: 4 }} role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{ appearance: "none", border: "none", background: "none", padding: 2, cursor: "pointer", lineHeight: 0 }}
            >
              <svg viewBox="0 0 24 24" width={34} height={34} style={{ display: "block", transition: "transform .12s ease" }}>
                <path
                  d="M12 2.6l2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 17l-5.6 2.8 1.3-6.3L3 9.2l6.3-.7z"
                  fill={n <= activeStars ? "#e6a52c" : "#e2ddd0"}
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="rv-row">
        <div>
          <label htmlFor="rv-name" style={label}>Name</label>
          <input id="rv-name" name="authorName" required maxLength={80} placeholder="Your name" autoComplete="name" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
        <div>
          <label htmlFor="rv-email" style={label}>Email <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(not shown)</span></label>
          <input id="rv-email" name="authorEmail" required type="email" placeholder="you@email.com" autoComplete="email" onFocus={focusOn} onBlur={focusOff} style={field} />
        </div>
      </div>

      {/* Honeypot: hidden from humans + assistive tech + tab order; bots fill it. */}
      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
        <label htmlFor="rv-company">Company</label>
        <input id="rv-company" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="rv-title" style={label}>Headline <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <input id="rv-title" name="title" maxLength={120} placeholder="Sum it up in a few words" onFocus={focusOn} onBlur={focusOff} style={field} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="rv-body" style={label}>Your review</label>
        <textarea id="rv-body" name="body" required rows={5} maxLength={4000} placeholder="How does it look and feel in your home? Was it easy to work with? Would you recommend it?" onFocus={focusOn} onBlur={focusOff} style={{ ...field, resize: "vertical", lineHeight: 1.5 }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="rv-order" style={label}>Order or invoice number <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <input id="rv-order" name="orderRef" maxLength={60} placeholder="e.g. INV-1234" onFocus={focusOn} onBlur={focusOff} style={field} />
        <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#8a8577", lineHeight: 1.5 }}>
          On your OnWood invoice or order &mdash; we&rsquo;ll mark your review a <strong style={{ color: "var(--accent)" }}>Verified Purchase</strong>.
        </p>
      </div>

      {/* photos */}
      <div style={{ marginTop: 18 }}>
        <span style={label}>Add photos <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional, up to {MAX_PHOTOS})</span></span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {photos.map((url) => (
            <span key={url} style={{ position: "relative", width: 78, height: 78, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Your review photo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label="Remove photo"
                style={{ position: "absolute", top: 3, right: 3, width: 22, height: 22, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(20,26,28,.72)", color: "#fff", display: "grid", placeItems: "center", lineHeight: 0 }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </span>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label
              style={{
                width: 78, height: 78, borderRadius: 12, border: "1.5px dashed var(--line)", background: "#fff",
                display: "grid", placeItems: "center", cursor: uploading ? "default" : "pointer", color: "#8a8577",
                opacity: uploading ? 0.6 : 1, textAlign: "center",
              }}
            >
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={onPickPhoto} disabled={uploading} style={{ display: "none" }} />
              {uploading ? (
                <span style={{ fontSize: 11, fontWeight: 700 }}>Uploading…</span>
              ) : (
                <span style={{ display: "grid", placeItems: "center", gap: 2 }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                  <span style={{ fontSize: 10.5, fontWeight: 700 }}>Photo</span>
                </span>
              )}
            </label>
          )}
        </div>
      </div>

      {/* consent */}
      <div style={{ margin: "18px 0 0", padding: "13px 15px", borderRadius: 12, background: "color-mix(in oklab, var(--accent) 6%, var(--surface))", border: "1px solid var(--line)" }}>
        <label style={{ display: "flex", gap: 11, cursor: "pointer", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: 2, width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0, cursor: "pointer" }}
          />
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 700 }}>{CONSENT_TEXT}</span>
        </label>
      </div>

      {error && (
        <p role="alert" style={{ margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--accent)" }}>{error}</p>
      )}

      <button type="submit" disabled={busy || uploading} className="rv-submit" style={{ marginTop: 18, width: "100%", padding: "15px 18px", borderRadius: 999, border: "none", background: "var(--accent)", color: "#fff6ee", fontFamily: "inherit", fontWeight: 800, fontSize: 15.5, cursor: busy || uploading ? "default" : "pointer", opacity: busy || uploading ? 0.72 : 1, boxShadow: "0 14px 30px -12px rgba(208,106,69,.6)" }}>
        {busy ? "Sending..." : "Submit review"}
      </button>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: "#8a8577", textAlign: "center", lineHeight: 1.5 }}>
        Reviews are checked by our team before they appear.
      </p>

      <style>{`
        .rv-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:520px){.rv-row{grid-template-columns:1fr;}}
        .rv-submit{transition:transform .2s ease, box-shadow .2s ease, filter .2s ease;}
        .rv-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.04);box-shadow:0 20px 40px -14px rgba(208,106,69,.7);}
      `}</style>
    </form>
  );
}
