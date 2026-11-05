"use client";
// Loads the 3D builder (and three.js) only on the 3D page, in the browser.
import dynamic from "next/dynamic";
import type { WebsiteRange } from "../../../../lib/onbase/client";

const Vanity3D = dynamic(() => import("./Vanity3D"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: "#5d6766", background: "#e9e5de" }}>Loading the 3D view…</div>,
});

export default function Vanity3DLoader(props: { range: WebsiteRange; query: Record<string, string>; backHref: string }) {
  return <Vanity3D {...props} />;
}

/** "Build it in 3D" on a vanity's product page: carries the current build (the 2D builder
 *  keeps it in the URL) over to the 3D page. */
export function Open3DButton({ slug, className }: { slug: string; className?: string }) {
  return (
    <a href={`/product/${slug}/3d`} className={className}
      onClick={(e) => { e.preventDefault(); window.location.href = `/product/${slug}/3d${window.location.search}`; }}>
      Build it in 3D
    </a>
  );
}
