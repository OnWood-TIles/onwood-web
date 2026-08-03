# Tile One Import - Review Sheet

**Done autonomously while you were out.** All Tile One green-highlighted products are now in OnBase as **DRAFTS** (`showOnWebsite = false`), nothing is live. 100% free (no paid AI - I read the brochures/photos and matched by eye).

## Totals
- **67 products** (each = one design in one size, standalone with colour variations), **328 colour variations**
- **287 variations have a reframed white-margin face image**; 41 don't (see below)
- **147 per-colour room shots** attached ("see it installed") - **for you to cross-check**
- Every face reframed to the ABI house style (tile on white, ~57%, soft shadow) incl. large-format/planks
- Filters (Location/Use, Material, Size), per-colourway colour tags, and name-free descriptions on every mapped product
- SKUs: `TILEONE-<RANGE>-<SIZE>` e.g. `TILEONE-AURA-75X300`

---

## 1. Ranges NOT on the supplier website (need images) - ✅ ALL RESOLVED
Image-less drafts created from the pricelist so the products/prices exist. All now imaged:
- **Boutique** (3 sizes) - ✅ done 2026-07-24 (Gemini primaries)
- **Brescia Earth** (600x600) - ✅ done 2026-07-24 (from Brescia.zip)
- **Brescia Iconic** (600x1200) - ✅ done 2026-07-24 (from Brescia.zip)
- **Prism** (100x200, 100x300, 75x300) - ✅ done 2026-07-25 (Gemini-recreated bevelled white gloss, copyright-free, from a National Tiles ref)
- **Tivoli** (450x450 Beige/Grey/Silver) - ✅ done 2026-07-25 (faces from Tivoli.zip, reframed to house style)

## 2. Missing price / coverage in the pricelist - set manually
These are recycled-glass mosaics the pricelist appears to sell **per sheet, not per m²**, so cost + m²/box came through blank (showing $0 / "?"):
- **Archistone** 299x290 (no price, no coverage)
- **Boutique** all sizes (no coverage; 297x303 also no price)
- **Forever** 309x290 (no price, no coverage)

## 3. Colours with no face image (product exists, colour blank) - add a swatch
The supplier site had no usable swatch for these specific colours:
- **Lusso**: Nero + Terra (both sizes = 4 SKUs) - no black/brown swatch on the site
- **Vatican**: White Vein-Cut (3 SKUs) - only a grey vein-cut face existed
- **Simplicity**: Taupe + Cool Grey, plus the Ripple/Wave textured whites - only plain white gloss/matt faces exist (this range is ~25 SKUs that are nearly all white; the white ones are all imaged)

---

## 4. Colour matches to eyeball (low confidence, quick swaps in the product form)
Mostly "which pale neutral is which" - all trivially editable:
| Range | Check |
|---|---|
| Aura | Bamboo / Stone / Powder (3 pale neutrals, could reshuffle) |
| Aurelia Stone | White vs Ash |
| Bayside | Champagne vs Sand; Natural vs Shell finish |
| Bedrock | Off White vs Ivory |
| Serenity | Beach Sand vs Light Mocha (could be swapped) |
| Keppel | Mist vs Stone |
| Oakland | Balsa vs Ash (low confidence) |
| Lakestone | Smoke vs Grey |
| Chroma | Celadon vs Jade (two greens) |
| Cotto | Concrete vs Khaki (grey vs olive) |
| Carrara | plain vs Décor (near-identical marbles) |
| Brighton | Matt vs 3D-Décor split |
| Potifino | Almond vs Oyster |
| Terramix | Cream vs Sand |
| Kora Stone | Chalk / Clay / Shale (matched by name, generic brochure) |
| Dominique | Natural vs Nimbus |

## 5. Naming / colour-tag judgment calls
- **Potifino "Nero"** is actually a mid-dark **grey** marble-look, not black - tagged grey
- **Oxide Metal "Giallo"** tagged orange (golden-amber) - could be yellow
- **Terracotta "Muralla Roja"** is a multi-tone blend - tagged brown (pink arguable)
- **Caramela "Cotto"** is mustard/ochre - tagged orange
- **Cotto "Khaki"** tagged green (olive cast)

## 6. Material = Ceramic, not Porcelain (per the manufacturer brochure)
Verify material on: **Cement, Fossil Stone, Caramela, Simplicity** (glazed ceramic wall/floor bodies). I noted these; some filters may still say porcelain.

## 7. Slip ratings
Mostly **blank** - the brochures rarely printed them. Confirm with the supplier for wet-area/outdoor ranges (Lusso, Vatican, Lakestone, Bedrock, Kora Stone, Terramix, Brighton, Dominique, Entice, Oakland are IN/OUT-coded).

## 8. Room shots
You said you'd cross-check these per colour - please do. Notes: many are staged/mixed-wall or tonal-fit assignments; **Aurelia Stone** has 2 AI-generated lifestyle renders in its room set.

---

## How to review
Open OnBase → Products, filter SKU `TILEONE-`. Each is a draft. Rename freely (colours/names were left as supplier names on purpose - your protection). Full machine-readable detail: `onwood-web/.refwork/import-report.txt` and per-range matches in `onwood-web/.refwork/matches/`.

**Re-runnable:** the whole pipeline is scripted (`process-range` → vision agents → `finalize-range` → `import-batch`). New pricelist or corrections = re-run, matched by permanent Item **code**.
