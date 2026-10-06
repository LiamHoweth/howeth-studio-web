# Current project notes

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
- Shared visual system: warm paper, ink, cobalt; `StudioSiteHeader` / `StudioSiteFooter`
  provide studio chrome. `ProductPage` provides the reusable product structure.
  `ProductArtwork` keeps app-specific color and optimized public demo imagery.
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
