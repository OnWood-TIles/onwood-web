// Site-wide feature flags.
//
// SPECIALS_ENABLED — master switch for ALL "specials" surfaces (the /specials page,
// the homepage teaser, the nav link, sitemap entry, and every feed-driven SPECIAL
// badge/price on the shop + product pages). Turned OFF pre-opening so no "special"
// is advertised that nobody can actually buy yet. Flip back to `true` to restore
// everything exactly as it was — nothing was deleted. See project_onwood_specials
// in memory for the full list of what this gates.
export const SPECIALS_ENABLED = false;


// LATICRETE_ENABLED: master switch for the LATICRETE pages. LATICRETE declined to open an account
// (2026-11-19), so the products were hidden in OnBase (onbase scripts/laticrete/hide-from-website.ts,
// --restore puts them back) and these pages redirect: the adhesive & grout guide, the grout and
// adhesive calculators and /shop/adhesives (Tiling Supplies). Links to them drop out of the footer,
// sitemap, search and the clip & spacer calculator. Flip to `true` once a supplier is back.
export const LATICRETE_ENABLED = false;
export const LATICRETE_PATHS = ["/adhesive-and-grout-guide", "/grout-calculator", "/adhesive-calculator", "/shop/adhesives"];
/** False for a link to a LATICRETE page while LATICRETE_ENABLED is off. */
export const laticreteLinkOk = (href: string) => LATICRETE_ENABLED || !LATICRETE_PATHS.some((p) => href === p || href.startsWith(`${p}?`));
