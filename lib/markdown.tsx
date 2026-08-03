// Minimal, XSS-safe Markdown -> React renderer. Returns real React elements
// (never dangerouslySetInnerHTML), and only emits <a>/<img> for http(s) or
// root-relative URLs, so authored content can't inject scripts. Supports:
// # ## ### headings, paragraphs, **bold**, *italic*, `code`, [text](url),
// ![alt](url) images, "- " lists, "1. " lists, "> " quotes, and "---" rules.
import React from "react";

const safeUrl = (u: string): string | null => {
  const t = u.trim();
  if (/^\//.test(t) || /^https?:\/\//i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t)) return t;
  return null;
};

// Inline: **bold**, *italic*, `code`, [text](url). Processed in that order.
function inline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2]) nodes.push(<strong key={`${keyBase}-${i}`}>{m[2]}</strong>);
    else if (m[4]) nodes.push(<em key={`${keyBase}-${i}`}>{m[4]}</em>);
    else if (m[6]) nodes.push(<code key={`${keyBase}-${i}`} className="bl-code">{m[6]}</code>);
    else if (m[8]) {
      const href = safeUrl(m[9]);
      nodes.push(href ? <a key={`${keyBase}-${i}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{m[8]}</a> : m[8]);
    }
    last = re.lastIndex; i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
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

    // horizontal rule
    if (/^---+$/.test(t)) { out.push(<hr key={k()} className="bl-hr" />); i++; continue; }

    // LINKED image on its own line: [![Product · Colour](img)](/product/slug)
    // -> a figure whose image + caption link to the product page.
    const limg = t.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/);
    if (limg) {
      const src = safeUrl(limg[2]);
      const link = safeUrl(limg[3]);
      if (src) {
        /* eslint-disable-next-line @next/next/no-img-element */
        const image = <img src={src} alt={limg[1]} loading="lazy" />;
        out.push(
          <figure key={k()} className="bl-fig">
            {link ? <a href={link} className="bl-figlink">{image}</a> : image}
            {limg[1] ? <figcaption>{link ? <a href={link} className="bl-figcredit">{limg[1]} <span aria-hidden>→</span></a> : limg[1]}</figcaption> : null}
          </figure>,
        );
      }
      i++; continue;
    }

    // image on its own line: ![alt](url)
    const img = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      const src = safeUrl(img[2]);
      if (src) out.push(
        <figure key={k()} className="bl-fig">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={img[1]} loading="lazy" />
          {img[1] ? <figcaption>{img[1]}</figcaption> : null}
        </figure>,
      );
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
