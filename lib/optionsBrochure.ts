// Assemble the brochure for a made-to-order product with options (a Marquis vanity
// range, mirror or shaver): every size with its line drawing, then each option group
// (benchtops, basins, finishes, handles, extras) packed onto fixed A4 pages. No prices:
// a printed brochure outlives the price file, so it points to the online builder instead.
import QRCode from "qrcode";
import { getRange, getTaxonomy } from "./onbase/client";
import { coverIntro } from "./brochure";
import { drawMeta, isAvailable, normalizeSelection, type OptionGroup, type ProductOptions } from "./options";
import { blockHeight, H, SIZES_PER_PAGE, type OptionBlock, type OptionsBrochureData, type SizeCard, type SwatchItem } from "./optionsBrochureLayout";
export type { OptionsBrochureData } from "./optionsBrochureLayout";

const MOUNT: Record<string, string> = { wallmount: "Wall-hung", kick: "Kick base", legs: "Legs" };
const num = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const words = (n: number) => num[n] ?? String(n);

/** Order-form details (left or right hand, which side the power point goes) are asked when
 *  ordering, not browsed, so they stay out of the brochure. */
const isSidePick = (g: OptionGroup) => g.choices.length > 0 && g.choices.every((c) => /^(left|right)\b/i.test(c.label));

// Builder wording that talks about prices, which a printed brochure leaves out.
const noPrice = (t?: string | null) => (t && !/price|credit/i.test(t) ? t : null);

function packGroup(g: OptionGroup): OptionBlock[][] {
  // The group body as rows (the caller adds the header and paginates).
  const imgs = g.choices.filter((c) => c.image).length;
  const rows: OptionBlock[][] = [];
  if (imgs >= g.choices.length / 2) {
    const cols = g.choices.length <= 4 ? 4 : g.choices.length <= 12 ? 6 : 8;
    const fit = g.drawFill ? "cover" : "contain";
    // Sectioned choices first (Ceramic, Acrylic...), loose ones ("Use my own basin") last.
    const ordered = [...g.choices.filter((c) => c.section), ...g.choices.filter((c) => !c.section)];
    const sections: [string | null, typeof ordered][] = [];
    for (const c of ordered) {
      const last = sections[sections.length - 1];
      if (last && last[0] === (c.section ?? null)) last[1].push(c);
      else sections.push([c.section ?? null, [c]]);
    }
    // Small sections (3 leg styles each) run together in one grid, the section named
    // under each label instead of a heading per handful.
    const flat = sections.length > 1 && sections.every(([, cs]) => cs.length < cols);
    const item = (c: (typeof ordered)[number]): SwatchItem => {
      const detail = flat && c.section && !c.label.toLowerCase().includes(c.section.toLowerCase()) ? c.section : noPrice(c.detail);
      return { label: c.label, detail, image: c.image ?? null };
    };
    const groupsToLay: [string | null, SwatchItem[]][] = flat ? [[null, ordered.map(item)]] : sections.map(([s, cs]) => [s, cs.map(item)]);
    const withDetail = groupsToLay.some(([, its]) => its.some((i) => i.detail));
    for (const [s, its] of groupsToLay) {
      for (let i = 0; i < its.length; i += cols) {
        const row: OptionBlock[] = [];
        if (i === 0 && s && groupsToLay.length > 1) row.push({ kind: "section", title: `${s} · ${its.length}` });
        row.push({ kind: "swatches", cols, fit, items: its.slice(i, i + cols), withDetail });
        rows.push(row);
      }
    }
  } else {
    // No photos: labelled rows, two to a line unless the wording is long.
    const its = g.choices.map((c) => ({ label: c.label, detail: noPrice(c.detail), image: null }));
    const wide = its.some((i) => i.label.length + (i.detail?.length ?? 0) > 44);
    const per = wide ? 1 : 2;
    for (let i = 0; i < its.length; i += per) rows.push([{ kind: "list", items: its.slice(i, i + per) }]);
  }
  return rows;
}

