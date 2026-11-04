"use client";

import { useSyncExternalStore } from "react";
import type { OptionSelection } from "./options";

// Browser-only "quote list" (the cart for "Send me a quote"). Lives in localStorage
// like the wishlist - no account needed. Prices are ESTIMATES (GST-incl, as shown on
// the site); OnBase re-prices every line server-side when the request is sent.

export type QuoteItem = {
  id: string; // line id (a vanity build is its own line; a tile colour merges)
  kind: "standard" | "options";
  href: string; // back to the product (with the build for options products)
  name: string;
  colour?: string | null;
  image?: string | null;
  rangeId: string; // feed range id (prod_ / rng_) - OnBase resolves the product from it + colour
  unit: string;
  boxQuantity: number;
  coverageM2: number | null;
  unitPrice: number | null; // estimate, GST incl, per sold unit (null = price on request)
  quantity: number; // sold units (box-rounded for standard lines)
  areaM2?: number | null; // what the customer measured (standard lines)
  wastePct?: number | null;
  options?: OptionSelection | null; // options products: the chosen build
  spec?: string[];
};

const KEY = "ow_quote_v1";
type Listener = () => void;
const listeners = new Set<Listener>();
let cache: QuoteItem[] | null = null;

function read(): QuoteItem[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as QuoteItem[]).filter((x) => x && typeof x.id === "string" && typeof x.rangeId === "string") : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: QuoteItem[]) {
  cache = items;
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode / quota */ }
  listeners.forEach((l) => l());
}

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Add a line. A tile/colour already in the list just gets the extra quantity. */
export function addQuote(item: Omit<QuoteItem, "id">): void {
  const items = read();
  if (item.kind === "standard") {
    const i = items.findIndex((x) => x.kind === "standard" && x.rangeId === item.rangeId && (x.colour ?? "") === (item.colour ?? ""));
    if (i >= 0) {
      const next = [...items];
      next[i] = { ...next[i], quantity: Math.round((next[i].quantity + item.quantity) * 1000) / 1000, areaM2: null, wastePct: null };
      write(next);
      return;
    }
  }
  write([...items, { ...item, id: newId() }]);
}
export function updateQuote(id: string, patch: Partial<QuoteItem>): void { write(read().map((x) => (x.id === id ? { ...x, ...patch } : x))); }
export function removeQuote(id: string): void { write(read().filter((x) => x.id !== id)); }
export function clearQuote(): void { write([]); }

function subscribe(l: Listener) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

const emptySnap: QuoteItem[] = [];
export function useQuoteCart(): QuoteItem[] {
  return useSyncExternalStore(subscribe, read, () => emptySnap);
}
