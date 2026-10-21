# beopity artwork

## Current identity (October 20, 2026)

The approved originals live in `design/branding/` and are never edited:

- `beopity-black-cat-logo.png` (1254 × 1254): an original fluffy black kitten
  with pale mint eyes, warm inner ears and a hooked tail, seated above the
  rounded lowercase wordmark **beopity** on mint paper.
- `beopity-tiktok-pfp.png` (1254 × 1254): the same kitten as a close-up portrait,
  head tilted, above the wordmark.

`npm run generate:beopity` (`scripts/generate-beopity-brand.mjs`) derives every
website asset in `public/beopity/` with Sharp: the full lockup, a mascot-only
cut-out, the wordmark as a recolourable alpha mask, portrait/favicon/touch icons,
the 1200 × 630 social card and a seamless paper-grain tile. Crops and thresholds
are fixed in the script, so the output is reproducible. See
`docs/beopity-design.md` for where each asset is used.

The 3D walking cat is procedural (`components/studio/cat/catModel.ts`). It
follows the mascot's proportions and colours without copying pixels from the art.

## Previous identity

The October 7, 2026 sculptural "b" emblem, its originals (`brand-original.png`,
`icon-original.png`), derivatives and `logo.glb` were retired in this redesign.
They remain in Git history at commit 83b3128.
