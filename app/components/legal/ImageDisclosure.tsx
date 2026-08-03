import Link from "next/link";

// Visible imagery disclosure shown adjacent to product and inspiration images.
// Many images on the site are AI-generated or digitally rendered, and even real
// photographs shift by screen and batch - so every product/inspiration image
// carries a notice. Links to the imagery disclosure (section 4 of the Website
// Terms of Use). Kept in the body font, >=12px, >=4.5:1 contrast, always visible
// (never hover-only), per our imagery policy.
//
// variant:
//   "full"   - one-sentence caption for product detail, single images, lightbox
//   "grid"   - compact one-liner for tight product grids / cards
//   "medium" - the "About our images" paragraph for product detail pages
export default function ImageDisclosure({
  variant = "full",
  style,
}: {
  variant?: "full" | "grid" | "medium";
  style?: React.CSSProperties;
}) {
  if (variant === "medium") {
    return (
      <div
        style={{
          margin: "18px 0 0",
          padding: "14px 16px",
          borderRadius: 12,
          background: "var(--surface, #f6f1ea)",
          border: "1px solid var(--line, #e6ded3)",
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "#4a5560",
          ...style,
        }}
      >
        <strong style={{ color: "var(--ink, #22303a)" }}>About our images.</strong> Some images on this
        page are AI-generated or digitally rendered to show how a product may look installed. They are
        illustrations, not photographs of the actual product. Colour, tone, veining, tile size, scale,
        layout, grout colour and joint width can differ noticeably from the real thing. Tiles, natural
        stone and stone veneer also vary naturally between batches. Please confirm your selection from a
        current physical sample -{" "}
        <Link href="/terms-of-use#ai-imagery" style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>
          read our full imagery disclosure
        </Link>
        .
      </div>
    );
  }

  const base: React.CSSProperties = {
    margin: "6px 0 0",
    fontSize: 12,
    lineHeight: 1.4,
    color: "#5a6067",
    ...style,
  };

  if (variant === "grid") {
    return (
      <p style={base}>
        Illustration - colour &amp; scale vary.{" "}
        <Link href="/terms-of-use#ai-imagery" style={{ color: "inherit", textDecoration: "underline" }}>
          Why?
        </Link>
      </p>
    );
  }

  return (
    <p style={{ ...base, fontSize: 12.5 }}>
      Some images are AI-generated or rendered. Actual colour, scale and finish vary - always confirm from a physical sample.{" "}
      <Link href="/terms-of-use#ai-imagery" style={{ color: "inherit", textDecoration: "underline" }}>
        See our imagery disclosure
      </Link>
      .
    </p>
  );
}
