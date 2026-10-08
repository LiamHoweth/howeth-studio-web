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
The original mark displays before loading and when WebGL is unavailable. The
sculpture follows the mouse position with smoothly eased, bounded rotation. It is
pure brand decoration, with no viewer labels or controls; touch scrolling stays
native. Reduced motion keeps the view still. Rendering stops once the cursor
response settles and while the scene/document is hidden, with a 30 fps cap and
DPR capped at 1.75.

## Music

The optional **Drift / Beopity** ambient composition is synthesized locally with
Web Audio: soft chords, a quiet bass, and sparse bell notes. `AmbientMusic.tsx`
owns the player; `lib/ambientAudio.ts` owns scheduling and the audio graph. It
starts silent, requires an explicit Play action, and has pause and volume/mute
controls. Public client navigation retains playback. Hidden documents pause;
returning never restarts music automatically. Private/personal routes unmount the
player and close its audio context. No external audio service, recording,
analytics, cookie, or persisted preference is introduced. Verify the lifecycle
with `npm run test:ambient`.
