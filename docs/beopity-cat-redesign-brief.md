# Beopity: ambitious black-cat website redesign

This is a direct task from Liam Howeth, sent to Claude Code on October 20, 2026. Implement the work, not merely a plan or design suggestions. Use relevant available skills of your choosing and specialist agents where they help. Exercise strong design judgment and continue through a concrete, reviewable implementation and validation.

## User request, verbatim

“completely refactor site to be a coherent site based off some award winning existing sites using any skills you choose be ambitious and implement this:(now update the website with this logo and make the 3d model a black cat that moves with you scrolling, that walks down the page.)”

The user approved a new Beopity black-cat logo immediately before requesting this task. Their original brand direction was “black cat themed studio ghibli black cat still with beopity branding.” Keep the cat original, with a cozy hand-painted animation feel. Preserve the exact lowercase brand name beopity. Public copy should read like an established, professional studio, with no implementation labels such as “the Beopity mark.”

## Starting state and approved assets

- Your working directory is /Users/howeth/Desktop/claudex/Websites/beopity-cat-redesign.
- Branch: codex/beopity-cat-redesign. It was created from freshly fetched origin/main at 83b3128869258c8566a8175f84a90d1d7aa4172b.
- Remote: https://github.com/LiamHoweth/howeth-studio-web.git. Live public site: https://beopity.com/.
- Original canonical checkout /Users/howeth/Desktop/claudex/Websites/howethstudio.com contains extensive unpublished changes and must remain untouched. Do not reset, stage, commit, overwrite or deploy its dirty work.
- Approved full mascot-and-wordmark artwork: design/branding/beopity-black-cat-logo.png.
- Approved close-up TikTok avatar: design/branding/beopity-tiktok-pfp.png.
- Inspect both images. They show an original black cat, expressive pale mint eyes, warm inner ears, slightly tilted curious head, mint paper background and rounded black lowercase beopity wordmark. These are authoritative identity references. Retain originals and produce suitable web assets non-destructively.
- Read AGENTS.md, AGENT_NOTES.md, docs/beopity-design.md, relevant architecture/product docs and current source before editing. Reuse existing components and services where sound.

## Creative and interaction outcome

1. Research a small, purposeful set of real award-winning studio/portfolio websites, using current Awwwards or equivalent award records and the actual sites. Record their URLs and the specific useful principles in your design notes. Borrow principles such as hierarchy, editorial pacing, typography, spatial composition and purposeful motion; build an original Beopity result, not a clone or collage. Do not invent awards or testimonials.
2. Deliver one coherent, ambitious visual system across the public studio, portfolio and product surfaces: typography, colors, navigation, content hierarchy, buttons, spacing, imagery, footer and transitions must feel designed together. Preserve product identity within the shared system. The established dark/charcoal, ivory and mint palette should evolve naturally around the approved black-cat identity. Make the black cat readable against the background. Do not substitute a generic landing-page template.
3. Integrate the approved logo throughout appropriate brand surfaces: header/footer, metadata/social art, favicon/app touch icon and studio art. Keep wordmark legible at small sizes; create mascot-only variants where appropriate without changing the approved character.
4. Replace the old 3D b with a genuinely 3D black cat matching the mascot. It must visibly WALK down the page as the user scrolls. This is the signature experience: scroll distance drives position/progress and a convincing four-leg gait; the cat should naturally accompany the page, reverse or respond sensibly when scrolling back, and pause when scrolling stops. Design a deliberate route through the composition, with believable steps and tasteful idle/head/eye response if appropriate. A rotating static object or flat picture sliding vertically does not satisfy this requirement. Choose an efficient rigged or procedural geometry/animation approach and document regeneration/source assets.
5. Ensure the cat never blocks content, navigation, forms, focus, links or the music controls, and never traps normal touch scrolling. Adapt its route/scale/placement for mobile. Integrate it into the experience rather than creating a disconnected demo or intrusive overlay.
6. Keep motion responsive and crisp on high-DPI screens. Lazy-load heavier resources; show an immediate branded fallback; bound GPU/memory cost; avoid layout shift; pause rendering when still, hidden or offscreen where applicable; dispose resources/listeners. Honor prefers-reduced-motion with a polished static/simplified cat and fully usable content. Avoid scroll-jacking.

