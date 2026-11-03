// Site-wide feature flags.
//
// SPECIALS_ENABLED — master switch for ALL "specials" surfaces (the /specials page,
// the homepage teaser, the nav link, sitemap entry, and every feed-driven SPECIAL
// badge/price on the shop + product pages). Turned OFF pre-opening so no "special"
// is advertised that nobody can actually buy yet. Flip back to `true` to restore
// everything exactly as it was — nothing was deleted. See project_onwood_specials
// in memory for the full list of what this gates.
export const SPECIALS_ENABLED = false;

// VANITY_BUILDER_PUBLIC — the Marquis vanity price builder (/vanities/build). While
// false it is staff-only (sign in at /staff) and fetches unpublished models in preview,
// so it can be checked before launch. Flip to `true` at launch (and publish the
// Marquis products / ranges in OnBase).
export const VANITY_BUILDER_PUBLIC = false;
