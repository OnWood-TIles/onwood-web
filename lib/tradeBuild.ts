// Trade Partner pricing for made-to-order builds (e.g. Marquis vanities) inside the
// trade portal. The shared builders (2D OptionsBuilder, 3D Vanity3D) price in RRP
// INCLUDING GST; a trade partner sees their price EX GST: the RRP less their
// "Discount off RRP" percent. Display only - OnBase re-prices every build at submit.

export type TradeBuild = {
  /** The OnBase product the build orders. */
  productId: string;
  /** Their % off RRP; null = no vanity pricing on their account (browse only). */
  pct: number | null;
  /** Trade product page base, e.g. /trade/catalogue/product */
  base: string;
};

/** RRP inc GST -> RRP ex GST. */
export const rrpEx = (incGst: number) => Math.round((incGst / 1.1) * 100) / 100;

/** RRP inc GST -> their price ex GST (RRP less their %). */
export const tradeEx = (incGst: number, pct: number | null) =>
  Math.round((incGst / 1.1) * (1 - Math.min(100, Math.max(0, pct ?? 0)) / 100) * 100) / 100;

export const money2 = (n: number) =>
  `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
