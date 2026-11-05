"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// The trade partner's sample request (free single-tile samples for their own showroom),
// kept apart from the order cart and persisted in localStorage. It holds only what was
// picked; OnBase checks each sample is still available when the request is sent.
export type SampleLine = {
  productId: string;
  /** The colour picked (sent as-is; OnBase matches it to the product's colours). */
  colour: string;
  name: string;
  image: string | null;
  /** Product page link. */
  href: string;
};

export const MAX_SAMPLES = 40;

type SamplesContextValue = {
  samples: SampleLine[];
  count: number;
  has: (productId: string, colour: string) => boolean;
  toggle: (line: SampleLine) => void;
  add: (line: SampleLine) => void;
  remove: (productId: string, colour: string) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "ow_trade_samples_v1";
const SamplesContext = createContext<SamplesContextValue | null>(null);
const same = (a: { productId: string; colour: string }, productId: string, colour: string) => a.productId === productId && a.colour === colour;

export function SamplesProvider({ children }: { children: React.ReactNode }) {
  const [samples, setSamples] = useState<SampleLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SampleLine[];
      if (Array.isArray(parsed)) setSamples(parsed.filter((s) => s && s.productId && typeof s.colour === "string"));
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    } catch {
      // ignore quota errors
    }
  }, [samples, ready]);

  const has = useCallback((productId: string, colour: string) => samples.some((s) => same(s, productId, colour)), [samples]);
  const add = useCallback((line: SampleLine) => {
    setSamples((prev) => (prev.some((s) => same(s, line.productId, line.colour)) || prev.length >= MAX_SAMPLES ? prev : [...prev, line]));
  }, []);
  const remove = useCallback((productId: string, colour: string) => {
    setSamples((prev) => prev.filter((s) => !same(s, productId, colour)));
  }, []);
  const toggle = useCallback((line: SampleLine) => {
    setSamples((prev) =>
      prev.some((s) => same(s, line.productId, line.colour))
        ? prev.filter((s) => !same(s, line.productId, line.colour))
        : prev.length >= MAX_SAMPLES ? prev : [...prev, line],
    );
  }, []);
  const clear = useCallback(() => setSamples([]), []);

  const value = useMemo<SamplesContextValue>(
    () => ({ samples, count: samples.length, has, toggle, add, remove, clear, ready }),
    [samples, has, toggle, add, remove, clear, ready],
  );
  return <SamplesContext.Provider value={value}>{children}</SamplesContext.Provider>;
}

export function useSamples(): SamplesContextValue {
  const ctx = useContext(SamplesContext);
  if (!ctx) throw new Error("useSamples must be used within a SamplesProvider");
  return ctx;
}
