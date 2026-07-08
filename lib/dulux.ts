// Dulux / Colorbond colour selection for the vision-board paint picker.
//
// A curated starter set of popular Australian Dulux + Colorbond colours. Hex
// values are best-effort on-screen approximations - screen colour is always a
// guide only, never an exact paint match (that is true of every screen). The
// full official Dulux fandeck can be dropped in later by extending this array
// (same {name, hex, collection} shape).
export type DuluxColour = { name: string; hex: string; collection: string };

export const DULUX_COLOURS: DuluxColour[] = [
  // Whites & off-whites
  { name: "Vivid White", hex: "#FEFEFA", collection: "Whites & Neutrals" },
  { name: "Natural White", hex: "#EFE9DB", collection: "Whites & Neutrals" },
  { name: "Whisper White", hex: "#ECE7DA", collection: "Whites & Neutrals" },
  { name: "Lexicon Quarter", hex: "#F2F4F3", collection: "Whites & Neutrals" },
  { name: "Lexicon Half", hex: "#EDEFEE", collection: "Whites & Neutrals" },
  { name: "Antique White U.S.A.", hex: "#E6DECC", collection: "Whites & Neutrals" },
  { name: "White On White", hex: "#EEEDE2", collection: "Whites & Neutrals" },
  { name: "Hog Bristle Quarter", hex: "#E4DDC8", collection: "Whites & Neutrals" },
  { name: "Hog Bristle Half", hex: "#D9D0B8", collection: "Whites & Neutrals" },
  { name: "Hog Bristle", hex: "#CFC4A6", collection: "Whites & Neutrals" },
  { name: "Terrace White", hex: "#E3DDCB", collection: "Whites & Neutrals" },
  { name: "Fair Bianca", hex: "#ECE8DB", collection: "Whites & Neutrals" },
  { name: "China White", hex: "#E6E0D1", collection: "Whites & Neutrals" },
  { name: "Snowy Mountains Half", hex: "#EDEBE1", collection: "Whites & Neutrals" },
  { name: "Ecru", hex: "#E4DCC7", collection: "Whites & Neutrals" },
  { name: "Chalk U.S.A.", hex: "#E5DFCF", collection: "Whites & Neutrals" },
  { name: "White Duck", hex: "#DFDAC8", collection: "Whites & Neutrals" },
  { name: "Self Destruct", hex: "#ECE8DD", collection: "Whites & Neutrals" },
  { name: "Southerly", hex: "#EBEAE2", collection: "Whites & Neutrals" },
  { name: "Okie White", hex: "#E8E2D1", collection: "Whites & Neutrals" },
  { name: "Casper White Quarter", hex: "#E7E8E4", collection: "Whites & Neutrals" },

  // Greys & neutrals
  { name: "Silkwort", hex: "#D8D5CB", collection: "Greys" },
  { name: "Milton Moon", hex: "#A19D91", collection: "Greys" },
  { name: "Timeless Grey", hex: "#B6B3AA", collection: "Greys" },
  { name: "Beige Royal", hex: "#CEC5B1", collection: "Greys" },
  { name: "Tranquil Retreat", hex: "#C8C5BB", collection: "Greys" },
  { name: "Grey Pebble", hex: "#C2BDB1", collection: "Greys" },
  { name: "Linseed", hex: "#CAC2AD", collection: "Greys" },
  { name: "Stepney", hex: "#B8B2A3", collection: "Greys" },
  { name: "Ticking", hex: "#9A968B", collection: "Greys" },
  { name: "Dieskau", hex: "#6D6D69", collection: "Greys" },
  { name: "Klavier", hex: "#8B8A85", collection: "Greys" },
  { name: "Western Myall", hex: "#6E695F", collection: "Greys" },
  { name: "Domino", hex: "#565358", collection: "Greys" },
  { name: "Monument", hex: "#35363A", collection: "Greys" },
  { name: "Ferro", hex: "#3A3B3D", collection: "Greys" },
  { name: "Charcoal", hex: "#37383B", collection: "Greys" },
  { name: "Grand Piano", hex: "#2B2B2D", collection: "Greys" },

  // Colorbond steel range
  { name: "Surfmist", hex: "#E4E2D7", collection: "Colorbond" },
  { name: "Dune", hex: "#CEC8BC", collection: "Colorbond" },
  { name: "Shale Grey", hex: "#BFC1B7", collection: "Colorbond" },
  { name: "Evening Haze", hex: "#C7BF9F", collection: "Colorbond" },
  { name: "Classic Cream", hex: "#E8DEB6", collection: "Colorbond" },
  { name: "Paperbark", hex: "#CABFA4", collection: "Colorbond" },
  { name: "Cove", hex: "#C6BAA2", collection: "Colorbond" },
  { name: "Windspray", hex: "#888C8D", collection: "Colorbond" },
  { name: "Bluegum", hex: "#7C8A8C", collection: "Colorbond" },
  { name: "Wallaby", hex: "#83817B", collection: "Colorbond" },
  { name: "Gully", hex: "#605D56", collection: "Colorbond" },
  { name: "Jasper", hex: "#6D645B", collection: "Colorbond" },
  { name: "Woodland Grey", hex: "#4B4E4A", collection: "Colorbond" },
  { name: "Basalt", hex: "#585C5E", collection: "Colorbond" },
  { name: "Ironstone", hex: "#3F464A", collection: "Colorbond" },
  { name: "Monument (Colorbond)", hex: "#383B3E", collection: "Colorbond" },
  { name: "Night Sky", hex: "#1D1C1B", collection: "Colorbond" },
  { name: "Deep Ocean", hex: "#33414E", collection: "Colorbond" },
  { name: "Cottage Green", hex: "#33422E", collection: "Colorbond" },
  { name: "Pale Eucalypt", hex: "#79856F", collection: "Colorbond" },
  { name: "Manor Red", hex: "#5C3236", collection: "Colorbond" },
  { name: "Mangrove", hex: "#4F4A3E", collection: "Colorbond" },

  // Greens
  { name: "Rivergum", hex: "#6D7255", collection: "Greens" },
  { name: "Wilderness", hex: "#7B7F5F", collection: "Greens" },
  { name: "Highgate", hex: "#5A6050", collection: "Greens" },
  { name: "Green Piano", hex: "#393F33", collection: "Greens" },
  { name: "Ricebowl", hex: "#C8C5A5", collection: "Greens" },
  { name: "Kombu Green", hex: "#3B493D", collection: "Greens" },
  { name: "Jitterbug", hex: "#8D9972", collection: "Greens" },
  { name: "Namadji", hex: "#6A6E53", collection: "Greens" },
  { name: "Sage", hex: "#A8AB8D", collection: "Greens" },
  { name: "Eucalyptus", hex: "#5E6A53", collection: "Greens" },
  { name: "Chameleon", hex: "#7D8460", collection: "Greens" },

  // Blues
  { name: "Blue Grey Mist", hex: "#C2CAC8", collection: "Blues" },
  { name: "Denim Drift", hex: "#6D7F86", collection: "Blues" },
  { name: "Bluestone", hex: "#5D6A6D", collection: "Blues" },
  { name: "Namibian", hex: "#4E5F65", collection: "Blues" },
  { name: "Oolong", hex: "#7E8E8D", collection: "Blues" },
  { name: "Blue Gum", hex: "#5B6B6D", collection: "Blues" },
  { name: "Tranquil Bay", hex: "#9EAFAD", collection: "Blues" },
  { name: "Flooded Gum", hex: "#899997", collection: "Blues" },

  // Beiges, tans & browns
  { name: "Otter", hex: "#897A61", collection: "Beiges & Browns" },
  { name: "Tea", hex: "#B8A889", collection: "Beiges & Browns" },
  { name: "Buff It", hex: "#C6B38D", collection: "Beiges & Browns" },
  { name: "Raku", hex: "#796955", collection: "Beiges & Browns" },
  { name: "Beachcomber", hex: "#B8A484", collection: "Beiges & Browns" },
  { name: "Tallow", hex: "#D8C9A6", collection: "Beiges & Browns" },
  { name: "Otter Half", hex: "#A2957E", collection: "Beiges & Browns" },
  { name: "Java", hex: "#5A4B3B", collection: "Beiges & Browns" },

  // Warm - yellows & golds
  { name: "Hokey Pokey", hex: "#E6C67A", collection: "Warm & Earth" },
  { name: "Wild Rice", hex: "#E4DAB7", collection: "Warm & Earth" },
  { name: "Golden Sand", hex: "#E1CD99", collection: "Warm & Earth" },
  { name: "Turmeric", hex: "#D6A64C", collection: "Warm & Earth" },

  // Reds, terracottas & pinks
  { name: "Red Box", hex: "#7B4A3B", collection: "Warm & Earth" },
  { name: "Terracotta", hex: "#B0623A", collection: "Warm & Earth" },
  { name: "Dulux Terracotta", hex: "#C46A44", collection: "Warm & Earth" },
  { name: "Potters Clay", hex: "#AF6949", collection: "Warm & Earth" },
  { name: "Brick", hex: "#9A5A44", collection: "Warm & Earth" },
  { name: "Peach Quartz", hex: "#E8C3A7", collection: "Warm & Earth" },
  { name: "Just Peachy", hex: "#EECAAF", collection: "Warm & Earth" },
  { name: "Wildflower", hex: "#C7896F", collection: "Warm & Earth" },
];
