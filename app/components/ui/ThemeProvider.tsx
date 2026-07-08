"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const THEMES = ["terracotta", "santorini", "olive"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  terracotta: "Terracotta",
  santorini: "Santorini",
  olive: "Olive Grove",
};

const STORAGE_KEY = "onwood-theme";

type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void };
const Ctx = createContext<ThemeCtx | null>(null);

// Inline script (runs before paint) to apply the saved theme with no flash.
// Injected in the root layout <head>.
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("terracotta");

  // Sync from whatever the no-flash script already applied.
  useEffect(() => {
    const current = document.documentElement.getAttribute(
      "data-theme",
    ) as Theme | null;
    if (current && THEMES.includes(current)) setThemeState(current);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore (private mode)
    }
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
