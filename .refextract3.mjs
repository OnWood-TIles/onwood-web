import fs from "fs";

// script[3] embeds the full pre-rendered page as a JS string literal.
// Find the big "<!DOCTYPE html>..." literal, unescape it, write real HTML.
const src = fs.readFileSync(process.argv[2], "utf8");
const out = process.argv[3];

const start = src.indexOf("<!DOCTYPE html>");
if (start < 0) {
  console.log("no DOCTYPE literal found");
  process.exit(1);
}
// Walk forward to closing </html> then to end of the string literal.
let end = src.indexOf("</html>", start);
end = end < 0 ? src.length : end + "</html>".length;
let chunk = src.slice(start, end);

// Unescape JS string escapes -> real HTML.
chunk = chunk
  .replace(/\\u002F/gi, "/")
  .replace(/\\u003C/gi, "<")
  .replace(/\\u003E/gi, ">")
  .replace(/\\u0026/gi, "&")
  .replace(/\\n/g, "\n")
  .replace(/\\t/g, "\t")
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'")
  .replace(/\\`/g, "`")
  .replace(/\\\\/g, "\\");

fs.writeFileSync(out, chunk);
// Strip tags for a pure-copy view.
const text = chunk
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/[ \t]+/g, " ")
  .replace(/\n{2,}/g, "\n")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 1)
  .join("\n");
fs.writeFileSync(out.replace(/\.html$/, ".text.txt"), text);
console.log("wrote", out, chunk.length, "chars; text", text.length);