## Existing behavior and boundaries to preserve

- Next.js App Router, React/TypeScript, output: export and trailing-slash routes. Retain static hosting unless a concrete need justifies a narrowly scoped change.
- Preserve all seven products, actual publication/download status, content, product artwork and official identifiers. Read lib/products.ts and existing ProductPage/ProductCollection/ProductArtwork before creating replacements.
- Preserve localized Elevenward pages, correct language metadata, support/contact/deletion flows, legal/privacy content and URLs. Legal pages can receive coherent chrome/typography but their meaning and disclosures must not be casually rewritten. Staff/admin and the personal/noindex route should retain their behavior and privacy.
- Keep the ten original MP3 tracks and the fixed bottom-right player with previous/play-pause/next, seek, volume, playback/navigation state, browser-policy handling, explicit pause and ?music=off. Existing lib/ambientAudio.ts owns the single native audio engine; reuse it. Do not regress pointerup touch activation handling.
- Keep API, Railway topology, PostgreSQL, buckets/volumes, existing production data, domains/redirects, secrets, app identifiers and neighboring backend repository intact. No new paid service, subscription, analytics, cookie, or dependency-heavy replacement without a demonstrated need. Never expose server secrets in browser variables or logs.
- Do not use native computer-use access to Claude Desktop (com.anthropic.claudefordesktop), change its deny rule, restart Claude or stop its workers. Use CLI or an authorized background browser. Do not take screen focus: the user asked for background work. Use ?music=off and silent/muted playback verification so tests do not disturb their audio.

## Validation and completion

- Make the implementation modular: keep scroll/animation logic separate from presentation and preserve working services. Do not pile everything into a page component.
- Run the required commands in the repository's current AGENTS.md/package.json: clean install, lint, security gate, production build/static export and relevant tests (hosting, cat/model behavior, audio and music). Add meaningful checks for scroll progression/gait, resize/reduced-motion behavior and cleanup where appropriate. Inspect all diffs.
- Recheck audits live. The starting main has a known mitigated braces dev-tree advisory; retain unaltered audit output and its status, verify the existing exact-source security gate, and do not silence findings, spoof dependency versions or force an unsupported downgrade. New issues need investigation.
- Visually verify the final experience in a real browser at compact mobile, regular mobile, tablet and desktop sizes; include scroll forward/backward, keyboard/menu/forms, reduced motion, static fallback and music behavior. Capture screenshots and, if possible, a short silent recording demonstrating the walking cat. Do not claim tests or physical/touch acceptance not actually performed.
- Check disk before large builds. At dispatch, the build volume had about 32 GiB free, below the user's 50 GiB target. Follow the user's preservation-first disk policy: reclaim only confirmed inactive, rebuildable, authorized generated artifacts; never delete user data, source, credentials, saves, distributed archives, another task's active work, or unique artifacts. Preserve reusable caches/build folders, remove your superseded intermediates after final evidence, and report protected-data limits honestly. Do not skip required verification merely to save disk.
- Keep AGENT_NOTES.md concise and current for lasting architectural/asset information. Record design references, actual validation, remaining limitations and exact workspace/branch/commit.
- Deliver the complete implemented redesign with reviewable diffs, a focused PR and preview/evidence. Follow the existing web deployment workflow when ready and within the user's website-update authorization; report local verification, PR/CI and any live deployment separately. Never describe a queued job or local preview as a completed live release.

Begin by acknowledging the task and inspecting the approved cat images, current main, architecture and available design/3D skills. Then implement ambitiously and finish the authorized work without repeated preference questions.
