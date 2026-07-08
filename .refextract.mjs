import fs from "fs";

const file = process.argv[2];
const outbase = process.argv[3];
const html = fs.readFileSync(file, "utf8");

// Keep the biggest <script> (the app bundle).
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
  (m) => m[1],
);
scripts.sort((a, b) => b.length - a.length);
const big = scripts[0] || "";
fs.writeFileSync(outbase + ".bundle.js", big);

// Pretty-print for reading.
let pretty = big
  .replace(/;/g, ";\n")
  .replace(/\{/g, "{\n")
  .replace(/\}/g, "\n}\n");
fs.writeFileSync(outbase + ".pretty.js", pretty);

// Ordered human copy strings.
const re = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
const lits = [];
let m;
while ((m = re.exec(big))) {
  const s = m[2];
  if (
    /[A-Za-z]{3,}/.test(s) &&
    s.length <= 140 &&
    !/^[\w./@:-]+$/.test(s) &&
    !/function|return|const |var |=>|useState|useEffect|className|createElement|import |export /.test(
      s,
    )
  ) {
    lits.push(s);
  }
}
fs.writeFileSync(outbase + ".copy.txt", [...new Set(lits)].join("\n"));

console.log(
  file.split(/[\\/]/).pop(),
  "-> bundle",
  big.length,
  "chars, pretty",
  pretty.split("\n").length,
  "lines, copy",
  new Set(lits).size,
);
