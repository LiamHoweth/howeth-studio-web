# howethstudio.com

Marketing site for Howeth Studio apps, built with Next.js and exported as static HTML for hosting on Railway.

## Portfolio and shared design

The public collection contains all five projects in the local Codex Games workspace
(Football Era, Elevenward, Basketball Era, Baseball Era, and Sprout to Stars), plus
Noctara and the existing CareNote CNA app.

- `lib/products.ts` is the typed catalogue used by home, Work, and product artwork.
- `ProductCollection` provides All / Games / Apps filtering with announced counts.
- `StudioSiteHeader`, `StudioSiteFooter`, `studio-chrome.css`, and `app/globals.css`
  define the warm paper, ink, and cobalt visual system across studio and product pages.
- `ProductPage` supplies reusable product heroes, feature grids, details, resources,
  and the shared footer. Keep product-specific artwork in `ProductArtwork`.
- Elevenward keeps its four languages and native localized support/privacy/deletion
  routes. Its staff console is excluded from the public catalogue and sitemap.
- `styles/product-legacy.css` keeps existing Football Era and CareNote information
  pages consistent without changing their forms or legal text.
- `public/portfolio/` contains optimized authored app icons and demo screenshots;
  no private app data or source repositories are copied into the site.

Football Era, CareNote CNA, and Noctara have verified public App Store listings as of
October 1, 2026. The other four games are marked In development. Recheck availability
before changing these labels. Noctara links to its existing privacy and support
endpoints; its current release is free and includes optional local bedtime sessions.

The design draws on image-first portfolios and restrained navigation seen at
[Pentagram](https://www.awwwards.com/sites/pentagram), oversized typography at
[Born & Bred](https://www.awwwards.com/sites/born-bred), and product presentation at
[Superlist](https://www.superlist.com/). Assets and app identities belong to Howeth Studio.

## Local development

```bash
npm install
npm run dev
```

## Validation

Run `npm ci`, `npm run lint`, `npm run build`, and
`npm audit --audit-level=high` before committing. Check the exported pages in a
browser at phone and tablet widths, with keyboard navigation, enlarged text,
and reduced motion. Test the product filters and preserve existing form behavior.

## Production build

```bash
npm run build
```

Static files are written to `out/`. Railway builds and serves that directory using
the canonical `.railway/railway.ts` infrastructure definition.

## Environment variables (optional)

Set these in Railway (or `.env.local` for local builds):

- `NEXT_PUBLIC_SITE_URL` — canonical site origin, for example `https://howethstudio.com`
- `NEXT_PUBLIC_HOWETH_STUDIO_CONTACT_EMAIL` — email shown on Howeth Studio pages (footer, `/contact/`); defaults to `howethstudio@gmail.com` if unset
- `NEXT_PUBLIC_CARENOTE_APP_STORE_URL` — App Store URL for CareNote CNA
- `NEXT_PUBLIC_CARENOTE_TESTFLIGHT_URL` — optional TestFlight URL
- `NEXT_PUBLIC_CARENOTE_SUPPORT_EMAIL` — support inbox shown on CareNote pages
- `NEXT_PUBLIC_CARENOTE_SUPPORT_FORM_ENDPOINT` — optional JSON endpoint for the contact form; if empty, the form falls back to `mailto:`
- `NEXT_PUBLIC_FOOTBALL_ERA_APP_STORE_URL` — App Store URL for Football Era when available
- `NEXT_PUBLIC_FOOTBALL_ERA_TESTFLIGHT_URL` — optional TestFlight URL for Football Era
- `NEXT_PUBLIC_FOOTBALL_ERA_SUPPORT_EMAIL` — support inbox for Football Era privacy/support pages (defaults to `hello@footballera.game` if unset)

## Static hosting and 404s

This project uses **`output: "export"`** with **`trailingSlash: true`**. That means each route is emitted as a folder with `index.html` (for example `out/carenote-cna/download/index.html`), which matches how many static hosts (including Render) resolve URLs that end with **`/`**.

If you still see a **404** for a valid page:

1. **Confirm the URL ends with a trailing slash** (for example `https://howethstudio.com/carenote-cna/download/`). A host that does not rewrite `/path` → `/path/` may 404 when only `path/index.html` exists.
2. **Redeploy after clearing a bad cache**: delete `.next` locally, run `npm run build`, and redeploy the fresh `out/` output.
3. **Unknown paths** should return the styled **`404.html`** from the export. If your host does not map missing URLs to `404.html`, add a **rewrite rule** in the Render dashboard (see [Static Site Redirects and Rewrites](https://render.com/docs/redirects-rewrites)) so unmatched requests serve `404.html` with a 404 status.

The studio uses real `/work/`, `/about/`, and `/contact/` routes alongside the
long-scroll home page and dedicated product pages. Keep `app/sitemap.ts` and the
legacy `public/sitemap.xml` mirror synchronized when adding public routes.

## Railway

1. Treat `.railway/railway.ts` in this repository as the production source of truth.
2. Pull the current production environment and review a Railway plan before applying
   changes. A safe plan must preserve `football-era-postgres`, its volume,
   `Postgres-PITR`, and all existing domains.
3. The topology explicitly sources `LiamHoweth/howeth-studio-web` and
   `LiamHoweth/howeth-studio-api`, runs API migrations before deployment, and passes
   the existing PostgreSQL `DATABASE_URL` to the API through a resource reference.
4. Preserve all server-only API secrets in Railway. Never expose them through a
   `NEXT_PUBLIC_*` variable.
5. Verify both `howethstudio.com` and `api.howethstudio.com` after deployment.

## API repository

Accounts, cloud saves, leaderboards, the contact form, and health API live in
[github.com/LiamHoweth/howeth-studio-api](https://github.com/LiamHoweth/howeth-studio-api).
The public API origin is `https://api.howethstudio.com`.

## DNS for howethstudio.com

At your DNS provider, add the records Railway shows when you attach the domain. Prefer one canonical hostname (apex or `www`) and redirect the other so search engines see one primary URL. Keep the current host active until the Railway URL has been verified, then change DNS to avoid downtime.
