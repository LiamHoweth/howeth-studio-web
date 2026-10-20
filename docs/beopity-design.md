# beopity public design

beopity is a night studio with a black cat. The public site uses one charcoal
canvas, warm ivory type, a mint accent and the mint paper of the approved
artwork. Shared tokens live in `app/globals.css`; product artwork keeps each
app's real identity. Product data and availability come from `lib/products.ts`.

## Identity

The approved originals are `design/branding/beopity-black-cat-logo.png` (seated
kitten above the lowercase wordmark) and `design/branding/beopity-tiktok-pfp.png`
(close-up portrait). They are never edited. `npm run generate:beopity`
(`scripts/generate-beopity-brand.mjs`, Sharp) derives the web assets in
`public/beopity/`:

| Asset | Use |
| --- | --- |
| `logo.webp` | Full lockup: hero studio art |
| `cat-sitting.webp` | Mascot-only cut-out (border flood-fill keeps the pale eyes opaque; edges un-premultiplied from the paper) for the painted/static cat and 404 |
| `wordmark.png` | Exact approved wordmark as a white alpha mask, coloured by CSS in the header and footer |
| `avatar.webp` | Portrait crop: header mark, footer, studio portrait |
| `favicon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Icons from the portrait |
| `social.png` | 1200×630 Open Graph/Twitter card |
| `paper.webp` | 2×2 mirrored paper grain for the mint interludes and cards |

Public copy writes the brand as lowercase **beopity**.

## Type, colour and layout

- Display: Fraunces (soft axis, italic accents in mint) for headlines, product
  names and statements. Body/UI: Manrope. Labels: IBM Plex Mono uppercase.
- Palette: charcoal `#111312`, ivory `#f3efe4`, mint `#bfeccb`, paper
  `#d2edcb`, with the cat's warm ear tone reserved for the 3D rim light.
- One pill button family (`.studio-button`, `.product-action`) and one header and
  footer across studio and product pages. The footer lists every product.
- Studio pages (home, Work, Studio, Contact) sit in `StudioTrail`: a content
  column plus a reserved lane on the right where the cat walks. Full-bleed mint
  paper interludes mark chapters and contain open ground for the cat to cross.

## References

These are design principles only; no third-party artwork, models, scripts or
audio are used. Awards were verified on the cited Awwwards pages on 2026-10-20.

