October 22 deployment repair: Next.js and eslint-config-next are upgraded together to16.4.2, resolving the newly reported Next advisories that rejected the PR16 Railway build. The security gate and existing exact braces mitigation are unchanged. Clean install, lint, security gate, all39 existing Node tests, static build and production audit pass locally; raw full audit still reports the five previously mitigated development findings. Live deployment and the two SuperLife URLs require separate verification.

SuperLife launch scope, October 21: the owner deferred all IAP for 1.0. Its approved privacy/support pages describe the free first release and unavailable Coming soon extras; no purchase, tip or restore flow is active. Contact and URLs are unchanged. Verify live publication separately while Railway reports paused access.

- October 21, 2026: SuperLife privacy and support are available at `/superlife/privacy/` and `/superlife/support/`, using the owner-approved public contact howethstudio@gmail.com. They describe the offline release candidate with native StoreKit, local optional diagnostics, explicit exports, and no configured ads/cloud/Game Center/analytics. Keep these disclosures synchronized before enabling services. The pages reuse existing product typography and studio chrome without adding a public download claim.

- October 20 black-cat redesign (branch `codex/beopity-cat-redesign`): approved
  artwork in `design/branding/` (never edited); `npm run generate:beopity` derives
  `public/beopity/` web assets. Public copy uses lowercase "beopity" (legal and
  localized Elevenward text unchanged). Studio pages (home/work/about/contact) use
  `StudioTrail`: a reserved right lane plus mint `data-cat-wander` interludes where
  the procedural 3D cat walks. Scroll picks a destination; `lib/cat/companion.ts`
  walks the cat there with bounded speed/acceleration/cadence (`motion.ts`, `gait.ts`)
  along a route planned against measured text/media/controls (`route.ts`), and
  repositions discreetly (fade) instead of sprinting. `view.ts` holds the measured
  silhouette envelope and `fitCat` (standing turns on desktop, sit-to-turn on
  narrow lanes); the envelope test re-projects the real rig. `CalmScroll` eases
  wheel travel to 70% on studio pages. Pure modules are tested by
  `npm run test:beopity`; `components/studio/cat/` holds the rig, lazy WebGL
  renderer and DOM driver (with an optional `window.__beopityCatProbe` test hook).
  Reduced motion/no WebGL show the painted cat.
  Product pages share header/footer/type but have no walking cat. Design references
  and architecture: `docs/beopity-design.md`. `next dev` appends to AGENTS.md and
  edits next-env.d.ts; restore them before committing.
- Ten original chill tracks live in `public/beopity/music/`, described by
  `lib/ambientTracks.ts`; regenerate with `scripts/generate-beopity-music.py`.
  Root-mounted `AmbientMusic` provides previous/play/pause/next, seek and volume.
  `lib/ambientAudio.ts` streams one MP3 at a time. Autoplay is requested by default
  with a retry after pointer release or a keypress when blocked; explicit Pause
  disables that retry.
  `?music=off` skips automatic playback for quiet entry/review. Public navigation
  retains music, hidden documents pause, and admin/personal routes release audio.
  No external audio service or persisted preference. CI includes `test:beopity`
  and `test:ambient`; see `docs/beopity-design.md`.

# Current project notes

- October 7, 2026: Public branding is Beopity, with AI artwork under
  `public/beopity/`. Keep product artwork, app identifiers, support inboxes,
  API/data resources, localized documents, and the private personal route intact.
  Namecheap apex/API records are saved; Railway verifies both domains with valid
  TLS certificates. Production configuration uses `https://beopity.com` and
  `https://api.beopity.com`, with tested permanent old-website redirects enabled.
  Keep `api.howethstudio.com` serving released apps directly; API CORS allows both
  website origins. See `docs/beopity-domain-migration.md` for records and rollback.
  The plan cannot attach HTTPS `www` as a third web domain while retaining the old
  apex; Namecheap provides HTTP-only `www` forwarding to the new primary.
  Rebrand validation: clean install, lint, TypeScript/static build, four hosting tests,
  49-page/44-URL export audit, and background phone/tablet/desktop checks pass.
  Runtime audit is clean; full audit retains five known mitigated dev findings.
  Sharp was updated to 0.35.5 to fix a transitive vulnerability.
  Production cutover deployment `c4a2948f-292b-4bfe-ae34-52b108cebbaa` is SUCCESS
  on reviewed main `cb4c906`; old website deep links preserve path/query with 308.
  Both API health checks report the existing database ready, and Beopity CORS passes.

