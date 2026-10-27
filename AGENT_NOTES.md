# Current project notes

- October 7 Beopity migration: production web is rebranded and primary at
  `https://beopity.com`. Cutover deployment `c4a2948f-292b-4bfe-ae34-52b108cebbaa`
  succeeded on reviewed main `cb4c906` (PR #9). Namecheap apex/API DNS and ownership
  records are saved; Railway verifies both domains with valid HTTPS. Old website
  deep links redirect with 308 preserving path/query. Both API hosts remain healthy
  on the existing database, and CORS permits the new origin. Source is in attached
  `/Users/howeth/.codex/worktrees/beopity-rebrand/howethstudio.com`. This original
  dirty checkout retains earlier unpublished work; reconcile current main before
  deploying it. Operational docs are merged in PR #10 (`8c61703`); its production
  deployment `dc99e841-7e70-43ef-b877-6abafe728c7f` is SUCCESS. See current main's `docs/beopity-domain-migration.md` for rollback.
  The plan cannot attach HTTPS www as a third web hostname while preserving the old
  apex; Namecheap provides HTTP-only www forwarding to the new primary.

- The public portfolio has seven products. `lib/products.ts` is the shared source
  for home/Work/product artwork; all five Codex Games projects are included.
- Shared visual system: warm paper, ink, cobalt; `StudioSiteHeader` / `StudioSiteFooter`
  provide studio chrome. `ProductPage` provides the reusable product structure.
  `ProductArtwork` keeps app-specific color and optimized public demo imagery.
- Preserve Elevenward localization, legal/deletion/contact forms, and admin styles.
  The staff console stays noindex and outside the public sitemap.
- Football Era and CareNote support/detail routes share `product-legacy.css`.
  Product-root scoping remains required. Static export and trailing slashes remain.
- As of 2026-10-05, Football Era, Elevenward, CareNote CNA, and Noctara have public
  Apple listings; Basketball Era, Baseball Era, and Sprout to Stars are in development. Noctara 0.2.0 is publicly available,
  so the former pre-release copy was stale. Reverify status before changing it.
- The local feature checkout retains its pre-existing Elevenward content edits.
  Production was integrated from current `origin/main`, retaining its newer privacy
  disclosures and existing personal route, media, and footer heart link. Future
  deployments must reconcile current main instead of pushing this dirty checkout.
- Compatible lockfile security fixes use Next 16.3.8 and updated transitive packages;
  no package.json dependency ranges changed.
- Final validation (2026-10-01): clean npm ci, npm run lint, npm run build,
  npm audit --audit-level=high all pass with zero vulnerabilities. Static export:
  44 HTML pages, 40 sitemap URLs, zero broken links/assets/semantic findings.
  Browser checks: 48 route/viewport cases plus 24 enlarged-text/tablet layouts,
  six keyboard and six reduced-motion checks all pass.
- Production release (2026-10-01): `main` at `85290e2`; Railway deployment
  `05d785b8-6006-4af6-a23b-f44b1a70cba1` reports SUCCESS. GitHub validation run
  `36952091142` passes. Integrated export has 45 HTML pages including the preserved
  personal page. Live checks pass for 40 public routes, 42 referenced assets,
  all seven products, sitemap/robots, retained privacy wording, and API health.
  Live desktop/mobile browser review passes for images, filters, menu, keyboard
  navigation, and overflow. Railway topology and the API checkout remain intact.

- October 5 growth changes are local only: `/games/` compares four sports careers,
  `/press/` collects existing official art and demo screenshots, and related-game
  links appear on the four target product landings. Deploy these routes before
  releasing app updates that link to `/games/`; reconcile with current main first.
- `lib/gameMarketing.ts` centralizes the four games' search/social metadata and
  configured Store links. Game/breadcrumb JSON-LD uses factual descriptions and
  publication status, without invented reviews, prices, or rich-result promises.
  Static 1200×630 social cards live in `public/portfolio/og/`. No new collection
  SDK, cookie, paid service, or Railway workload was added.
- Apple's public Elevenward listing (`id6809308325`) was verified October 5. Its
  localized pages now link to the Store and disclose optional permanent
  development/income multipliers. Android stays in development. Keep landing
  copy and all four localized press fact sheets aligned with the released game.
- Baseball now has a local `/baseball-era/privacy/` mirror of the app’s current
  source policy. Football and all four Elevenward privacy locales disclose only
  the implemented voluntary sharing/discovery and local review metadata. These
  edits remain unpublished and are not owner privacy attestation. Basketball
  still needs a complete source/public privacy policy before release.
- Website portfolio/social icons now use the user’s current October 5 Baseball
  Emerald Flight and Basketball Crowned Ball artwork, preserving product paths.
- October 5 required full dependency audit reports five high dev-tree entries
  caused by braces GHSA-vfj7-8cjw-p6xm through Next ESLint; the production-only
  audit is clean. No dependency range or lockfile changes were made for growth.
- Final October 5 validation: npm ci, lint, TypeScript and production static build
  pass. Focused export checks pass for 15 marketing/privacy routes, all local
  links/assets, matching 43-URL sitemaps, factual schemas and four 1200×630 social
  images. Chrome at 390 px verifies menu expansion, Escape/focus return and FAQ
  expansion; 1280/390 px layout has no horizontal overflow. The in-app browser
  did not hydrate this local static session; Chrome verifies the actual controls.
- October 7 Football Era privacy source now discloses explicitly consented paid
  interaction/outcome telemetry, bounded delivery diagnostics, optional presentation
  tests, and conservative RevenueCat customer/device linkage. This draft is local
  and unpublished; reconcile production and owner App Privacy review before release.
