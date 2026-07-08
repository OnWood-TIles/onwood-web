import fs from "fs";

const file = process.argv[2];
const outbase = process.argv[3];
const html = fs.readFileSync(file, "utf8");

const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
  (m) => m[1],
);

let best = "",
  bestScore = -1,
  bestIdx = -1;
scripts.forEach((s, i) => {
  // Score by presence of JSX/React source markers, penalize base64 asset blobs.
  const jsx = (
    s.match(/createElement|jsx|useState|useEffect|className|=>|function/g) || []
  ).length;
  const b64 = (s.match(/[A-Za-z0-9+/]{200,}/g) || []).length;
  const score = jsx - b64 * 100;
  fs.writeFileSync(`${outbase}.script${i}.js`, s);
  if (score > bestScore) {
    bestScore = score;
    best = s;
    bestIdx = i;
  }
  console.log(`script[${i}] len=${s.length} jsxHits=${jsx} b64blobs=${b64} score=${score}`);
});

// Pretty-print the source script.
let pretty = best
  .replace(/([;{}])/g, "$1\n")
  .replace(/\n\s*\n/g, "\n");
fs.writeFileSync(outbase + ".source.js", pretty);
console.log(`BEST source = script[${bestIdx}] -> ${outbase}.source.js (${pretty.split("\n").length} lines)`);