function paginate(groups: OptionGroup[]): OptionBlock[][] {
  const pages: OptionBlock[][] = [];
  let page: OptionBlock[] = [];
  let used = 0;
  const flush = () => { if (page.length) pages.push(page); page = []; used = 0; };
  for (const g of groups) {
    const rows = packGroup(g);
    if (!rows.length) continue;
    const header = (continued: boolean): OptionBlock => ({ kind: "group", title: g.label, help: continued ? null : noPrice(g.help), continued });
    const rowH = (r: OptionBlock[]) => r.reduce((a, b) => a + blockHeight(b), 0);
    // Start the group on a new page unless its header and first row fit here.
    if (used && used + H.groupGap + blockHeight(header(false)) + rowH(rows[0]) > H.page) flush();
    if (used) used += H.groupGap;
    page.push(header(false)); used += blockHeight(header(false));
    for (const r of rows) {
      if (used + rowH(r) > H.page) {
        flush();
        const h = header(true);
        page.push(h); used += blockHeight(h);
      }
      page.push(...r); used += rowH(r);
    }
  }
  flush();
  return pages;
}

export async function getOptionsBrochure(slug: string): Promise<OptionsBrochureData | null> {
  const [range, taxonomy] = await Promise.all([getRange(slug), getTaxonomy()]);
  const o: ProductOptions | null | undefined = range?.options;
  // Vanities and tallboys only: a mirror is one size and a couple of options, which the product page already covers.
  if (!range || !o || (o.drawing !== "vanity" && o.drawing !== "tallboy")) return null;

  const supplier = o.source?.supplier ?? null;
  // "Marquis Lake Vanity" -> "Lake" + accent "Vanity"; otherwise the department label.
  let base = range.name.trim();
  if (supplier && base.toLowerCase().startsWith(supplier.toLowerCase() + " ")) base = base.slice(supplier.length + 1);
  const tail = base.match(/\s+(Vanity|Mirror|Shaver|Tallboy|Cabinet)$/i);
  const dept = taxonomy.find((d) => d.slug === range.department);
  const name = tail ? base.slice(0, tail.index).trim() : base;
  const accentWord = tail ? tail[1] : dept?.label ?? "Made to order";
  const category = dept?.categories.find((c) => range.categories.includes(c.slug) && /collection/i.test(c.label))?.label ?? null;

  // Sizes: the group whose choices carry a width (else the first group).
  const sizeGroup = o.groups.find((g) => g.choices.some((c) => c.draw?.width)) ?? o.groups[0];
  const mountGroup = o.groups.find((g) => g !== sizeGroup && g.choices.some((c) => c.draw?.mount));
  const legsChoice = o.groups.flatMap((g) => g.choices).find((c) => c.draw?.mount === "legs");
  const cards: SizeCard[] = (sizeGroup?.choices ?? []).map((c) => {
    const sel = normalizeSelection(o, { [sizeGroup.key]: c.key });
    const byMount = new Map<string, string[]>();
    for (const l of mountGroup?.choices ?? []) {
      if (!isAvailable(o, mountGroup!, l, { [sizeGroup.key]: c.key })) continue;
      const m = MOUNT[l.draw?.mount ?? ""] ?? "Layout";
      const config = l.draw?.config ?? l.label.replace(/^[^,]*,\s*/, "");
      const list = byMount.get(m) ?? [];
      if (!list.includes(config)) list.push(config);
      byMount.set(m, list);
    }
    const mounts = [...byMount.keys()];
    // Legs go under a kick-base layout (the "Legs instead of kick" choice).
    if (legsChoice && byMount.has("Kick base")) mounts.push("Legs");
    return {
      label: c.label,
      detail: c.detail ?? null,
      meta: drawMeta(o, sel),
      mounts: mounts.join(" · "),
      layouts: [...byMount.entries()].map(([m, cs]) => (byMount.size > 1 ? `${m}: ${cs.join(", ")}` : cs.join(", "))),
    };
  });
  const sizePages: SizeCard[][] = [];
  for (let i = 0; i < cards.length; i += SIZES_PER_PAGE) sizePages.push(cards.slice(i, i + SIZES_PER_PAGE));

  const browse = o.groups.filter((g) => g !== sizeGroup && g !== mountGroup && g.type !== "text" && !g.websiteHidden && !isSidePick(g)
    && (g.choices.length > 1 || g.choices.some((c) => c.image)));
  const optionPages = paginate(browse);

  // Facts for the cover eyebrow, stat cards and range paragraph.
  const widths = cards.map((c) => c.meta.width).filter((w): w is number => !!w);
  const span = widths.length ? (Math.min(...widths) === Math.max(...widths) ? `${widths[0]}mm wide` : `${Math.min(...widths)} to ${Math.max(...widths)}mm wide`) : null;
  const count = (re: RegExp) => o.groups.find((g) => re.test(g.key) || re.test(g.label))?.choices.length ?? 0;
  const finishes = count(/^finish$|cabinet finish/i), tops = count(/^topColour$|benchtop colour/i), basins = o.groups.find((g) => /^basin$/i.test(g.key))?.choices.filter((c) => c.section).length ?? 0;
  const stats: { k: string; v: string }[] = [];
  if (cards.length > 1) stats.push({ k: "Sizes", v: String(cards.length) });
  if (span) stats.push({ k: "Widths", v: span.replace(" wide", "") });
  if (finishes) stats.push({ k: "Finishes", v: String(finishes) });
  if (tops) stats.push({ k: "Benchtops", v: String(tops) });
  if (basins && stats.length < 4) stats.push({ k: "Basins", v: String(basins) });

  const HOW: Record<string, string> = { "Wall-hung": "hung on the wall", "Kick base": "on a kick base", Legs: "on legs" };
  const mountsAll = [...new Set(cards.flatMap((c) => c.mounts.split(" · ").filter(Boolean)))].map((m) => HOW[m]).filter(Boolean);
  let rangeSummary = `The ${name} comes in ${words(cards.length)} size${cards.length === 1 ? "" : "s"}${span ? `, ${span}` : ""}.`;
  if (mountsAll.length > 1) rangeSummary += ` It can be ${mountsAll.slice(0, -1).join(", ")} or ${mountsAll[mountsAll.length - 1]}.`;
  if (finishes) rangeSummary += ` Choose from ${finishes} cabinet finishes${tops ? `, ${tops} benchtop colours` : ""}${basins ? ` and ${basins} basins` : ""}.`;
  const lead = range.specs.find((s) => /lead time/i.test(s.label))?.value;
  if (lead) rangeSummary += ` ${lead.replace(/\.$/, "")}.`;

  const photos = [...new Set([range.heroImage, ...(range.images ?? [])].filter((x): x is string => !!x))];
  const buildUrl = `https://onwoodtiles.com.au/product/${range.slug}`;
  const qrSvg = await QRCode.toString(`${buildUrl}?utm_source=brochure&utm_medium=print`, { type: "svg", margin: 0, color: { dark: "#20303a", light: "#0000" } });

  return {
    slug: range.slug,
    name,
    accentWord,
    eyebrow: [supplier, category, span].filter(Boolean).join(" · "),
    description: coverIntro(range.description ?? `${range.name}, made to order at OnWood Tiles.`),
    rangeSummary,
    supplier,
    hero: photos[0] ?? null,
    photos: photos.slice(1, 4),
    stats: stats.slice(0, 4),
    drawing: o.drawing,
    sizeTitle: sizeGroup?.label ?? "Sizes",
    sizePages,
    optionPages,
    specs: range.specs.map((s) => ({ k: s.label, v: s.value })),
    buildUrl,
    qrSvg,
  };
}
