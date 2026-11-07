// Shapes and fixed block heights for the options brochure. Shared by the page packer
// (lib/optionsBrochure.ts, server) and the component that renders it (client).
import type { DrawMeta, DrawingStyle } from "./options";

export type SizeCard = { label: string; detail: string | null; meta: DrawMeta; mounts: string; layouts: string[] };
export type SwatchItem = { label: string; detail: string | null; image: string | null };
/** One packed piece of an options page. Heights are fixed in the component so the packing below is exact. */
export type OptionBlock =
  | { kind: "group"; title: string; help: string | null; continued: boolean }
  | { kind: "section"; title: string }
  | { kind: "swatches"; cols: number; fit: "cover" | "contain"; items: SwatchItem[]; withDetail: boolean }
  | { kind: "list"; items: SwatchItem[] };

export type OptionsBrochureData = {
  slug: string;
  name: string; // "Lake"
  accentWord: string; // "Vanity"
  eyebrow: string; // "Marquis · Coastal Collection · 600 to 1800mm wide"
  description: string;
  rangeSummary: string;
  supplier: string | null;
  hero: string | null;
  photos: string[]; // room / product photos after the hero
  stats: { k: string; v: string }[];
  drawing: DrawingStyle;
  sizeTitle: string;
  sizePages: SizeCard[][];
  optionPages: OptionBlock[][];
  specs: { k: string; v: string }[];
  buildUrl: string; // where to price it online
  qrSvg: string;
};

// Block heights in px (the component renders exactly these).
export const H = {
  group: 74, groupHelp: 20, groupGap: 22, section: 28, list: 34,
  swatch: { 4: 170, 6: 142, 8: 116 } as Record<number, number>, detail: 14, rowGap: 12,
  page: 930, // content height between the page header and footer
};
export const SIZES_PER_PAGE = 16; // 4 x 4 size cards

export function blockHeight(b: OptionBlock): number {
  if (b.kind === "group") return H.group + (b.help ? H.groupHelp : 0);
  if (b.kind === "section") return H.section;
  if (b.kind === "list") return H.list;
  return H.swatch[b.cols] + (b.withDetail ? H.detail : 0) + H.rowGap;
}

