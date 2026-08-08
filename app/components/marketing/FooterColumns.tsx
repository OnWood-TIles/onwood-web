"use client";

import { useState } from "react";
import Link from "next/link";
import { FOOTER_COLUMNS } from "../../../lib/content";

// The footer directory columns (Shop / Explore / Help). On desktop they show in
// full; on mobile each becomes a tappable accordion so the footer stays short.
export default function FooterColumns() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {FOOTER_COLUMNS.map((col) => {
        const isOpen = open === col.title;
        return (
          <div key={col.title} className="fc-col">
            <button type="button" className="fc-header" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : col.title)}>
              {col.title}
              <svg className="fc-chevron" viewBox="0 0 12 8" width="13" height="9" aria-hidden="true">
                <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ul className={`fc-links ${isOpen ? "open" : ""}`}>
              {col.links.map((l) => (
                <li key={`${col.title}-${l.label}`}>
                  <Link href={l.href} className="owf-link fc-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <style>{`
        .fc-header{display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;background:none;border:none;padding:0;margin:0 0 16px;cursor:default;font-family:var(--font-archivo);font-weight:800;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);}
        .fc-chevron{display:none;color:var(--muted);flex:none;}
        .fc-links{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;}
        .fc-link{color:var(--muted);font-size:14px;text-decoration:none;line-height:1.25;}
        @media(max-width:640px){
          .fc-col{border-top:1px solid var(--line);}
          .fc-header{margin:0;padding:16px 2px;cursor:pointer;}
          .fc-chevron{display:inline-block;transition:transform .25s ease;}
          .fc-header[aria-expanded="true"] .fc-chevron{transform:rotate(180deg);}
          .fc-links{display:none;padding:0 2px 16px;}
          .fc-links.open{display:flex;}
          .fc-link{padding:4px 0;}
        }
      `}</style>
    </>
  );
}
