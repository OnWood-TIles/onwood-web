// What a product's variations are called on the storefront: colours by default, or the name OnBase gives
// sizes or packs (B.A.T levelling clips "Joint width", wedges "Pack size") - Reagan 2026-11-16, when those
// became one product with variations like the trims. one = "Joint width", many = "joint widths".
export function choiceNoun(label: string | null | undefined, fallback = "Colour") {
  const one = (label || fallback).trim();
  const low = one.toLowerCase();
  const many = /(s|x|ch|sh)$/.test(low) ? `${low}es` : `${low}s`;
  return { one, many, Many: many.charAt(0).toUpperCase() + many.slice(1), isColour: /^colou?r$/i.test(one) };
}
