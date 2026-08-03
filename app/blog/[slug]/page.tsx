import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getBlog, type BlogPost } from "../../../lib/onbase/client";
import { Markdown, stripMarkdown } from "../../../lib/markdown";

export const dynamic = "force-dynamic";

type Params = { slug: string };

async function findPost(slug: string): Promise<{ post: BlogPost; others: BlogPost[] } | null> {
  const all = (await getBlog()).filter((p) => p.published);
  const post = all.find((p) => p.slug === slug);
  if (!post) return null;
  return { post, others: all.filter((p) => p.slug !== slug).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 3) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPost(slug);
  if (!found) return { title: "Guide not found | OnWood Tiles" };
  const { post } = found;
  const desc = post.excerpt || stripMarkdown(post.body, 155);
  return {
    title: `${post.title} | OnWood Tiles`,
    description: desc,
    keywords: post.keywords || undefined,
    alternates: { canonical: `https://onwoodtiles.com.au/blog/${post.slug}` },
    openGraph: { title: post.title, description: desc, url: `https://onwoodtiles.com.au/blog/${post.slug}`, type: "article", images: post.coverImage ? [{ url: post.coverImage }] : undefined },
  };
}

const eyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--accent2)" };
const fmtDate = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
};

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const found = await findPost(slug);
  if (!found) notFound();
  const { post, others } = found;
  const mins = Math.max(2, Math.round((post.body || "").split(/\s+/).length / 200));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || stripMarkdown(post.body, 155),
    image: post.coverImage || undefined,
    datePublished: post.date || undefined,
    author: { "@type": "Organization", name: post.author || "OnWood Tiles" },
    publisher: { "@type": "Organization", name: "OnWood Tiles", url: "https://onwoodtiles.com.au" },
    mainEntityOfPage: `https://onwoodtiles.com.au/blog/${post.slug}`,
    keywords: post.keywords || undefined,
  };

  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MarketingNav />
      <main>
        {/* ── HEADER ── */}
        <article>
          <header style={{ maxWidth: 780, margin: "0 auto", padding: "140px 24px 8px", textAlign: "center" }}>
            <Link href="/blog" style={{ ...eyebrow, textDecoration: "none", color: "var(--accent)" }}>← The OnWood Journal</Link>
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap", margin: "18px 0 0" }}>
              {post.category ? <span style={{ padding: "5px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent) 12%, var(--surface))", border: "1px solid var(--line)", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)" }}>{post.category}</span> : null}
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{[fmtDate(post.date), `${mins} min read`].filter(Boolean).join(" · ")}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 900, letterSpacing: "-.03em", fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05, margin: "16px 0 0" }}>{post.title}</h1>
            {post.excerpt ? <p style={{ fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.6, color: "var(--muted)", margin: "18px auto 0", maxWidth: "50ch" }}>{post.excerpt}</p> : null}
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "18px 0 0" }}>By {post.author}</p>
          </header>

          {post.coverImage ? (
            <div style={{ maxWidth: 1040, margin: "34px auto 0", padding: "0 24px" }}>
              {post.coverLink ? (
                <Link href={post.coverLink} style={{ display: "block", textDecoration: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImage} alt={post.coverCaption || post.title} style={{ width: "100%", aspectRatio: "16/8", objectFit: "cover", borderRadius: 20, border: "1px solid var(--line)", display: "block" }} />
                </Link>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={post.coverImage} alt={post.coverCaption || post.title} style={{ width: "100%", aspectRatio: "16/8", objectFit: "cover", borderRadius: 20, border: "1px solid var(--line)", display: "block" }} />
              )}
              {post.coverCaption ? (
                <p style={{ margin: "10px 2px 0", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                  {post.coverLink ? <Link href={post.coverLink} style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{post.coverCaption} <span aria-hidden>→</span></Link> : post.coverCaption}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* ── BODY ── */}
          <div className="bl-prose" style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 20px" }}>
            <Markdown source={post.body} />
          </div>

          <div style={{ maxWidth: 720, margin: "10px auto 0", padding: "0 24px" }}>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 22, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Written by {post.author}, {fmtDate(post.date)}</p>
              <Link href="/book" style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, textDecoration: "none", padding: "12px 24px", borderRadius: 999, fontSize: 14 }}>Book a showroom visit</Link>
            </div>
          </div>
        </article>

        {/* ── MORE ── */}
        {others.length > 0 && (
          <section style={{ maxWidth: 1100, margin: "60px auto 0", padding: "0 24px 90px" }}>
            <h2 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, letterSpacing: "-.02em", fontSize: "clamp(20px,2.4vw,28px)", margin: "0 0 20px" }}>Keep reading</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none", color: "inherit", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
                  <div style={{ aspectRatio: "16/10", background: "linear-gradient(160deg, color-mix(in srgb, var(--accent) 16%, var(--surface)), color-mix(in srgb, var(--sea) 12%, var(--surface)))" }}>
                    {p.coverImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.coverImage} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
                  </div>
                  <div style={{ padding: 18 }}>
                    <span style={{ ...eyebrow, fontSize: 11, color: "var(--accent)" }}>{p.category || "Guide"}</span>
                    <h3 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 18, lineHeight: 1.2, margin: "8px 0 0" }}>{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <MarketingFooter />
      <style>{`
        .bl-prose{font-family:var(--font-manrope),system-ui,sans-serif;font-size:17.5px;line-height:1.75;color:#3a444a}
        .bl-prose .bl-p{margin:0 0 20px}
        .bl-prose .bl-h2{font-family:var(--font-archivo);font-weight:800;letter-spacing:-.02em;font-size:clamp(24px,3vw,32px);line-height:1.15;margin:40px 0 14px;color:var(--ink)}
        .bl-prose .bl-h3{font-family:var(--font-archivo);font-weight:800;letter-spacing:-.015em;font-size:22px;margin:32px 0 12px;color:var(--ink)}
        .bl-prose .bl-h4{font-family:var(--font-archivo);font-weight:700;font-size:18px;margin:26px 0 10px;color:var(--ink)}
        .bl-prose .bl-ul,.bl-prose .bl-ol{margin:0 0 22px;padding-left:24px}
        .bl-prose .bl-ul li,.bl-prose .bl-ol li{margin:0 0 9px}
        .bl-prose .bl-ul{list-style:none;padding-left:4px}
        .bl-prose .bl-ul li{position:relative;padding-left:26px}
        .bl-prose .bl-ul li::before{content:"";position:absolute;left:4px;top:11px;width:7px;height:7px;background:var(--accent);transform:rotate(45deg)}
        .bl-prose a{color:var(--accent);font-weight:600;text-decoration:underline;text-underline-offset:2px}
        .bl-prose strong{color:var(--ink);font-weight:800}
        .bl-prose .bl-quote{margin:28px 0;padding:6px 0 6px 22px;border-left:3px solid var(--accent);font-family:var(--font-newsreader);font-style:italic;font-size:clamp(20px,2.6vw,26px);line-height:1.4;color:var(--ink)}
        .bl-prose .bl-fig{margin:30px 0}
        .bl-prose .bl-fig img{width:100%;border-radius:16px;border:1px solid var(--line);display:block}
        .bl-prose .bl-figlink{display:block}
        .bl-prose .bl-fig figcaption{margin-top:9px;font-size:13px;color:var(--muted);text-align:center;font-family:var(--font-manrope)}
        .bl-prose .bl-figcredit{color:var(--accent);font-weight:700;text-decoration:none}
        .bl-prose .bl-figcredit:hover{text-decoration:underline}
        .bl-prose .bl-hr{border:none;border-top:1px solid var(--line);margin:36px 0}
        .bl-prose .bl-code{background:color-mix(in srgb,var(--ink) 8%,transparent);padding:2px 6px;border-radius:5px;font-size:.9em}
      `}</style>
    </div>
  );
}
