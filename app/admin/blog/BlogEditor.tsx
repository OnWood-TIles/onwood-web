"use client";

import { useState } from "react";
import type { BlogPost } from "../../../lib/onbase/client";

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const blank = (): BlogPost => ({ slug: "", title: "", excerpt: "", coverImage: "", coverCaption: "", coverLink: "", category: "", author: "OnWood Tiles", date: new Date().toISOString().slice(0, 10), keywords: "", body: "", published: false });

const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 14.5, fontFamily: "var(--font-manrope), sans-serif" };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#5a6067", marginBottom: 6, display: "block" };

export default function BlogEditor({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [sel, setSel] = useState<number | null>(initialPosts.length ? 0 : null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const cur = sel != null ? posts[sel] : null;
  const edit = (patch: Partial<BlogPost>) => { if (sel == null) return; setPosts((ps) => ps.map((p, i) => (i === sel ? { ...p, ...patch } : p))); };

  const addPost = () => { setPosts((ps) => [blank(), ...ps]); setSel(0); setNote(""); };
  const removePost = (i: number) => {
    if (!window.confirm("Delete this post? This can't be undone once you save.")) return;
    setPosts((ps) => ps.filter((_, j) => j !== i));
    setSel((s) => (s == null ? null : s === i ? null : s > i ? s - 1 : s));
  };

  async function save() {
    // ensure every post has a slug
    const out = posts.map((p) => ({ ...p, slug: p.slug.trim() || slugify(p.title) }));
    setSaving(true); setNote("");
    try {
      const r = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ posts: out }) });
      const d = await r.json().catch(() => null);
      if (!r.ok) { setNote(d?.error || "Could not save - try again"); }
      else { setPosts(d.posts || out); setNote("Saved - your blog is live. Refresh /blog to see it."); }
    } catch { setNote("Could not save - try again"); }
    finally { setSaving(false); }
  }

  return (
    <div>
      {/* toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
        <button type="button" onClick={addPost} style={{ background: "var(--ink)", color: "#fff", fontWeight: 800, border: "none", borderRadius: 999, padding: "11px 20px", cursor: "pointer", fontSize: 14 }}>+ New post</button>
        <button type="button" onClick={save} disabled={saving} style={{ background: "var(--accent)", color: "#fff", fontWeight: 800, border: "none", borderRadius: 999, padding: "11px 22px", cursor: "pointer", fontSize: 14, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving…" : "Save changes"}</button>
        {note && <span style={{ fontSize: 13.5, fontWeight: 600, color: note.startsWith("Saved") ? "#1f7a54" : "#b3402a" }}>{note}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 22, alignItems: "start" }} className="be-grid">
        {/* post list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.length === 0 && <p style={{ fontSize: 14, color: "#5a6067" }}>No posts yet. Click <strong>New post</strong> to write your first.</p>}
          {posts.map((p, i) => (
            <button key={i} type="button" onClick={() => setSel(i)} style={{ textAlign: "left", padding: "11px 13px", borderRadius: 12, border: `1px solid ${i === sel ? "var(--accent)" : "var(--line)"}`, background: i === sel ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)", cursor: "pointer" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "Untitled"}</div>
              <div style={{ fontSize: 11.5, color: "#5a6067", marginTop: 3, display: "flex", gap: 8 }}>
                <span style={{ fontWeight: 700, color: p.published ? "#1f7a54" : "#b3742a" }}>{p.published ? "Published" : "Draft"}</span>
                <span>{p.category || "Uncategorised"}</span>
              </div>
            </button>
          ))}
        </div>

        {/* editor */}
        {cur ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, border: "1px solid var(--line)", borderRadius: 16, padding: 20, background: "var(--surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>
                <input type="checkbox" checked={cur.published} onChange={(e) => edit({ published: e.target.checked })} /> Published (visible on /blog)
              </label>
              <button type="button" onClick={() => sel != null && removePost(sel)} style={{ color: "#b3402a", background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Delete</button>
            </div>

            <div><span style={label}>Title</span><input style={input} value={cur.title} onChange={(e) => edit({ title: e.target.value, slug: cur.slug || slugify(e.target.value) })} placeholder="Choosing outdoor tiles for a Sunshine Coast home" /></div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><span style={label}>URL slug</span><input style={input} value={cur.slug} onChange={(e) => edit({ slug: slugify(e.target.value) })} placeholder="outdoor-tiles-sunshine-coast" /></div>
              <div><span style={label}>Category</span><input style={input} value={cur.category} onChange={(e) => edit({ category: e.target.value })} placeholder="Buying guide" /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><span style={label}>Author</span><input style={input} value={cur.author} onChange={(e) => edit({ author: e.target.value })} /></div>
              <div><span style={label}>Date</span><input type="date" style={input} value={cur.date.slice(0, 10)} onChange={(e) => edit({ date: e.target.value })} /></div>
            </div>

            <div><span style={label}>Excerpt (shown on cards + Google)</span><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={cur.excerpt} onChange={(e) => edit({ excerpt: e.target.value })} placeholder="One or two sentences that make people want to click." /></div>

            <div><span style={label}>SEO keywords (comma separated)</span><input style={input} value={cur.keywords} onChange={(e) => edit({ keywords: e.target.value })} placeholder="Sunshine Coast tiles, outdoor tiles, pool tiles, Caloundra" /></div>

            <div>
              <span style={label}>Cover image URL</span>
              <input style={input} value={cur.coverImage} onChange={(e) => edit({ coverImage: e.target.value })} placeholder="https://onwoodtiles.com.au/images/tileone/…webp" />
              {cur.coverImage ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={cur.coverImage} alt="cover preview" style={{ marginTop: 8, width: 200, height: 120, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }} /> : null}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><span style={label}>Cover credit (Product · Colour)</span><input style={input} value={cur.coverCaption} onChange={(e) => edit({ coverCaption: e.target.value })} placeholder="Cottesloe 60 · Sandstone" /></div>
              <div><span style={label}>Cover links to</span><input style={input} value={cur.coverLink} onChange={(e) => edit({ coverLink: e.target.value })} placeholder="/product/cottesloe-60" /></div>
            </div>

            <div style={{ background: "color-mix(in srgb, var(--sea) 8%, var(--surface))", border: "1px solid var(--line)", borderRadius: 10, padding: "11px 13px", fontSize: 12.5, color: "#4a5560" }}>
              <strong>Tip:</strong> to credit a product on an in-article image, use a linked image: <code style={{ fontFamily: "ui-monospace,monospace" }}>{"[![Cottesloe 60 · Sandstone](image-url)](/product/cottesloe-60)"}</code>. The caption becomes a link to that product.
            </div>

            <div>
              <span style={label}>Body (Markdown)</span>
              <textarea style={{ ...input, minHeight: 320, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 13.5, lineHeight: 1.6 }} value={cur.body} onChange={(e) => edit({ body: e.target.value })} placeholder={"## A heading\n\nA paragraph with **bold** and a [link](https://…).\n\n- A list item\n- Another\n\n> A pull quote\n\n![Image caption](https://…image.webp)"} />
              <p style={{ fontSize: 12, color: "#5a6067", marginTop: 6 }}># / ## / ### headings · **bold** · *italic* · - lists · 1. numbered · &gt; quote · ![caption](image-url) · [text](link) · --- divider</p>
            </div>
          </div>
        ) : (
          <div style={{ border: "1px dashed var(--line)", borderRadius: 16, padding: 40, textAlign: "center", color: "#5a6067", fontSize: 15 }}>Select a post to edit, or click <strong>New post</strong>.</div>
        )}
      </div>
      <style>{`@media(max-width:820px){.be-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
