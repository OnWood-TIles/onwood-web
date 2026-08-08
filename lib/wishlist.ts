"use client";

import { useSyncExternalStore } from "react";

// Browser-only wishlist ("save your selections"). No account needed - favourites
// live in localStorage so anyone can save instantly (save-first); the email
// capture on /saved is optional. Identity is the product href, so the same tile
// saved from the gallery, the shop grid or a product page is one entry.

export type WishItem = { href: string; name: string; colour?: string; image?: string };

const KEY = "ow_wishlist_v1";
type Listener = () => void;
const listeners = new Set<Listener>();
let cache: WishItem[] | null = null;

function read(): WishItem[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as WishItem[]).filter((x) => x && typeof x.href === "string") : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: WishItem[]) {
  cache = items;
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode / quota */ }
  listeners.forEach((l) => l());
}

export function toggleWish(item: WishItem) {
  const items = read();
  write(items.some((x) => x.href === item.href) ? items.filter((x) => x.href !== item.href) : [{ ...item }, ...items]);
}
export function removeWish(href: string) { write(read().filter((x) => x.href !== href)); }
export function clearWish() { write([]); }

function subscribe(l: Listener) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

const emptySnap: WishItem[] = [];
export function useWishlist(): WishItem[] {
  return useSyncExternalStore(subscribe, read, () => emptySnap);
}
export function useWishHas(href: string): boolean {
  return useWishlist().some((x) => x.href === href);
}
