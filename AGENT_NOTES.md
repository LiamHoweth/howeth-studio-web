# Current project notes

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
