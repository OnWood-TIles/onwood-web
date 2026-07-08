"use client";

import { THEMES, THEME_LABELS, useTheme } from "./ThemeProvider";

// Small three-way theme switcher. Swatch dots + label; keyboard accessible.
const SWATCH: Record<string, string> = {
  terracotta: "#d06a45",
  santorini: "#1e7a8c",
  olive: "#6f7d3f",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
    >
      {THEMES.map((t) => {
        const active = t === theme;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={active}
            aria-label={THEME_LABELS[t]}
            title={THEME_LABELS[t]}
            onClick={() => setTheme(t)}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: SWATCH[t],
              border: active
                ? "2px solid var(--color-ink)"
                : "2px solid transparent",
              boxShadow: active ? "0 0 0 2px var(--color-bg)" : "none",
              cursor: "pointer",
              padding: 0,
              transition: "transform .15s ease",
              transform: active ? "scale(1.08)" : "scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
