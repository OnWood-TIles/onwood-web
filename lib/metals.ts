// Metal finishes for the vision board - the popular interior/tapware/hardware
// finishes used in Australian home design. Each carries a `finish` (which drives
// how the disc is rendered: brushed texture, matte with no shine, satin sheen,
// polished mirror, or an aged/weathered antique look) and three tones.
export type MetalFinish = "polished" | "brushed" | "satin" | "matte" | "antique";

export type Metal = {
  name: string;
  finish: MetalFinish;
  light: string; // highlight tone
  mid: string; // body tone
  dark: string; // shadow tone
  texture?: string; // real photographic texture (used as the disc fill when set)
};

const M = "/images/metals";

export const METALS: Metal[] = [
  // Silvers
  { name: "Brushed Nickel", finish: "brushed", light: "#dcdac8", mid: "#b8b3a1", dark: "#8f8a76", texture: `${M}/brushed-nickel.jpg` },
  { name: "Polished Nickel", finish: "polished", light: "#efeae0", mid: "#c6bfb0", dark: "#8d8674" },
  { name: "Satin Nickel", finish: "satin", light: "#dcdcd6", mid: "#b3b2ab", dark: "#86857d" },
  { name: "Chrome", finish: "polished", light: "#ffffff", mid: "#ccd6db", dark: "#7c8b93" },
  { name: "Stainless Steel", finish: "brushed", light: "#dfe2e3", mid: "#b0b6b8", dark: "#7f8588", texture: `${M}/stainless-steel.jpg` },
  // Greys
  { name: "Gunmetal", finish: "satin", light: "#5c636d", mid: "#363c45", dark: "#1e222a" },
  { name: "Graphite", finish: "satin", light: "#888c91", mid: "#4f5358", dark: "#2f3236" },
  { name: "Pewter", finish: "matte", light: "#c3c3bd", mid: "#9a998f", dark: "#6d6c64" },
  // Golds & brass
  { name: "Brushed Brass", finish: "brushed", light: "#e3c886", mid: "#bf9a49", dark: "#8a6d31", texture: `${M}/brushed-brass.jpg` },
  { name: "Polished Brass", finish: "polished", light: "#ffe9a8", mid: "#d4a94a", dark: "#8f6b26" },
  { name: "Champagne Gold", finish: "satin", light: "#f0e4c8", mid: "#d9c399", dark: "#ac9668" },
  { name: "Antique Brass", finish: "antique", light: "#8a7448", mid: "#5c4a2e", dark: "#38301f", texture: `${M}/antique-brass.jpg` },
  { name: "Aged Gold", finish: "antique", light: "#cbae67", mid: "#a1823f", dark: "#6b5228" },
  // Copper & bronze
  { name: "Brushed Copper", finish: "brushed", light: "#d79a76", mid: "#b06f49", dark: "#7d4d33", texture: `${M}/brushed-copper.jpg` },
  { name: "Aged Copper", finish: "antique", light: "#ad7550", mid: "#7a4a30", dark: "#46362a", texture: `${M}/aged-copper.jpg` },
  { name: "Bronze", finish: "satin", light: "#b98f5f", mid: "#8a6539", dark: "#574026" },
  { name: "Antique Bronze", finish: "antique", light: "#8a6f47", mid: "#5a4530", dark: "#322419" },
];
