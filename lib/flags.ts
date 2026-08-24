// Site-wide feature flags.
//
// SPECIALS_ENABLED — master switch for ALL "specials" surfaces (the /specials page,
// the homepage teaser, the nav link, sitemap entry, and every feed-driven SPECIAL
// badge/price on the shop + product pages). Turned OFF pre-opening so no "special"
// is advertised that nobody can actually buy yet. Flip back to `true` to restore
// everything exactly as it was — nothing was deleted. See project_onwood_specials
// in memory for the full list of what this gates.
export const SPECIALS_ENABLED = false;
