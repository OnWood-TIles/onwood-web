"use client";

import Link from "next/link";
import { useState } from "react";

// Client-side search for the Ideas & Inspiration blog. Filters the loaded posts
// live by title, excerpt, category and keywords, so "subway" surfaces the subway
// guide. With no query it shows the normal grid (every post except the pinned
// featured one, which sits above); while searching it looks across ALL posts.
type Item = { slug: string; title: string; excerpt: string; category: string; coverImage: string; keywords: string; mins: number };
const NICHE_BG = "linear-gradient(160deg, color-mix(in srgb, var(--accent) 16%, var(--surface)), color-mix(in srgb, var(--sea) 12%, var(--surface)))";

export default function BlogSearch({ posts, featuredSlug }: { posts: Item[]; featuredSlug: string }) {
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(9); // compress the browse list; "See more" reveals the rest
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const base = searching ? posts : posts.filter((p) => p.slug !== featuredSlug);
  const results = searching
    ? base.filter((p) => {
        const hay = `${p.title} ${p.excerpt} ${p.category} ${p.keywords}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
    : base;
  // Search shows every match; browsing shows a reasonable number, then "See more".
  const shown = searching ? results : results.slice(0, visible);

  return (
    <section style={{ padding: "40px 24px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.02em", fontSize: "clamp(22px,2.6vw,30px)", margin: 0 }}>
            {searching ? `${results.length} result${results.length === 1 ? "" : "s"}` : "More reads"}
          </h2>
          <div style={{ position: "relative" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search guides, e.g. subway, timber, cool"
              aria-label="Search the blog"
              style={{ width: "min(360px, 80vw)", padding: "11px 16px 11px 40px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", fontSize: 14.5, color: "var(--ink)", fontFamily: "inherit", outline: "none" }}
            />
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
        </div>

        {results.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 22 }}>
            {shown.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="bl-card" style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface)", height: "100%" }}>
                <div style={{ aspectRatio: "16/10", background: NICHE_BG, overflow: "hidden" }}>
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : null}
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent)" }}>{p.category || "Guide"}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{p.mins} min</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.015em", fontSize: 20, lineHeight: 1.16, margin: "10px 0 0" }}>{p.title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)", margin: "10px 0 0" }}>{p.excerpt}</p>
                  <span style={{ marginTop: "auto", paddingTop: 16, fontWeight: 800, color: "var(--accent)", fontSize: 14 }}>Read →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 16, padding: "16px 0 8px" }}>
            No guides match &ldquo;{q}&rdquo; yet. Try another word, or{" "}
            <Link href="/shop" style={{ color: "var(--accent)", fontWeight: 700 }}>browse the shop</Link>.
          </p>
        )}

        {!searching && results.length > shown.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <button
              onClick={() => setVisible((v) => v + 6)}
              style={{ appearance: "none", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "13px 30px", borderRadius: 999 }}
            >
              See more guides <span aria-hidden>↓</span> <span style={{ color: "var(--muted)", fontWeight: 600 }}>({results.length - shown.length} more)</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
