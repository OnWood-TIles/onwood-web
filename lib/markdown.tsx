// Minimal, XSS-safe Markdown -> React renderer. Returns real React elements
// (never dangerouslySetInnerHTML), and only emits <a>/<img> for http(s) or
// root-relative URLs, so authored content can't inject scripts. Supports:
// # ## ### headings, paragraphs, **bold**, *italic*, `code`, [text](url),
// ![alt](url) images, "- " lists, "1. " lists, "> " quotes, "---" rules, and
// ":::note ... :::" callout boxes (shaded sidenotes - see the OnWood blog
// format reference; used for the standard imagery disclosure on every guide).
import React from "react";

const safeUrl = (u: string): string | null => {
  const t = u.trim();
  if (/^\//.test(t) || /^https?:\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t)) return t;
  return null;
};

// Decode HTML entities in authored text (e.g. "Pool &amp; alfresco" from the
// /admin editor) so they render as real characters. Safe because output goes
// through React text nodes, which re-escape on render (never innerHTML).
const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", hellip: "…",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
};
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : m;
    }
    const hit = NAMED[e.toLowerCase()];
    return hit !== undefined ? hit : m;
  });
}

// Inline: **bold**, *italic*, `code`, [text](url). Processed in that order.
function inline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(decodeEntities(text.slice(last, m.index)));
    if (m[2]) nodes.push(<strong key={`${keyBase}-${i}`}>{decodeEntities(m[2])}</strong>);
    // Italic may itself contain a [link](url), so process its content inline
    // (a bare decode would leave an embedded link as raw "[text](url)" text).
    else if (m[4]) nodes.push(<em key={`${keyBase}-${i}`}>{inline(m[4], `${keyBase}-${i}e`)}</em>);
    else if (m[6]) nodes.push(<code key={`${keyBase}-${i}`} className="bl-code">{decodeEntities(m[6])}</code>);
    else if (m[8]) {
      const href = safeUrl(m[9]);
      const label = decodeEntities(m[8]);
      nodes.push(href ? <a key={`${keyBase}-${i}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{label}</a> : label);
    }
    last = re.lastIndex; i++;
  }
  if (last < text.length) nodes.push(decodeEntities(text.slice(last)));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = (source || "").replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;
  const k = () => `md-${key++}`;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) { i++; continue; }

    // callout / sidenote box:  :::note   ...   :::
    // A shaded aside in slightly smaller type, set apart from the body. Used for
    // the standard imagery disclosure on every guide (and any hint/sidenote).
    // The label after ::: (e.g. "note") is optional and currently cosmetic.
    if (/^:::/.test(t)) {
      i++; // consume the opening fence
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") { buf.push(lines[i].trim()); i++; }
      if (i < lines.length) i++; // consume the closing fence
      const text = buf.filter(Boolean).join(" ");
      if (text) out.push(<aside key={k()} className="bl-note">{inline(text, k())}</aside>);
      continue;
    }

    // horizontal rule
    if (/^---+$/.test(t)) { out.push(<hr key={k()} className="bl-hr" />); i++; continue; }

    // LINKED image on its own line: [![Product · Colour](img)](/product/slug)
    // -> a figure whose image + caption link to the product page.
    const limg = t.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/);
    if (limg) {
      const src = safeUrl(limg[2]);
      const link = safeUrl(limg[3]);
      if (src) {
        const cap = decodeEntities(limg[1]);
        /* eslint-disable-next-line @next/next/no-img-element */
        const image = <img src={src} alt={cap} loading="lazy" />;
        out.push(
          <figure key={k()} className="bl-fig">
            {link ? <a href={link} className="bl-figlink">{image}</a> : image}
            {cap ? <figcaption>{link ? <a href={link} className="bl-figcredit">{cap} <span aria-hidden>→</span></a> : cap}</figcaption> : null}
          </figure>,
        );
      }
      i++; continue;
    }

    // image on its own line: ![alt](url)
    const img = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      const src = safeUrl(img[2]);
      if (src) {
        const cap = decodeEntities(img[1]);
        out.push(
          <figure key={k()} className="bl-fig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={cap} loading="lazy" />
            {cap ? <figcaption>{cap}</figcaption> : null}
          </figure>,
        );
      }
      i++; continue;
    }

    // headings
    const h = t.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      const txt = inline(h[2], k());
      out.push(lvl === 1 ? <h2 key={k()} className="bl-h2">{txt}</h2> : lvl === 2 ? <h3 key={k()} className="bl-h3">{txt}</h3> : <h4 key={k()} className="bl-h4">{txt}</h4>);
      i++; continue;
    }

    // blockquote (consecutive "> ")
    if (/^>\s?/.test(t)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) { buf.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      out.push(<blockquote key={k()} className="bl-quote">{inline(buf.join(" "), k())}</blockquote>);
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, "")); i++; }
      out.push(<ul key={k()} className="bl-ul">{items.map((it, j) => <li key={j}>{inline(it, `${k()}-${j}`)}</li>)}</ul>);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s+/, "")); i++; }
      out.push(<ol key={k()} className="bl-ol">{items.map((it, j) => <li key={j}>{inline(it, `${k()}-${j}`)}</li>)}</ol>);
      continue;
    }

    // paragraph (join consecutive plain lines)
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>\s?|[-*]\s+|\d+\.\s+|---+$|!\[)/.test(lines[i].trim())) { buf.push(lines[i].trim()); i++; }
    out.push(<p key={k()} className="bl-p">{inline(buf.join(" "), k())}</p>);
  }
  return <>{out}</>;
}

/** Plain-text preview (strips markdown) for cards / meta fallbacks. */
export function stripMarkdown(source: string, max = 200): string {
  const t = (source || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t;
}
