import sharp, { type OutputInfo } from "sharp";

// Background knock-out for shaped tiles. Flood-fills the near-pure-white pixels
// connected to the image edge (the studio backdrop), plus one ring of light
// anti-aliased fringe, and makes them transparent. Returns null (= keep the plain
// image) when it isn't a shaped tile on white: nothing/too much removed, the tile
// itself is light (a white tile's glaze touches the edge and would be eaten), the
// corners are tile (square mosaic sheets - only grout would go), or white reaches
// into the middle (a black-and-white pattern, not a backdrop).
export async function cutout({ data, info }: { data: Buffer; info: OutputInfo }): Promise<Buffer | null> {
  const { width: w, height: h } = info;
  const n = w * h;
  const minCh = (p: number) => Math.min(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]);
  const bg = new Uint8Array(n);
  const stack: number[] = [];
  const seed = (p: number) => {
    if (!bg[p] && minCh(p) >= 246) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (p >= w) seed(p - w);
    if (p < n - w) seed(p + w);
  }
  let removed = 0, lum = 0;
  for (let p = 0; p < n; p++) {
    if (bg[p]) { removed++; continue; }
    lum += (data[p * 3] + data[p * 3 + 1] + data[p * 3 + 2]) / 3;
  }
  const frac = removed / n;
  if (frac < 0.03 || frac > 0.6 || lum / (n - removed) > 228) return null;
  // A shaped tile leaves its bounding-box corners on the backdrop.
  const ix = Math.max(1, Math.round(w * 0.02)), iy = Math.max(1, Math.round(h * 0.02));
  const corners = [iy * w + ix, iy * w + w - 1 - ix, (h - 1 - iy) * w + ix, (h - 1 - iy) * w + w - 1 - ix];
  if (corners.filter((p) => bg[p]).length < 3) return null;
  // ...and its middle is solid tile.
  let mid = 0, midN = 0;
  for (let y = Math.round(h * 0.25); y < Math.round(h * 0.75); y++)
    for (let x = Math.round(w * 0.25); x < Math.round(w * 0.75); x++) { midN++; if (bg[y * w + x]) mid++; }
  if (mid / midN > 0.05) return null;
  // Keep only the main piece: drop small detached bits (e.g. the strip of mini
  // colour-variant hexagons GNS shows under a hex tile).
  const comp = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  for (let s = 0; s < n; s++) {
    if (bg[s] || comp[s] !== -1) continue;
    const id = sizes.length;
    let size = 0;
    comp[s] = id;
    stack.push(s);
    while (stack.length) {
      const p = stack.pop()!;
      size++;
      const x = p % w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < n - w ? p + w : -1])
        if (q >= 0 && !bg[q] && comp[q] === -1) { comp[q] = id; stack.push(q); }
    }
    sizes.push(size);
  }
  const main = sizes.indexOf(Math.max(...sizes));
  if (sizes[main] >= 0.6 * (n - removed)) for (let p = 0; p < n; p++) if (!bg[p] && comp[p] !== main) bg[p] = 1;
  const alpha = Buffer.alloc(n, 255);
  for (let p = 0; p < n; p++) {
    if (bg[p]) { alpha[p] = 0; continue; }
    // light fringe pixel touching the backdrop -> drop it too (no white halo)
    const x = p % w;
    const touches = (x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) || (p >= w && bg[p - w]) || (p < n - w && bg[p + w]);
    if (touches && minCh(p) >= 215) alpha[p] = 0;
  }
  // extractChannel: blur would otherwise hand back a 3-channel buffer (striped alpha).
  const soft = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(0.6).extractChannel(0).raw().toBuffer();
  const rgba = await sharp(data, { raw: { width: w, height: h, channels: 3 } }).joinChannel(soft, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  // Crop to what's left (the dropped bits may have widened the box).
  return sharp(rgba).trim().webp({ quality: 84, alphaQuality: 90 }).toBuffer();
}
