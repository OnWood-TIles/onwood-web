import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import { getBlog } from "../../../lib/onbase/client";
import BlogEditor from "./BlogEditor";

export const metadata: Metadata = { title: "Blog editor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Staff-only blog editor (behind the preview cookie in all modes, like the nav designer).
export default async function AdminBlogPage() {
  const posts = await getBlog();
  return (
    <div data-theme="terracotta" style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <MarketingNav />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "150px 28px 90px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>Site admin</p>
            <h1 style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-.02em", margin: "6px 0 0" }}>Blog editor</h1>
          </div>
          <Link href="/admin" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>← Navigation designer</Link>
        </div>
        <p style={{ color: "#5a6067", fontSize: 15, lineHeight: 1.65, maxWidth: 680, margin: "10px 0 30px" }}>
          Write and publish ideas, guides and inspiration for your customers. Posts appear on <strong>/blog</strong> the moment you save. Use the
          Markdown hints in the body field for headings, lists, quotes and images. Cover and in-article images can be any public
          image URL, including your own product photos.
        </p>
        <BlogEditor initialPosts={posts} />
      </main>
      <MarketingFooter />
    </div>
  );
}
