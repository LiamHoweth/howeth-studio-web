# Beopity public design

The public site uses one graphite canvas, warm ivory text, and mint accent. Shared
tokens live in `app/globals.css`; product artwork retains each app's real identity.
Public policy and support styles use the same tokens, while the personal route and
staff console retain their own presentation. Product data and availability still
come from `lib/products.ts`.

## Direction

The composition takes inspiration from [Lusion](https://lusion.co/about/) for its
sculptural 3D centerpiece and oversized typography, and
[Unseen Studio](https://www.cssdesignawards.com/wotm/unseen-studio/42663/) for a
playful mark and restrained chrome. These are design references; no third-party
artwork, models, scripts, or audio are used.

## Sculpture

`public/beopity/logo.glb` is a smooth reconstruction of the existing AI-generated
Beopity emblem, with the tall stem and both rounded openings. It is a standalone
binary glTF asset with a physical ivory material, approximately 345 kB. Regenerate
it with `npm run generate:beopity`, and verify it with `npm run test:beopity`.

`BeopitySculpture.tsx` owns accessible presentation. Its dynamically imported
`beopityScene.ts` owns Three.js loading, lighting, interaction, and resource cleanup.
An inline vector version displays before loading and when WebGL is unavailable.
It stays sharp at every size and responds to the cursor while the 3D files load.
The sculpture follows the mouse position with smoothly eased, bounded rotation. It is
pure brand decoration, with no viewer labels or controls; touch scrolling stays
native. Reduced motion keeps the view still. Rendering stops once the cursor
response settles and while the scene/document is hidden. The canvas uses a bounded
pixel budget for sharp edges on Retina displays without an idle rendering loop.

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
