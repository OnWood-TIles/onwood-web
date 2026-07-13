// Curated hero vision boards. Each board = a pre-generated AI room render (mood-
// matched to the samples via the site's own imagine pipeline) + the real product
// swatches it was built from. A porcelain TILE is always the hero of the card.
// Swatch images: tiles + floors hotlink from supplier CDNs (same as the Vision
// Board tool); stone/timber/metal/greenery are self-hosted; paints are hex chips.
export type HeroBoard = {
  id: string;
  render: string;      // pre-generated AI room (public/images/hero-boards)
  tile: string;        // HERO porcelain tile
  featureTile: string; // secondary feature/accent tile
  floor: string;
  stone: string;       // benchtop
  timber: string;      // cabinetry
  metal: string;
  greenery: string;    // styling cut-out (Floral)
  paints: [string, string];
};

const QS = "https://cdn3.quick-step.com/-/media/imported%20assets/flooring";
const GT = "https://cdn.shopify.com/s/files/1/0626/3370/5561/files";

export const HERO_BOARDS: HeroBoard[] = [
  {
    id: "coastal-hamptons",
    render: "/images/hero-boards/coastal-hamptons.jpg",
    tile: `${GT}/BiancoCarraraIn_Out600x600.jpg?width=600`,
    featureTile: `${GT}/pggr3051.webp?width=600`,
    floor: `${QS}/6/8/0/im1848topshotjpg256677/square%20lr.ashx?rev=c55cd6281b7a436f92a814bdeefb36a5&mw=414&hash=AB2E15CC499ED0778627C7410B87B554`,
    stone: "/images/stone/5131.webp?v=2",
    timber: "/images/timber/AU1007480.webp",
    metal: "/images/metals/abi/brushed-brass.webp",
    greenery: "/images/styling/floral-olive-tree.webp",
    paints: ["#EFE9DB", "#C8C5BB"],
  },
  {
    id: "industrial-luxe",
    render: "/images/hero-boards/industrial-luxe.jpg",
    tile: `${GT}/LavidaDarkGreyMatt600x600.jpg?width=600`,
    featureTile: `${GT}/MilleGloss75x225Black.jpg?width=600`,
    floor: `${QS}/5/6/7/pen4752topshotjpg257681/square%20lr.ashx?rev=d9ab5280d31548a19d64d46365a99ce7&mw=414&hash=5A5DD2FA3A1BB68A371F7F73DC83235C`,
    stone: "/images/stone/4004.webp?v=2",
    timber: "/images/timber/AU1004571.webp",
    metal: "/images/metals/abi/matte-black.webp",
    greenery: "/images/styling/floral-native-berry-eucalypt-bunch.webp",
    paints: ["#A19D91", "#B6B3AA"],
  },
  {
    id: "japandi-calm",
    render: "/images/hero-boards/japandi-calm.jpg",
    tile: `${GT}/Limestone2.0CottonMatt600x600.jpg?width=600`,
    featureTile: `${GT}/MaestroSand.jpg?width=600`,
    floor: `${QS}/c/6/d/pen4763topshotjpg255026/square%20lr.ashx?rev=8e177600ff4e4480bbfac3396ac0933e&mw=414&hash=82E7F8D6AD3D9C7AF3A9E17F6E88E7F3`,
    stone: "/images/stone/4600.webp?v=2",
    timber: "/images/timber/AU1004667.webp",
    metal: "/images/metals/abi/brushed-nickel.webp",
    greenery: "/images/styling/floral-potted-orchid.webp",
    paints: ["#E4DDC8", "#CFC4A6"],
  },
  {
    id: "contemporary-mono",
    render: "/images/hero-boards/contemporary-mono.jpg",
    tile: `${GT}/RomanticCarraraMatt600x1200.jpg?width=600`,
    featureTile: `${GT}/KitKatWhiteMatt22x145.jpg?width=600`,
    floor: `${QS}/4/1/1/pen4765topshotjpg244481/square%20lr.ashx?rev=d9d7ebf58ec2450289481f04cc5c956e&mw=414&hash=61464627141212765CA56BDD82E3FE22`,
    stone: "/images/stone/3100.webp?v=2",
    timber: "/images/timber/AU1004708.webp",
    metal: "/images/metals/abi/brushed-gunmetal.webp",
    greenery: "/images/styling/floral-protea-eucalypt-potted-flower-l.webp",
    paints: ["#EDEFEE", "#B6B3AA"],
  },
  {
    id: "mediterranean-warm",
    render: "/images/hero-boards/mediterranean-warm.jpg",
    tile: `${GT}/Travertine3DCross-cutCrossCutWarmIn_Out600x600_4464205c-d2d9-407a-bb81-e12e94a4d1e3.jpg?width=600`,
    featureTile: `${GT}/MS20563-MINI-ARCH-ROME-CHIP-SIZE-48x60x7MM-SHEET-SIZE-306X298.jpg?width=600`,
    floor: `${QS}/f/0/c/imd8244topshotjpg281039/square%20lr.ashx?rev=87a5953b68724b61b3a015465c938f0a&mw=414&hash=98CA2446F8D602028C3C8DAC692D1542`,
    stone: "/images/stone/8251.webp?v=2",
    timber: "/images/timber/AU1006823.webp",
    metal: "/images/metals/abi/tumbled-aged-brass.webp",
    greenery: "/images/styling/floral-lemon-stem.webp",
    paints: ["#E6DECC", "#D9D0B8"],
  },
  {
    id: "scandi-green",
    render: "/images/hero-boards/scandi-green.jpg",
    tile: `${GT}/4_536a24e9-6ba0-4136-9eea-5b16ab9e7e77.webp?width=600`,
    featureTile: `${GT}/HamptonHandmadewhitematt76x302x8.jpg?width=600`,
    floor: `${QS}/6/2/7/pen4753topshotjpg243507/square%20lr.ashx?rev=f9271a19258743b5b72f571085425696&mw=414&hash=0A60310C906ADD2C495AF2C30EBAAB44`,
    stone: "/images/stone/2141.webp?v=2",
    timber: "/images/timber/AU1003791.webp",
    metal: "/images/metals/abi/brushed-brass.webp",
    greenery: "/images/styling/floral-potted-hydrangea-flower.webp",
    paints: ["#F2F4F3", "#C8C5BB"],
  },
];
