"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQty: (productId: string, colour: string | undefined, quantity: number) => void;
  remove: (productId: string, colour: string | undefined) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "ow_trade_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

// Match on product + colour together, so the same product in two colours is two lines.
const sameLine = (a: { productId: string; colour?: string }, b: { productId: string; colour?: string }) =>
  a.productId === b.productId && (a.colour ?? "") === (b.colour ?? "");

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
    const qty = Math.max(1, Math.round(quantity));
    setLines((prev) => {
      const i = prev.findIndex((l) => sameLine(l, line));
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], ...line, quantity: next[i].quantity + qty };
        return next;
      }
      return [...prev, { ...line, quantity: qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, colour: string | undefined, quantity: number) => {
    const qty = Math.max(0, Math.round(quantity));
    setLines((prev) =>
      qty === 0
        ? prev.filter((l) => !sameLine(l, { productId, colour }))
        : prev.map((l) => (sameLine(l, { productId, colour }) ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const remove = useCallback((productId: string, colour: string | undefined) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, { productId, colour })));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);

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
