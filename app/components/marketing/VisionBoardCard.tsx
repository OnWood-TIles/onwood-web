import type { HeroBoard } from "../../../lib/heroBoards";

// A single mood-board card: AI room render (supporting) + overlapping product
// swatches, with the porcelain TILE as the hero (biggest, centred, front, never
// overlapped). Purely visual - NO labels. Percentage layout so it scales fluidly.

function Swatch({
  src, left, top, w, rot = 0, z, circle = false, hero = false,
}: {
  src: string; left: string; top: string; w: string; rot?: number; z: number; circle?: boolean; hero?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute", left, top, width: w, aspectRatio: "1 / 1",
        transform: `rotate(${rot}deg)`, zIndex: z,
        borderRadius: circle ? "50%" : hero ? "10%" : "14%",
        boxShadow: hero
          ? "0 26px 54px -10px rgba(32,48,58,.46)"
          : "0 15px 32px -8px rgba(32,48,58,.30)",
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", display: "block" }} />
    </div>
  );
}

function Paint({ color, left, top, w, rot, z }: { color: string; left: string; top: string; w: string; rot: number; z: number }) {
  return (
    <div
      style={{
        position: "absolute", left, top, width: w, aspectRatio: "1 / 1",
        transform: `rotate(${rot}deg)`, zIndex: z, borderRadius: "14%",
        background: color, boxShadow: "0 15px 32px -8px rgba(32,48,58,.28)",
      }}
    />
  );
}

export default function VisionBoardCard({ board }: { board: HeroBoard }) {
  return (
    <div
      style={{
        position: "relative", width: "100%", aspectRatio: "490 / 648",
        background: "#F6F5F0", borderRadius: "30px",
        boxShadow: "0 46px 100px -30px rgba(32,48,58,.42), 0 8px 24px rgba(32,48,58,.10)",
      }}
    >
      {/* AI room render - supporting element, deliberately smaller than the tile */}
      <img
        src={board.render}
        alt=""
        style={{
          position: "absolute", left: "5.7%", top: "4.3%", width: "64.5%", aspectRatio: "316 / 224",
          objectFit: "cover", borderRadius: "18px", display: "block",
          boxShadow: "0 18px 38px -12px rgba(32,48,58,.26)",
        }}
      />
      <Swatch src={board.featureTile} left="72.7%" top="6.2%" w="24.9%" rot={6} z={4} />
      <Swatch src={board.timber} left="73.5%" top="24.7%" w="24.5%" rot={-5} z={4} />
      <Swatch src={board.floor} left="6.1%" top="62.7%" w="26.5%" rot={-9} z={5} />
      <Swatch src={board.stone} left="72.2%" top="61.4%" w="26.5%" rot={7} z={5} />
      <Paint color={board.paints[0]} left="16.3%" top="79%" w="18.8%" rot={-4} z={6} />
      <Paint color={board.paints[1]} left="65.7%" top="80.2%" w="16.7%" rot={5} z={6} />
      <Swatch src={board.metal} left="42.9%" top="79%" w="15.9%" rot={0} z={7} circle />
      {/* HERO porcelain tile */}
      <Swatch src={board.tile} left="29%" top="45.7%" w="47.3%" rot={0} z={9} hero />
      {/* greenery cut-out, spilling off the left edge */}
      <img
        src={board.greenery}
        alt=""
        style={{
          position: "absolute", left: "-6.5%", top: "35.8%", height: "39.8%", width: "auto", zIndex: 10,
          filter: "drop-shadow(0 20px 26px rgba(32,48,58,.30))",
        }}
      />
    </div>
  );
}
