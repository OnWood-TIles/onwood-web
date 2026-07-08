// Feltex carpet ranges + colourways for the vision board (Feltex AU catalogue).
// Swatch images are the real Feltex product photos served from their Cloudinary
// CDN, referenced by each colour's variant id (option 1: hotlink, no storage).
export type CarpetColour = { name: string; id: string };
export type CarpetRange = {
  name: string;
  category: "Wool Carpet" | "Carpet Tiles & Planks";
  fibre: string;
  colours: CarpetColour[];
  brand?: string; // defaults to Feltex; set when other brands are added
};

// Brand -> logo asset (shown as a small badge on each swatch for recognition).
export const CARPET_BRAND_LOGOS: Record<string, string> = {
  Feltex: "/images/carpet/feltex-logo.svg",
};

// Real Feltex swatch image (square crop) for a given variant id.
export function carpetSwatchUrl(id: string): string {
  return `https://res.cloudinary.com/gh/image/upload/d_variants:${id}:floods:flat-web.jpg/ar_1:1,c_crop,g_center,w_400/f_auto/q_auto:good/v1/variants/${id}/swatches/1`;
}

const c = (name: string, id: string): CarpetColour => ({ name, id });

export const CARPET_RANGES: CarpetRange[] = [
  { name: "Ashgrove", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Wild Dove", "0404610009"), c("Vintage Ivory", "0404610010"), c("French Oak", "0404610011"), c("Earth Stone", "0404610013"), c("Urban Wood", "0404610092"), c("White Linen", "0404610100"), c("Jarrah", "0404610120"), c("Silver Lining", "0404610911") ] },
  { name: "Manningford", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Salisbury", "0946020004"), c("Marlborough", "0946020009"), c("Seymour", "0946020091"), c("St Peter", "0946020094"), c("Everleigh", "0946020099") ] },
  { name: "Barleystone", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Grasscloth", "0203880001"), c("Chalkstone", "0203880010"), c("Linen Weave", "0203880011"), c("Keystone", "0203880016"), c("Castle", "0203880090"), c("Granite", "0203880092"), c("Burlap", "0203880911"), c("Frost", "0203880912") ] },
  { name: "Berkley", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Serene", "0825650004"), c("Mondo", "0825650009"), c("Sheer Nude", "0825650010"), c("Fawn", "0825650043"), c("Dark Forest", "0825650072"), c("Samosa", "0825650091"), c("Tinker", "0825650093"), c("Metallic", "0825650094"), c("Armor", "0825650096"), c("Cinder", "0825650099") ] },
  { name: "Opulent Weave", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Silk", "0204980010"), c("Angora", "0204980011"), c("Cashmere", "0204980012"), c("Koa", "0204980019"), c("Pearl", "0204980094"), c("Rhodium", "0204980096"), c("Hematite", "0204980098"), c("Obsidian", "0204980099") ] },
  { name: "Salisbury", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Sarsen Stone", "0204600010"), c("Palisade", "0204600090"), c("Earth Bank", "0204600096"), c("Monument", "0204600097"), c("Druid Stone", "0204600510"), c("Ancient", "0204600710"), c("Solstice", "0204600720") ] },
  { name: "Stonefields", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Quartz", "0203600100"), c("Cotswold Stone", "0203600500"), c("Feldspar", "0203600530"), c("Limestone", "0203600700"), c("Pumice", "0203600703"), c("Gypsum", "0203600713"), c("Stonework", "0203600714"), c("Terrazzo", "0203600740"), c("Greystone", "0203600750") ] },
  { name: "13th Beach", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Boings", "0203910009"), c("Cylinders", "0203910011"), c("Ants", "0203910012"), c("Corners", "0203910013"), c("The Bluff", "0203910014"), c("Kelpies", "0203910070"), c("Signies", "0203910090"), c("Huttos", "0203910096") ] },
  { name: "Spinifex", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Chalky", "0800500505"), c("Bone White", "0800500515"), c("Meadow Mist", "0800500520"), c("Moth", "0800500535"), c("Earth", "0800500550"), c("Sand Storm", "0800500710"), c("Husky", "0800500725"), c("Bluestone", "0800500730"), c("Pepper", "0800500750"), c("Grey Storm", "0800500760") ] },
  { name: "Bailey", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Beechwood", "0201810009"), c("Glasshouse", "0201810010"), c("Birchwood", "0201810013"), c("Creamy Beige", "0201810041"), c("Cherokee", "0201810076"), c("Stoney Grey", "0201810096"), c("Grey Willow", "0201810911"), c("Stone Texture", "0201810925"), c("Woodgrove", "0201810934"), c("Rustic Night", "0201810972") ] },
  { name: "Hammersmith", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Ravenscourt", "0946120004"), c("Olympia", "0946120009"), c("Kensington", "0946120091"), c("West London", "0946120094"), c("Riverside", "0946120099") ] },
  { name: "Elysian", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Aurora", "0826770004"), c("Idyllic", "0826770007"), c("Serene", "0826770009"), c("Divine", "0826770011"), c("Charmed", "0826770012"), c("Solitude", "0826770013"), c("Utopia", "0826770091"), c("Heavenly", "0826770093"), c("Serendipity", "0826770095") ] },
  { name: "Essington", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Caraway", "0202440009"), c("Amber White", "0202440010"), c("Mellow Beige", "0202440013"), c("Overlap", "0202440041"), c("Evident", "0202440076"), c("Regime", "0202440096"), c("Walnut Brown", "0202440098"), c("Soft Shades", "0202440911"), c("Pewter Cup", "0202440925"), c("Slate", "0202440934"), c("Night Fall", "0202440972") ] },
  { name: "Great Divide", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Feathertop", "0294440001"), c("Barren", "0294440011"), c("Howitt", "0294440041"), c("Bogong", "0294440043"), c("Trickett", "0294440045"), c("Tambo", "0294440048"), c("Buninyong", "0294440095"), c("Franklin", "0294440096"), c("Macedon", "0294440097"), c("Wellington", "0294440099") ] },
  { name: "Hemisphere", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Eastern", "0826780007"), c("Latitude", "0826780011"), c("Meridian", "0826780012"), c("Southern", "0826780013"), c("Equator", "0826780091"), c("Western", "0826780093"), c("Northern", "0826780095") ] },
  { name: "Holland Park", category: "Wool Carpet", fibre: "Wool", colours: [
    c("Classic", "0905860014"), c("Oilskin", "0905860042"), c("Mondo", "0905860044"), c("Image", "0905860090"), c("Castle Rock", "0905860091"), c("Statue", "0905860095") ] },
  { name: "Ironbark", category: "Carpet Tiles & Planks", fibre: "Solution-dyed nylon", colours: [
    c("Hill Grey", "4807840091"), c("Yarraman", "4807840093"), c("Wandi", "4807840095"), c("Serpentine", "4807840097"), c("Granite", "4807840098") ] },
  { name: "Toatoa", category: "Carpet Tiles & Planks", fibre: "Solution-dyed nylon", colours: [
    c("Mahoe", "4807900091"), c("Patete", "4807900093"), c("Kowhai", "4807900095"), c("Horopito", "4807900097"), c("Kawakawa", "4807900098") ] },
  { name: "Eucalypt", category: "Carpet Tiles & Planks", fibre: "Solution-dyed nylon", colours: [
    c("Paperbark", "4807960091"), c("Blue Gum", "4807960093"), c("Stringy Bark", "4807960095"), c("Mallee", "4807960097"), c("Brown Mallet", "4807960098") ] },
  { name: "Aria II", category: "Carpet Tiles & Planks", fibre: "Solution-dyed nylon", colours: [
    c("Federal Blue", "1977810033"), c("Stone Taupe", "1977810043"), c("Silver Dusk", "1977810090"), c("Steel Ash", "1977810091"), c("Gunmetal", "1977810093"), c("Smoke Haze", "1977810096"), c("Alluvial", "1977810098") ] },
  { name: "Tivoli", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Latte", "0241370001"), c("Vanilla", "0241370011"), c("Creme", "0241370012"), c("Mocha", "0241370041"), c("Mocachino", "0241370091"), c("Chai", "0241370092"), c("Macchiato", "0241370095"), c("Espresso", "0241370096") ] },
  { name: "Bancroft", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Sandy White", "0702810011"), c("Taupe", "0702810013"), c("Dove White", "0702810014"), c("Country Plain", "0702810015"), c("Ashwood", "0702810092"), c("Urban Grey", "0702810093"), c("Forge", "0702810096") ] },
  { name: "Velura", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Bare Canvas", "0241470001"), c("Natural Linen", "0241470010"), c("Opal Bay", "0241470011"), c("Sun Ray", "0241470012"), c("Honey Beige", "0241470041"), c("Silverstone", "0241470091"), c("Bird Feather", "0241470092"), c("Pewter Cup", "0241470093"), c("Cast Iron", "0241470094"), c("Starry Night", "0241470095"), c("Mocha Delight", "0241470096"), c("Molten Rock", "0241470097"), c("Stony Path", "0241470911") ] },
  { name: "Rustic Nature", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Farmland", "0501270009"), c("Log Cabin", "0501270010"), c("Hayseed", "0501270011"), c("Pebble Path", "0501270012"), c("Back Country", "0501270090"), c("Meadow", "0501270091"), c("Provincial", "0501270092"), c("Woodland", "0501270093") ] },
  { name: "Regal Elegance", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Silver Cloud", "0242520009"), c("Old Parchment", "0242520011"), c("Natural Clay", "0242520012"), c("Applewood", "0242520014"), c("Brushwood Stipple", "0242520015"), c("Dark Earth", "0242520042"), c("Possum Tail", "0242520045"), c("Ironbark", "0242520092"), c("Ashwood", "0242520093"), c("Timber Barn", "0242520094"), c("Snow Gum", "0242520095"), c("Dark Canyon", "0242520096"), c("Fallen Oak", "0242520110"), c("Willow", "0242520900") ] },
  { name: "Genesis", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Nullarbor", "0979710012"), c("Fossil", "0979710090"), c("Facade", "0979710091"), c("Native Rock", "0979710092"), c("Agate", "0979710094"), c("Quarry", "0979710096"), c("Dark Cloud", "0979710097"), c("Caldera", "0979710098") ] },
  { name: "Phoenix", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Camelback", "0979810012"), c("Rio Vista", "0979810090"), c("Alhambra", "0979810091"), c("Foothills", "0979810092"), c("Maryvale", "0979810094"), c("Laveen", "0979810096"), c("Arcadia", "0979810097"), c("Estrella", "0979810098") ] },
  { name: "Scenic View", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Flannel Flower", "0246250011"), c("Cloud Haze", "0246250013"), c("Earth Dust", "0246250022"), c("Greenstone", "0246250036"), c("Freshwater", "0246250037"), c("Forest Floor", "0246250072"), c("Campfire Smoke", "0246250090"), c("Boulder", "0246250092"), c("Cliff Edge", "0246250111"), c("Fresh Breeze", "0246250112"), c("Wattle Tree", "0246250901"), c("Waterfalls", "0246250905"), c("Cool Air", "0246250914"), c("Shrublands", "0246250915"), c("Starry Night", "0246250925"), c("River Rapids", "0246250945") ] },
  { name: "Mountain Chalet", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Cloud Burst", "0245820001"), c("Chimney Haze", "0245820009"), c("Bavarian Cream", "0245820010"), c("Glacier Stand", "0245820011"), c("Pale Mushroom", "0245820013"), c("Fresh Breeze", "0245820030"), c("Deep Water", "0245820033"), c("Spring Meadow", "0245820071"), c("Valley Shadow", "0245820092"), c("Summit", "0245820093"), c("Cloud Cover", "0245820094"), c("Billy Goat", "0245820095"), c("Bilby", "0245820155"), c("Dew Drop", "0245820900"), c("Crushed Ice", "0245820913"), c("Grey Dawn", "0245820914"), c("Frosted Pine", "0245820915"), c("Smoke Whisp", "0245820916"), c("Silver Frost", "0245820917"), c("Alpine Grey", "0245820918") ] },
  { name: "Barossa", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Ivory", "0249220001"), c("Stormy Sea", "0249220003"), c("Midnight", "0249220009"), c("Sand", "0249220010"), c("Clay", "0249220011"), c("Shell", "0249220012"), c("Antelope", "0249220041"), c("Mercury", "0249220091"), c("Light Ash", "0249220092"), c("Pewter", "0249220093"), c("Lead", "0249220095"), c("Magma", "0249220096") ] },
  { name: "Coonawarra", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Cream", "0249320001"), c("Seachange", "0249320003"), c("Ebony", "0249320009"), c("Biscotti", "0249320010"), c("Cloud", "0249320011"), c("Sand", "0249320012"), c("Deer", "0249320041"), c("Vapour", "0249320091"), c("Smoke Haze", "0249320092"), c("Dolphin", "0249320093"), c("Metal", "0249320095"), c("Dark Storm", "0249320096") ] },
  { name: "Carpathian", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Danube", "0702610010"), c("Foothills", "0702610011"), c("Lynx", "0702610012"), c("Plateau", "0702610013"), c("Summit", "0702610014"), c("Alps", "0702610016"), c("Bison", "0702610042"), c("Forest", "0702610043"), c("Tatra", "0702610091"), c("Horizon", "0702610092"), c("Iron Gate", "0702610096") ] },
  { name: "Riverbed", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Cashew", "0424310010"), c("Wind Shear", "0424310011"), c("Waterspout", "0424310013"), c("Woodland", "0424310041"), c("Ash", "0424310090"), c("Mineral", "0424310091"), c("Dust Storm", "0424310092"), c("Volcanic", "0424310093") ] },
  { name: "Dawn Rise", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Sandy Day", "0225920010"), c("White Linen", "0225920011"), c("Pearl Ash", "0225920012"), c("Soft Nude", "0225920013"), c("Beige Glow", "0225920014"), c("Earth Tone", "0225920016"), c("Sunset Pink", "0225920021"), c("Sky Blue", "0225920031"), c("Blue Iris", "0225920035"), c("Ink Pot", "0225920036"), c("Basil", "0225920075"), c("Dawn Grey", "0225920091"), c("Wood Ash", "0225920092"), c("Dark Mineral", "0225920096"), c("Grey Mood", "0225920098"), c("Ebony", "0225920099") ] },
  { name: "Lasting Touch", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Tinker", "0243010004"), c("Pearl Ash", "0243010009"), c("Opal Glaze", "0243010011"), c("Heritage", "0243010012"), c("Fudge", "0243010041"), c("Columbia", "0243010044"), c("Chestnut", "0243010046"), c("Flagstone", "0243010091"), c("Miner", "0243010092"), c("Steel", "0243010093"), c("Domino", "0243010094"), c("Phantom", "0243010098") ] },
  { name: "Hepburn", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Aged Linen", "0381820100"), c("Light Clay", "0381820110"), c("Deer", "0381820130"), c("Thunder", "0381820900"), c("Stardust", "0381820910"), c("Silver Drop", "0381820925"), c("Stratus", "0381820955"), c("Ash Grey", "0381820960") ] },
  { name: "Nightfall", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("White Sand", "0225830001"), c("Snow White", "0225830009"), c("Calico", "0225830010"), c("Buff", "0225830012"), c("Scroll Beige", "0225830014"), c("Deep Ocean", "0225830034"), c("Pottery", "0225830072"), c("Crystalite", "0225830091"), c("Low Cloud", "0225830092"), c("Silver", "0225830093"), c("Grey Stone", "0225830094"), c("Grey Haze", "0225830095"), c("Forge", "0225830096"), c("Grey Cement", "0225830097"), c("Urban Grey", "0225830098"), c("Thunder", "0225830099") ] },
  { name: "Riverina", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Soft Sand", "0686520100"), c("Linen", "0686520110"), c("Suede", "0686520130"), c("Warm Grey", "0686520900"), c("Albatross", "0686520905"), c("Rainwashed", "0686520925"), c("Grey Metal", "0686520930"), c("Wombat", "0686520945"), c("Twilight", "0686520946"), c("Tarpaulin", "0686520960") ] },
  { name: "Infatuation", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Casa Blanca", "0225220001"), c("Pale Smoke", "0225220009"), c("Vanilla Cloud", "0225220010"), c("Sunkissed", "0225220012"), c("Puff Ball", "0225220013"), c("Stone Beige", "0225220014"), c("Aged Suede", "0225220016"), c("Blue Heather", "0225220031"), c("Wild Wind", "0225220035"), c("Emerald Sea", "0225220074"), c("Dugong", "0225220090"), c("Deep Fog", "0225220091"), c("Iced Slate", "0225220092"), c("Dusty Grey", "0225220093"), c("Grey Pebble", "0225220094"), c("Urban Grey", "0225220095"), c("Deep Fossil", "0225220096"), c("Volcanic Grey", "0225220097"), c("Dark Matter", "0225220099"), c("Grey Dawn", "0225220910"), c("Seattle Fog", "0225220912"), c("Crystal Grey", "0225220913"), c("Grey Shingle", "0225220914"), c("River Gum", "0225220915") ] },
  { name: "Endless Charm", category: "Wool Carpet", fibre: "Wool", brand: "Redbook", colours: [ c("Powder", "0242620001"), c("Mercury", "0242620009"), c("Sand Dune", "0242620011"), c("Linen", "0242620012"), c("Soft Suede", "0242620014"), c("Studio Stipple", "0242620015"), c("Leather", "0242620042"), c("Woodstock Stipple", "0242620046"), c("Temple Grey", "0242620091"), c("Overcast", "0242620094"), c("Parlor", "0242620095"), c("Storm Cloud", "0242620096"), c("Wallpaper", "0242620110"), c("Stained Glass", "0242620900") ] },
];

// Flattened, ready for the searchable picker.
export type CarpetSwatchItem = {
  colour: string;
  range: string;
  category: string;
  brand: string;
  brandLogo?: string;
  id: string;
  url: string;
};

export const CARPET_SWATCHES: CarpetSwatchItem[] = CARPET_RANGES.flatMap((r) => {
  const brand = r.brand ?? "Feltex";
  return r.colours.map((col) => ({
    colour: col.name,
    range: r.name,
    category: r.category,
    brand,
    brandLogo: CARPET_BRAND_LOGOS[brand],
    id: col.id,
    url: carpetSwatchUrl(col.id),
  }));
});
