import fs from "fs";

// Split the rendered HTML into per-<section> files for precise study.
const html = fs.readFileSync(process.argv[2], "utf8");
const outdir = process.argv[3];
fs.mkdirSync(outdir, { recursive: true });

// Grab <nav>, each <section ...>, <footer>. Use a simple depth-aware slice on
// top-level section/header/footer by scanning for the tags.
const tags = ["section", "header", "footer", "nav"];
const parts = [];
const re = new RegExp(`<(${tags.join("|")})\\b[^>]*>`, "gi");
let m;
const opens = [];
while ((m = re.exec(html))) opens.push({ tag: m[1].toLowerCase(), idx: m.index, open: m[0] });

// For each opening tag, find its matching close by depth counting on same tag name.
function sliceBalanced(startIdx, tag) {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const closeRe = new RegExp(`</${tag}>`, "gi");
  let depth = 0;
  let i = startIdx;
  // tokenize forward
  const tokRe = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "gi");
  tokRe.lastIndex = startIdx;
  let t;
  while ((t = tokRe.exec(html))) {
    if (t[0][1] === "/") depth--;
    else depth++;
    if (depth === 0) return html.slice(startIdx, t.index + t[0].length);
  }
  return html.slice(startIdx, startIdx + 4000);
}

let n = 0;
const index = [];
for (const o of opens) {
  // Only top-level sections/nav/footer (skip nested by checking not inside a prior slice)
  const chunk = sliceBalanced(o.idx, o.tag);
  // label from id/data-screen-label
  const label =
    (chunk.match(/data-screen-label="([^"]+)"/) || [])[1] ||
    (chunk.match(/id="([^"]+)"/) || [])[1] ||
    o.tag;
  const name = `${String(n).padStart(2, "0")}-${o.tag}-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  fs.writeFileSync(`${outdir}/${name}.html`, chunk);
  index.push(`${name}  (${chunk.length} chars)`);
  n++;
}
fs.writeFileSync(`${outdir}/_index.txt`, index.join("\n"));
console.log(index.join("\n"));
