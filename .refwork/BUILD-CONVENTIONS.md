# OnWood Tiles — full-site build conventions (match the Claude Design reference)

Building the real OnWood Tiles marketing site in `C:\Users\Reagan Genrich\Claude\onwood-web`
(Next.js 16.2.10 App Router, TypeScript, Tailwind v4, Turbopack). We are recreating the
Claude Design reference FAITHFULLY. The exact per-section rendered HTML (with inline styles)
lives in `.refwork/tiles-sections/*.html` and `.refwork/specials-sections/*.html`.
Full rendered pages: `.refwork/tiles.rendered.html`, `.refwork/specials.rendered.html`.

## Golden rule
TRANSCRIBE the reference's layout, spacing, radii, colours, type scale and interactions
EXACTLY from the section HTML. Do not invent your own layout. The reference IS the spec.
Only COPY (words) and DATA are adapted per the rules below.

## Design tokens (already in app/globals.css :root)
--bg #FBFAF6 · --surface #FFFFFF · --ink #20303A · --muted #6B7A80 · --accent #D06A45
(terracotta) · --accent2 #C57B4C (clay, used for eyebrows) · --sea #1E7A8C (aegean) ·
--line rgba(32,48,58,.10) · --deep #0E1A20. Use var(--x). Fonts: Archivo (display, via
var(--font-archivo)), Manrope (body, var(--font-manrope)), Newsreader italic
(accent words, var(--font-newsreader)).

## Recurring design language (transcribe consistently)
- **Eyebrow**: font-size 12.5px; font-weight 700; letter-spacing .18em; text-transform
  uppercase; color var(--accent2). (On dark sections color is var(--accent).)
- **Section H2**: font-family Archivo; font-weight 800; font-size clamp(30px,4vw,52px);
  letter-spacing -.02em. Accent words use Newsreader italic (font-weight 400), colour
  var(--sea) on light / var(--accent) on dark.
- **Section frame**: max-width 1240px; margin 0 auto; padding ~100-110px 40px. Some
  sections are full-bleed gradient bands (specials: linear-gradient(150deg,#d97a4e,#c15a30
  68%,#a84a24) white text; story/why: linear-gradient(160deg,#1A5563,#123C46) white).
- **Arched niches** (signature): border-radius with big top values, small bottom, e.g.
  `200px 200px 24px 24px` (hero), `130px 130px 0 0` (collection card top),
  `120px 120px 16px 16px` (story images). overflow:hidden.
- **Pills / CTAs**: border-radius 100px. Primary CTA = var(--accent) bg, #fff, font-weight
  800, padding 15px 26px, box-shadow 0 14px 40px rgba(208,106,69,.34). Secondary = surface
  bg, ink text, 1.5px var(--line) border.
- **Scroll reveal**: reference uses `data-reveal`. Use the existing `<Reveal>` component
  (app/components/ui/Reveal.tsx) OR a matching IntersectionObserver fade-up (opacity 0 ->1,
  translateY(18px)->0, honour prefers-reduced-motion). Stagger with delay.
- **Count-up** stats: animate 0 -> target on scroll into view (respect reduced-motion:
  show final value). Reference `data-count data-to data-suffix`.
- **Magnetic buttons**: reuse app/components/ui/MagneticButton.tsx behaviour where a CTA
  is `data-magnetic`.
- Images in the reference are `<x-import image-slot>` placeholders. Render as an arched
  placeholder box using the existing `<Niche>` component (app/components/ui/Niche.tsx) with
  NO src (it shows a warm gradient placeholder) OR a styled div with the exact radius. Real
  photos get wired later. Keep the exact radius from the reference for each slot.

## COPY ADAPTATION RULES (important — OnWood is a TILE SHOP, not a flooring installer)
1. **Brand is "OnWood Tiles"** — NEVER "Flooring", "Flooring & Tiles", timber/hardwood as
   the business. Wordmark: "ONWOOD" with "Tiles · Sunshine Coast, QLD".
2. Keep the reference's evocative TONE and structure, but frame OnWood as a premium
   Sunshine Coast **tile showroom & supplier** (floor, wall & outdoor tiles; supply and can
   arrange installation). Soften pure-installer claims:
   - "We don't sell tiles. We finish rooms." -> "We don't just sell tiles. We help you get
     the whole room right." (keep the two-line dark hero H2 rhythm)
   - "measured, designed and laid by hand" -> "chosen, matched and delivered with care"
     (installation available but not the identity)
   - "hand-set every board and tile" -> keep tile references, drop "board".
3. Swap timber/hardwood PRODUCTS to tile equivalents (tiles include wood-look!):
   - "Herringbone oak"/"Engineered timber"/"Australian hardwood"/"Charred Spotted Gum" ->
     wood-look porcelain / plank tile equivalents. Keep zellige, terracotta, travertine,
     limestone, marble-look, porcelain (all real tiles) as-is.
   - "One obsession with grain" -> "One obsession with the perfect surface."
4. **Real details**: showroom "2/11 Packer Street, Baringa QLD 4551" (NOT Maroochydore);
   email "sales@onwoodtiles.com.au" (NOT hello@onwood.com.au); socials IG
   https://www.instagram.com/onwood_tiles , FB https://www.facebook.com/share/18qX1BsNrf/ .
   Phone: OMIT (none supplied) — replace phone line with "Visit us Mon-Sat" or the email.
5. **Team**: keep the section design; names are PLACEHOLDERS. Use retail roles not install
   trades (e.g. "Showroom lead", "Selections & design", "Trade & orders", "Showroom host").
6. **NO em-dashes** in customer copy — use hyphen "-" or comma. (Owner preference.)
7. EXCLUDE entirely: the reference's bottom "How this was done / build brief / prompt for
   Claude Code" meta section (tiles-sections/12) and its "Recommended stack" — that is Claude
   Design annotation, NOT site content.

## Data source
All copy/data comes from `lib/content.ts` (async getters, server-only). Section components
are server components that `await` the getter, EXCEPT interactive ones (hero woodgrain, tile
grid, visualiser, vision board, count-up, magnetic, marquee) which are `"use client"`.
Do NOT hardcode long copy in components — read from content. Collections/specials/swatches
are placeholder data now; they will be replaced by the OnBase feed later, so keep the shape
close to lib/onbase/client.ts's WebsiteRange where practical, but a separate simpler shape in
content.ts is fine for v1.

## File conventions
- Section components live in `app/components/marketing/<Name>.tsx` (+ `<name>.module.css` if
  needed; inline style objects transcribed from the reference are also fine and often easier
  to keep exact). One component per top-level reference section.
- Reuse existing primitives where they fit: ui/Reveal, ui/MagneticButton, ui/Niche,
  ui/Eyebrow, ui/ShineHeading, ui/Pill, site/SiteNav is being REPLACED by the reference nav.
- Match responsive behaviour: the reference collapses 2-col grids to 1-col and 3-col card
  grids to 1-col on narrow screens (add sensible @media max-width ~860px / ~620px).
- Accessibility: real <button>/<a>, aria-labels on icon controls, alt text, AA contrast,
  reduced-motion fallbacks. Prefer next/link for internal nav.
