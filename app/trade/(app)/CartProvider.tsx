"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { round3, roundUpToBox } from "../../../lib/boxQty";

// Client-only cart, persisted in localStorage. It holds ONLY the identity of what
// the customer wants (product + optional colour + quantity + a display snapshot);
// the authoritative pricing is always re-computed server-side by OnBase at submit,
// so we treat the stored unit price purely as an indicative label.
export type CartLine = {
  productId: string;
  /** Chosen colourway, if the item has colour options. */
  colour?: string;
  name: string;
  unit: string | null;
  /** Indicative unit price captured when added (server re-prices at submit). */
  unitPrice: number;
  image: string | null;
  quantity: number;
  /** "Sold in multiples of" - quantities snap to whole boxes of this. */
  boxQuantity?: number;
  /** A made-to-order build (e.g. a vanity): its option picks, priced by OnBase at submit. */
  options?: Record<string, string | string[]>;
  /** The build's spec lines, for display. */
  spec?: string[];
  /** Product page link that reopens this build. */
  href?: string;
};

/** What identifies a line: product + colour, or product + build. */
export type LineKey = Pick<CartLine, "productId" | "colour" | "options">;

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQty: (line: LineKey, quantity: number) => void;
  remove: (line: LineKey) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "ow_trade_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

// A build's picks as a stable string (key order doesn't matter).
const buildKey = (o: CartLine["options"]) =>
  o ? JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]])) : "";

// Match on product + colour (+ build) together, so the same product in two colours, or two
// different builds of one vanity, are separate lines.
const sameLine = (a: LineKey, b: LineKey) =>
  a.productId === b.productId && (a.colour ?? "") === (b.colour ?? "") && buildKey(a.options) === buildKey(b.options);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed.filter((l) => l && l.productId && l.quantity > 0));
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  // Persist on change (after the initial load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota errors
    }
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity: number) => {
    // Snap to a whole box (m²/sheets can be fractional, so no integer rounding).
    const qty = roundUpToBox(quantity, line.boxQuantity);
    setLines((prev) => {
      const i = prev.findIndex((l) => sameLine(l, line));
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], ...line, quantity: round3(next[i].quantity + qty) };
        return next;
      }
      return [...prev, { ...line, quantity: qty }];
    });
  }, []);

  const setQty = useCallback((line: LineKey, quantity: number) => {
    const qty = Math.max(0, round3(quantity));
    setLines((prev) =>
      qty === 0
        ? prev.filter((l) => !sameLine(l, line))
        : prev.map((l) => (sameLine(l, line) ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const remove = useCallback((line: LineKey) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, line)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  // Number of distinct line items (quantities can be fractional m²/LM, so the
  // badge counts items, not summed units).
  const count = useMemo(() => lines.length, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ lines, count, add, setQty, remove, clear, ready }),
    [lines, count, add, setQty, remove, clear, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
