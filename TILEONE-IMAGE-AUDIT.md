# Tile One - Image-vs-Name Audit (2026-08-05)

Objective check for the "right tile on the wrong colour name" bug class (the thing that
bit us on **Alabastro/Dominique**, where faces were rotated onto the wrong colours).

**Method (read-only):** for every visible variation, load the published face, sample the
central 40% (inside the white-border tile, ignoring the margin), average to one RGB, then
per product check for (1) the same file on two different colours, (2) two different colours
whose faces are near-identical, and (3) a warmth/luminance outlier that contradicts the
literal colour word (a "grey" that's actually the warmest, a "white" darker than a "nero").

Script: `onbase/scripts/audit-tileone-images.ts` (re-runnable). Full data:
`onbase/scripts/_tileone-image-audit.json`. Scanned **345 faces / 66 products**.

---

## Headline: no Alabastro-style swaps anywhere ✅
**Zero** warmth-vs-name or luminance-inversion hits across the whole catalogue. The thing we
worried about after Alabastro - another range with faces rotated onto the wrong colour names
(a warm tile sitting on a cool name) - **does not exist elsewhere.** Image-vs-name integrity
is broadly sound. This closes the "if one eye-matched range was rotated, others may be too"
risk flag.

## Genuine "two colours look too alike" - worth your eye (see `Downloads/tileone-suspects.png`)
Ranked. None are outright swaps; they're colours that read too close, or a name that doesn't
match the tile. All are colour-judgment calls (yours), so nothing was changed.

1. **Estella (Lusso) - "Chestnut" (supplier Terra) shows a neutral grey, ~identical to "Dove" (Grigio).**
   Chestnut does not read as brown at all - it looks the same as the grey Dove. Affects 36 + 60.
   (We flagged the tag as "could be grey" on 2026-07-31; now confirmed visually identical to Dove.)
   Also **Midnight ≈ Obsidian (Nero)** - both mid-grey, neither reads as truly dark/charcoal.
2. **Cabarita (Lakestone) - Sand ≈ Smoke** across all three sizes (36/60/612). Sand is a touch
   warmer, Smoke a touch greyer, but they sit very close.
3. **Foundry (Cement) - "Light Grey" (Portland) vs "Dark Grey" (Cast Iron).** They *are* different
   (Portland warm-light, Cast Iron cooler), but "Dark Grey" isn't dark - the names oversell the
   contrast on a 2-colour product.
4. **Cuadrado Feature (Aurelia) - Almond ≈ White** (both 3D), very close.

## Inherently-subtle neutral ranges (not defects, just tight)
These have pale neutrals only 8-15 ΔRGB apart - distinguishable but close. Matches the review
sheet's known "which neutral is which" note; listed so you know where the eye-strain is:
Aura (Coastline Subways), Strata (Bedrock), Whitehaven (Brampton), Peregian (Keppel),
Cuadrado Matt/Grip, Cinerea (Fusion), Contour (Bayside), Alabastro (Mushroom~Ecru).

## Dismissed as expected (not bugs)
Roughly half the raw flags were **finish variants of the same colour** naturally sharing a tone -
Amber / 3D / Decor / Cross-Cut / Vein-Cut / Grip / Matt pairs (e.g. "Limewash 3D" ≈ "Limewash",
Colonnade "Cross Cut" ≈ "Vein Cut", every Estella "X Amber" ≈ "X"). Same colour, different
surface - correct by design.