- October 5, 2026: Elevenward’s public App Store listing was verified at
  `https://apps.apple.com/us/app/elevenward/id6809308325`; Android remains in
  development. Its website and studio catalogue now reflect that availability.
  The 520-club / 52-league / 48-country / 48-national-team world and exact
  1.5× / 2× / 3× pass benefits are explicitly labeled as upcoming version 1.1
  until that app update is approved and publicly released.
- Elevenward press downloads use the app’s graphite `11` icon. Keep the PNG
  byte-identical to the authoritative app icon; legacy SVG URLs embed that
  same image for compatibility. The site’s portfolio icon already used `11`.
- Localized Elevenward documents get their server-rendered `html lang` tags
  from `scripts/elevenward-document-language.cjs` after static export. The
  shared `DocumentLanguage` component also handles language changes during
  client navigation. English studio chrome has an explicit English wrapper.
  If localized routes change, update the export script’s document-count guard.
- Privacy copy distinguishes new-account public-board defaults from existing
  private accounts, separate bilateral friend-comparison consent, account-linked
  analytics and purchases, reviewed feedback, voluntary cards, local review
  prompt history, and verified content checks that do not upload careers.
  It makes no unverified operational retention or provider-manifest attestations.

- October 4, 2026: Basketball Era and Baseball Era each have public marketing,
  `/support/`, and `/privacy/` routes. Product pages retain pre-release availability
  until the Apple listings are public. Do not invent App Store download links.
  Both games use device-local careers without accounts, cloud saves, ads, or gameplay
  telemetry. Their optional permanent RevenueCat passes collect anonymous purchase
  identifiers/history and verification data for functionality and purchase analytics.
  Policies include voluntary support correspondence and local backup/deletion limits.
- These app resources reuse `ProductInfoPage`, studio chrome, and scoped product
  styles. Keep policy wording synchronized with final app SDK/service behavior.
- October 4 validation: clean npm ci, lint, production build, and diff checks pass;
  static export has 49 HTML pages, 44 sitemap URLs, and no broken internal links/assets.
  Six Era routes pass 24 browser route/viewport cases, six 200% text checks,
  two keyboard FAQ and two privacy navigation checks. Production-only npm audit has
  zero vulnerabilities. The original braces recursion exploit was reproduced and
  is now locally mitigated by exact-source guards in the parser and three walkers.
  Clean install verifies 28 exploit/compatibility checks; the mandatory build gate
  adds 23 negative/compatibility gate checks and captures fresh, unaltered npm audit
  JSON with its actual exit status. The raw full audit still reports development-only
  braces CVE-2026-93687 through Next ESLint/fast-glob/micromatch (five propagated high
  findings). CI retains that evidence and rejects new/unmitigated findings. See
  `docs/security-mitigations-20261004.md`; no package version/integrity changes or
  unsupported Next downgrade were made. The static serving runtime is unaffected.

- The public portfolio has seven products. `lib/products.ts` is the shared source
  for home/Work/product artwork; all five Codex Games projects are included.
- Shared visual system: graphite, warm ivory, mint; `StudioSiteHeader` / `StudioSiteFooter`
  provide studio chrome. `ProductPage` provides the reusable product structure.
  `ProductArtwork` keeps official app identities and optimized public demo imagery.
- Preserve Elevenward localization, legal/deletion/contact forms, and admin styles.
  The staff console stays noindex and outside the public sitemap.
- Football Era and CareNote support/detail routes share `product-legacy.css`.
  Product-root scoping remains required. Static export and trailing slashes remain.
- As of 2026-10-01, Football Era, CareNote CNA, and Noctara have public Apple listings;
  the other four games are in development. Noctara 0.2.0 is publicly available,
  so the former pre-release copy was stale. Reverify status before changing it.
- Production integration preserves the current main-branch Elevenward privacy disclosures.
  Keep the existing noindex personal route, media, and subtle footer link intact.
  The local source checkout retains its pre-existing Elevenward content changes. The existing
  lockfile changes were retained, then compatible security fixes were applied
  (Next 16.3.8 and transitive fixes; no package.json ranges changed).
- Final validation (2026-10-01): clean npm ci, npm run lint, npm run build,
  npm audit --audit-level=high all pass with zero vulnerabilities. Static export:
  45 HTML pages including the preserved personal page, 40 public sitemap URLs,
  zero broken links/assets/semantic findings.
  Browser checks: 48 route/viewport cases plus 24 enlarged-text/tablet layouts,
  six keyboard and six reduced-motion checks all pass. Deploy through the web
  repository main branch; Railway topology and API checkout remain intact.
