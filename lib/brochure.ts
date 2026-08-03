// Assemble the data for a per-family product brochure from the live feed.
import { listPairCandidates, getTaxonomy } from "./onbase/client";
import type { WebsiteRange } from "./onbase/client";
import { familySlug, groupFamilies } from "./family";

export type BrochurePhoto = { src: string; colour: string; product: string };
export type BrochureColour = { name: string; image: string | null; hex: string | null; sub: string };
export type BrochureOption = { name: string; size: string | null; image: string | null; colour: string | null; slug: string; current: boolean };
/** A finishing / accessory line for the brochure (corners, capping, pier caps). */
export type BrochureAccessory = { name: string; blurb: string; spec: string; photos: BrochurePhoto[] };
export type BrochureData = {
  slug: string;
  familyName: string;
  department: string | null;
  accentWord: string;
  eyebrow: string;
  description: string;
  /** A second, factual paragraph (colours/sizes/finish/use) so the cover's
   *  evocative copy isn't repeated on the range page. */
  rangeSummary: string;
  /** Cover hero + its colour (for the on-image caption). */
  hero: BrochurePhoto | null;
  colours: BrochureColour[];
  installed: BrochurePhoto[]; // room photos, each tagged with the colour shown
  stats: { k: string; v: string }[];
  specs: { k: string; v: string }[];
  options: BrochureOption[]; // family members; render the "Available options" block only when length > 1
  accessories: BrochureAccessory[]; // stone cladding: matching corners + capping + pier caps
};

const IMG_BASE = "https://onwoodtiles.com.au/images/veneerstone/";
// Pier caps are order-in only (hidden from the shop feed) but still belong in the
// stone-cladding brochure, so their known set is listed here.
const PIER_CAP_COLOURS = ["Limestone", "Travertine", "Grey", "Sandstone", "Charcoal"];

const spec = (r: WebsiteRange, re: RegExp) => r.specs.find((s) => re.test(s.label))?.value ?? null;
const sizeStr = (r: WebsiteRange): string | null => {
  const s = spec(r, /^size$/i);
  const m = s?.match(/(\d+)\s*[x×]\s*(\d+)/);
  return m ? `${m[1]} × ${m[2]} mm` : s;
};
const area = (r: WebsiteRange) => {
  const m = spec(r, /^size$/i)?.match(/(\d+)\s*[x×]\s*(\d+)/);
  return m ? Number(m[1]) * Number(m[2]) : 0;
};

// Longest common leading words across member names -> the family display name.
function displayName(names: string[]): string {
  const parts = names.map((n) => n.split(/\s+/));
  const first = parts[0] ?? [];
  const common: string[] = [];
  for (let i = 0; i < first.length; i++) {
    const w = first[i];
    if (parts.every((p) => p[i] === w) && !/^\d/.test(w) && !/[x×]/i.test(w)) common.push(w);
    else break;
  }
  const base = common.join(" ").trim();
  return base || (names[0] ?? "").replace(/\s+\d.*$/, "").trim() || names[0] || "Range";
}

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const numWord = (n: number) => NUM[n] ?? String(n);

