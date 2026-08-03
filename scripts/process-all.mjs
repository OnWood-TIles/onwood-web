// Driver: run process-range for every mapped range, limited concurrency. Skips the
// 5 unmapped (no website id) and Antiquity (already imported). Logs progress.
//   node scripts/process-all.mjs
import fs from "fs";
import { spawn } from "child_process";
const plan = JSON.parse(fs.readFileSync(".refwork/tileone-plan.json", "utf8"));
const keys = plan.filter((p) => p.websiteIds.length && p.normKey !== "ANTIQUITY").map((p) => p.normKey);
const CONC = 5;
let i = 0, done = 0;
const results = [];
function run(key) {
  return new Promise((res) => {
    const ch = spawn("node", ["scripts/process-range.mjs", key], { cwd: process.cwd() });
    let out = "";
    ch.stdout.on("data", (d) => (out += d));
    ch.stderr.on("data", (d) => (out += d));
    ch.on("close", (code) => { done++; const line = out.trim().split("\n").pop(); console.log(`(${done}/${keys.length}) ${line}`); results.push({ key, code }); res(); });
  });
}
async function worker() { while (i < keys.length) { const k = keys[i++]; await run(k); } }
await Promise.all(Array.from({ length: CONC }, worker));
const fails = results.filter((r) => r.code !== 0);
console.log(`\nDONE. ${results.length - fails.length} ok, ${fails.length} failed` + (fails.length ? `: ${fails.map((f) => f.key).join(",")}` : ""));
