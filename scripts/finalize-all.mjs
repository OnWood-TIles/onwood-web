// Run finalize-range for every match file: reframe matched faces + optimise rooms.
//   node scripts/finalize-all.mjs
import fs from "fs";
import { spawn } from "child_process";
const MDIR = ".refwork/matches";
const keys = fs.readdirSync(MDIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
let i = 0;
function run(key) {
  return new Promise((res) => {
    const ch = spawn("node", ["scripts/finalize-range.mjs", key, `${MDIR}/${key}.json`], { cwd: process.cwd() });
    let out = ""; ch.stdout.on("data", (d) => (out += d)); ch.stderr.on("data", (d) => (out += d));
    ch.on("close", () => { console.log(out.trim().split("\n").pop()); res(); });
  });
}
async function worker() { while (i < keys.length) await run(keys[i++]); }
await Promise.all(Array.from({ length: 5 }, worker));
console.log("\nfinalize complete");