export async function getFamilyBrochure(slug: string): Promise<BrochureData | null> {
  const [ranges, taxonomy] = await Promise.all([listPairCandidates(), getTaxonomy()]);
  const groups = groupFamilies(ranges);
  let members = groups.get(slug);
  // Stone-cladding accessory families (e.g. "arctic-corners") fold into their base
  // collection brochure, so a corner product's brochure link lands on the full range.
  if (members?.length && members[0].department === "stone-cladding" && /\bcorners$/i.test(members[0].name)) {
    const base = slug.replace(/-corners$/, "");
    const bm = groups.get(base);
    if (bm?.length) { slug = base; members = bm; }
  }
  if (!members || !members.length) return null;

  members.sort((a, b) => area(a) - area(b) || a.name.localeCompare(b.name));
  // Primary = the member with the richest data (most swatches, then a description).
  const primary = [...members].sort(
    (a, b) => b.swatches.length - a.swatches.length || (b.description ? 1 : 0) - (a.description ? 1 : 0),
  )[0];

  const familyName = displayName(members.map((m) => m.name));
  // Hero accent word = the product's DEPARTMENT (Reagan's call), from the taxonomy label.
  const deptLabel = taxonomy.find((d) => d.slug === primary.department)?.label || (primary.department ? titleCase(primary.department) : "Tiles");

  // Colourways: union across members by colour name, preferring one with a photo.
  const byColour = new Map<string, BrochureColour>();
  const finish = spec(primary, /^finish$/i);
  for (const m of members) {
    for (const s of m.swatches) {
      const existing = byColour.get(s.colour);
      if (existing && existing.image) continue;
      // secondary line: a "cut" pulled from the colour name, else the finish
      const cut = /cross cut/i.test(s.colour) ? "Cross cut" : /vein cut/i.test(s.colour) ? "Vein cut" : /decor/i.test(s.colour) ? "Decor" : (finish ?? "");
      byColour.set(s.colour, { name: s.colour, image: s.image ?? null, hex: s.swatchHex ?? null, sub: cut });
    }
  }
  const colours = [...byColour.values()];

  // Installed room photos across members, each tagged with its colour (deduped by src).
  const seenRoom = new Set<string>();
  const installed: BrochurePhoto[] = [];
  for (const m of members) for (const s of m.swatches) {
    if (s.installedImage && !seenRoom.has(s.installedImage)) { seenRoom.add(s.installedImage); installed.push({ src: s.installedImage, colour: s.colour, product: m.name }); }
  }
  const firstColour = colours.find((c) => c.image);
  const hero: BrochurePhoto | null = installed[0] ?? (firstColour ? { src: firstColour.image!, colour: firstColour.name, product: primary.name } : null);

  // Size line for the eyebrow: unique sizes across the family.
  const sizes = [...new Set(members.map(sizeStr).filter(Boolean) as string[])];
  const material = spec(primary, /material/i) || "Porcelain";
  const eyebrow = `${material}${sizes.length ? " · " + (sizes.length > 2 ? `${sizes[0]} to ${sizes[sizes.length - 1]}` : sizes.join(" · ")) : ""}`;

  const STONE = primary.department === "stone-cladding";
  // Stat cards: Colours (computed) + the most brochure-worthy specs.
  const stats: { k: string; v: string }[] = [{ k: "Colours", v: String(colours.length) }];
  const faces = spec(primary, /design faces|faces/i);
  if (STONE) {
    const cov = spec(primary, /coverage/i);
    if (cov) stats.push({ k: "Per box", v: cov.replace(/per box/i, "").trim() });
    const wt = spec(primary, /weight/i);
    if (wt) stats.push({ k: "Weight", v: wt });
    const origin = spec(primary, /origin/i);
    if (origin) stats.push({ k: "Made", v: origin.replace(/^australian.*/i, "Australia") });
  } else {
    if (faces) stats.push({ k: "Faces", v: (faces.match(/\d+/)?.[0]) ?? faces });
    const slip = spec(primary, /slip/i);
    if (slip) stats.push({ k: "Slip", v: (slip.match(/P\d(?:\s*[\/].*P\d)?/i)?.[0] || slip).replace(/\s+/g, "").replace(/\(.*?\)/g, "") });
    const edge = spec(primary, /^edge$/i);
    if (edge) stats.push({ k: "Edge", v: edge });
  }
  const stats4 = stats.slice(0, 4);

  // Accessories (stone cladding collections only): matching corners + capping + pier caps.
  const accessories: BrochureAccessory[] = [];
  if (STONE && !/corners|capping|pier/i.test(familyName)) {
    const photosOf = (r: WebsiteRange, product: string) =>
      r.swatches.filter((s) => s.image).map((s) => ({ src: s.image as string, colour: s.colour, product }));
    const cornerRange = ranges.find((r) => r.department === "stone-cladding" && r.name.toLowerCase() === `${familyName} corners`.toLowerCase());
    if (cornerRange) accessories.push({ name: "Matching corners", spec: "Sold per lineal metre", blurb: `Prefabricated L-shaped corner pieces that wrap external corners seamlessly, handcrafted in the same stone as the ${familyName} wall.`, photos: photosOf(cornerRange, `${familyName} Corner`) });
    const cappingRange = ranges.find((r) => r.department === "stone-cladding" && /^capping$/i.test(r.name));
    if (cappingRange) accessories.push({ name: "Capping", spec: "≈ 510 × 290mm · sold each", blurb: "Solid stone capping to finish and weather-protect wall tops, piers and fence lines.", photos: photosOf(cappingRange, "Capping") });
    accessories.push({ name: "Pier caps", spec: "390 × 390mm · sold each", blurb: "Square pier caps to crown pillars, posts and columns with a solid stone finish.", photos: PIER_CAP_COLOURS.map((c) => ({ src: `${IMG_BASE}piercap-${c.toLowerCase()}.webp?v=3`, colour: c, product: "Pier Cap" })) });
  }

  // Spec table: the primary's specs, with size generalised + size-specific row dropped when the family spans sizes.
  const multi = members.length > 1;
  const specs = primary.specs
    .filter((s) => !(multi && /^box quantity$/i.test(s.label)))
    .map((s) => (multi && /^size$/i.test(s.label) && sizes.length > 1 ? { k: s.label, v: sizes.join(", ") } : { k: s.label, v: s.value }));

  const options: BrochureOption[] = members.map((m) => {
    const sw = m.swatches.find((s) => s.image);
    return { name: m.name, size: sizeStr(m), image: sw?.image ?? null, colour: sw?.colour ?? null, slug: m.slug, current: m.id === primary.id };
  });

  // Factual second paragraph, distinct from the cover's evocative description.
  const facesNum = faces ? faces.match(/\d+/)?.[0] : null;
  const slipRaw = spec(primary, /slip/i);
  const application = spec(primary, /application/i);
  const sizeList = sizes.length ? (sizes.length > 2 ? `${sizes.slice(0, -1).join(", ")} and ${sizes[sizes.length - 1]}` : sizes.join(" and ")) : "";
  const bits: string[] = [];
  bits.push(`${familyName} is available in ${numWord(colours.length)} colourway${colours.length === 1 ? "" : "s"}${sizeList ? ` across ${sizeList}` : ""}`);
  const finishBit = [finish ? `a ${finish.toLowerCase()} finish` : "", facesNum ? `${facesNum} design faces per colour` : ""].filter(Boolean).join(" with ");
  let rangeSummary = bits[0] + (finishBit ? `, with ${finishBit}` : "") + ".";
  const wet = /p4/i.test(slipRaw || "") && /p2/i.test(slipRaw || "");
  if (wet) rangeSummary += ` Rated P2 dry indoors and P4 wet underfoot outdoors, it suits ${(application || "floors and walls").toLowerCase()}.`;
  else if (application) rangeSummary += ` Suitable for ${application.toLowerCase()}.`;

  return {
    slug,
    familyName,
    department: primary.department ?? null,
    accentWord: deptLabel,
    eyebrow,
    description: primary.description ?? `${familyName} at OnWood Tiles.`,
    rangeSummary,
    hero,
    colours,
    installed: installed.slice(0, 6),
    stats: stats4,
    specs,
    options,
    accessories,
  };
}
