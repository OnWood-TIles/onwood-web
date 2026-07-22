"use client";

import { useState } from "react";
import type { NavItem, NavChild, WebsiteDepartment } from "../../lib/onbase/client";

// The nav designer: a list of top-level items (link or popup), each popup
// holding children picked from the OnBase taxonomy (departments/categories)
// or typed as custom links. Saves the whole design in one go.

const box: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 16,
  background: "#fff",
  padding: 18,
};
const input: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "inherit",
  background: "#fff",
  outline: "none",
};
const smallBtn: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 9,
  background: "#fff",
  padding: "6px 10px",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  color: "inherit",
};

export default function NavDesigner({ initialItems, taxonomy }: { initialItems: NavItem[]; taxonomy: WebsiteDepartment[] }) {
  const [items, setItems] = useState<NavItem[]>(
    initialItems.length
      ? initialItems
      : [
          { label: "Shop", href: "/shop", children: taxonomy.slice(0, 8).map((d) => ({ label: d.label, href: `/shop/${d.slug}` })) },
          { label: "On Trend", href: "/#featured" },
          { label: "Visualiser", href: "/#visualize" },
          { label: "Showroom", href: "/#showroom" },
          { label: "Why OnWood", href: "/why" },
          { label: "Contact", href: "/contact" },
          { label: "Specials", href: "/specials" },
        ],
  );
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const update = (i: number, patch: Partial<NavItem>) =>
    setItems((a) => a.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) =>
    setItems((a) => {
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      const next = [...a];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function save() {
    setSaving(true);
    setNote(null);
    try {
      const r = await fetch("/api/admin/nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) {
        setNote(d?.error || "Could not save - try again");
      } else {
        setItems(Array.isArray(d?.items) ? d.items : items);
        setNote("Saved - the menu is live. Refresh any page to see it.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((item, i) => (
        <div key={i} style={box}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button type="button" style={{ ...smallBtn, padding: "2px 8px", opacity: i === 0 ? 0.35 : 1 }} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">▲</button>
              <button type="button" style={{ ...smallBtn, padding: "2px 8px", opacity: i === items.length - 1 ? 0.35 : 1 }} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">▼</button>
            </div>
            <input
              style={{ ...input, width: 170, fontWeight: 700 }}
              value={item.label}
              placeholder="Menu label"
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <input
              style={{ ...input, flex: 1, minWidth: 200 }}
              value={item.href ?? ""}
              placeholder="Link (e.g. /shop or /#contact) - optional for popups"
              onChange={(e) => update(i, { href: e.target.value || undefined })}
            />
            <button
              type="button"
              style={smallBtn}
              onClick={() => update(i, { children: item.children?.length ? undefined : [] })}
              title="A popup opens a dropdown of entries under this item"
            >
              {item.children ? "Remove popup" : "Add popup"}
            </button>
            <button type="button" style={{ ...smallBtn, color: "#b3402a" }} onClick={() => setItems((a) => a.filter((_, j) => j !== i))}>
              Delete
            </button>
          </div>

          {item.children && (
            <PopupEditor
              taxonomy={taxonomy}
              children={item.children}
              onChange={(children) => update(i, { children })}
            />
          )}
        </div>
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <button type="button" style={smallBtn} onClick={() => setItems((a) => [...a, { label: "New item", href: "/" }])}>
          + Add menu item
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            border: "none",
            borderRadius: 100,
            background: "var(--ink)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "11px 26px",
            cursor: "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save menu"}
        </button>
        {note && <span style={{ fontSize: 13.5, fontWeight: 600, color: note.startsWith("Saved") ? "#1f7a54" : "#b3402a" }}>{note}</span>}
      </div>
    </div>
  );
}

function PopupEditor({
  taxonomy,
  children,
  onChange,
}: {
  taxonomy: WebsiteDepartment[];
  children: NavChild[];
  onChange: (c: NavChild[]) => void;
}) {
  const [pick, setPick] = useState("");

  // Quick-picks from the OnBase taxonomy: departments + their categories.
  const options: { key: string; label: string; href: string }[] = [];
  for (const d of taxonomy) {
    options.push({ key: `d:${d.slug}`, label: d.label, href: `/shop/${d.slug}` });
    for (const c of d.categories) {
      options.push({ key: `c:${d.slug}:${c.slug}`, label: `${d.label} - ${c.label}`, href: `/shop/${d.slug}?c=${c.slug}` });
    }
  }

  const addPick = (key: string) => {
    const opt = options.find((o) => o.key === key);
    if (!opt) return;
    onChange([...children, { label: opt.label.includes(" - ") ? opt.label.split(" - ")[1] : opt.label, href: opt.href }]);
    setPick("");
  };

  const edit = (i: number, patch: Partial<NavChild>) =>
    onChange(children.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= children.length) return;
    const next = [...children];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line)", display: "grid", gap: 8 }}>
      <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#8a8577" }}>
        Popup entries
      </p>
      {children.map((c, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingLeft: 6 }}>
          <div style={{ display: "flex", gap: 3 }}>
            <button type="button" style={{ ...smallBtn, padding: "2px 7px", opacity: i === 0 ? 0.35 : 1 }} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">▲</button>
            <button type="button" style={{ ...smallBtn, padding: "2px 7px", opacity: i === children.length - 1 ? 0.35 : 1 }} disabled={i === children.length - 1} onClick={() => move(i, 1)} aria-label="Move down">▼</button>
          </div>
          <input style={{ ...input, width: 160, padding: "7px 10px", fontSize: 13.5 }} value={c.label} onChange={(e) => edit(i, { label: e.target.value })} />
          <input style={{ ...input, flex: 1, minWidth: 180, padding: "7px 10px", fontSize: 13.5 }} value={c.href} onChange={(e) => edit(i, { href: e.target.value })} />
          <button type="button" style={{ ...smallBtn, color: "#b3402a", padding: "5px 9px" }} onClick={() => onChange(children.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingLeft: 6 }}>
        <select style={{ ...input, padding: "7px 10px", fontSize: 13.5, maxWidth: 320 }} value={pick} onChange={(e) => addPick(e.target.value)}>
          <option value="">+ Add from your shop (departments &amp; categories)…</option>
          {options.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
        <button type="button" style={smallBtn} onClick={() => onChange([...children, { label: "New entry", href: "/" }])}>
          + Custom link
        </button>
      </div>
    </div>
  );
}