- [Messenger by abeto](https://messenger.abeto.co): Site of the Day, Nov 10, 2025
  ([record](https://www.awwwards.com/sites/messenger)). A small character with a
  one-line reason to move; soft pastel palette. → The cat accompanies the visitor
  down the page; mint paper and sage.
- [Unseen Studio](https://unseen.co/): Site of the Day, Feb 6, 2023 and Site of
  the Month, Feb 2023 ([record](https://www.awwwards.com/sites/unseen-studio)).
  Cozy, slightly surreal world; personality in small details. → Hand-painted
  kitten, paper grain, blinking and glancing at the cursor when idle.
- [Lusion](https://lusion.co/): Site of the Day, Oct 2, 2023
  ([record](https://www.awwwards.com/sites/lusion-v3)). One accent plus a neutral;
  scroll as the narrative spine leading to a large closing call to action. → Mint
  on charcoal; chaptered interludes; oversized footer invitation and wordmark.
- [Igloo Inc](https://www.igloo.inc/): Site of the Day, Jul 23, 2024
  ([record](https://www.awwwards.com/sites/igloo-inc)). Restrained UI that lets
  the 3D carry colour, but low accessibility scores. → All copy stays real HTML;
  the cat is decorative, click-through and has a reduced-motion form.
- [Bruno Simon](https://bruno-simon.com/): Site of the Day, Nov 11, 2019
  ([record](https://www.awwwards.com/sites/bruno-simon-portfolio)). A character
  integrated with the page rather than displayed beside it. → The cat's route is
  part of the layout (lane and interludes), not an overlay demo.

## Walking cat

| Module | Role |
| --- | --- |
| `lib/cat/gait.ts` | Pure gait: lateral-sequence walk (quarter-cycle footfalls, 62% stance), stride that lengthens with speed, two-bone leg IK, seated pose, tail and head |
| `lib/cat/route.ts` | Pure route: scroll → cat position in the lane, gentle meander, crossings through `[data-cat-wander]` ground, waiting at either lane end |
| `lib/cat/walker.ts` | Pure state: distance → gait phase, heading, back-up vs. turn-round hysteresis, stand after 0.12 s, sit facing the visitor after 1.3 s, jump snapping |
| `lib/cat/view.ts` | Shared orthographic camera constants |
| `components/studio/cat/catModel.ts` | Procedural Three.js rig: body → head/legs (hip → knee → paw)/skinned bone tail; toon fur shader with painterly grain and warm rim; ink outlines |
| `components/studio/cat/catScene.ts` | Lazy WebGL renderer, lantern glow and contact shadow, bounded pixel ratio, context-loss handling, disposal |
| `components/studio/cat/catDriver.ts` | DOM measurement, scroll/resize/pointer/visibility listeners, render loop that sleeps when settled |
| `components/studio/WalkingCat.tsx` | React shell: painted fallback, reduced motion, lazy import |

Scroll distance is the only driver. Stance feet travel back exactly as far as the
body moves, so planted paws stay on the page. Scrolling back briefly makes the
cat back up; a sustained reversal turns it round to walk up the page. When
scrolling stops it stands, then sits and turns to face the visitor with the
mascot's head tilt; its eyes follow a fine pointer and it blinks occasionally.

The cat is regenerated by editing `catModel.ts`/`gait.ts`; there is no model file
to download. `npm run test:beopity` covers IK, footfall order, planted feet,
ground contact for every pose, lane containment and crossings, reversal, sitting,
jump snapping, rig budget and disposal.

Performance and safety: the host is `position: fixed`, `pointer-events: none`,
`aria-hidden`, moved with a transform only; the canvas is a bounded square around
the cat (≤1.4 MP backing store) instead of a full-screen layer. Rendering runs
only while walking, settling, glancing or blinking and stops while the document
is hidden. Three.js loads after mount; the painted cut-out follows the route
until the first 3D frame and remains if WebGL is unavailable or lost. With
`prefers-reduced-motion: reduce` no WebGL loads and the painted cat sits in the
lane (CSS `position: sticky`), so content is fully usable without animation.

## Music

The Beopity playlist contains ten distinct original instrumental tracks, scored
and rendered by `scripts/generate-beopity-music.py`. Final MP3s live under
`public/beopity/music/`; `lib/ambientTracks.ts` supplies their titles and durations.
The arrangements combine soft chords, bass, melodic motifs, and restrained rhythm.
Regeneration requires Python with NumPy plus ffmpeg/ffprobe; it does not run during
deployment. `docs/beopity-music-render.json` records measured duration, audio levels,
and file hashes. `npm run test:music` verifies the catalogue and encoded assets
using the project's existing Node dependencies.

`AmbientMusic.tsx` owns the bottom-right player and playback intent;
`lib/ambientAudio.ts` owns one native audio element. It streams the selected song,
provides previous/play/pause/next, seek and volume controls, and advances through
the playlist when a track ends. Previous restarts a track after three seconds;
otherwise it selects the preceding song. Paused track changes stay paused.

Playback is requested by default. Browsers that block autoplay receive a first
interaction retry; an explicit Pause prevents that retry. The page is paused while
hidden. Pointer retries wait for release so touch has browser activation, alongside
the keyboard retry. Public client navigation retains the player, while
private/personal routes release it. A `?music=off` entry keeps playback quiet until
an explicit Play action.
There is no external audio service, recording, analytics, cookie, or persisted
preference. Verify playback races and asset integrity with `npm run test:ambient`.

Autoplay behavior follows the browser's policy; see
[Chrome's autoplay documentation](https://developer.chrome.com/blog/autoplay/).
Touch and mouse activation timing follows
[MDN's user activation guide](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation).
