# howethstudio.com

Marketing site for Howeth Studio apps, built with Next.js and exported as static HTML for hosting on Railway.

## Product marketing chrome

- **Howeth Studio** home uses the warm editorial shell in `app/globals.css` (`.studio-landing`).
- **Football Era** routes wrap content in `.fe-page-root`; `styles/football-era-marketing.css` scopes the **dark stadium** colorway to `body:has(.fe-page-root)` so the first paint matches production (no client-only `html` class).
- **CareNote CNA** routes wrap in `.carenote-product`; `styles/carenote-product-chrome.css` applies the **same header/nav rhythm** as the studio home with a **cream field** and **coral** hover accents on links.

## Local development

```bash
npm install
npm run dev
```

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

[Mescubook](https://mescubook.com/) uses separate HTML files (`work.html`, `about.html`, …). This site mirrors that **information architecture** with real routes **`/work/`**, **`/about/`**, and **`/contact/`** while keeping the long-scroll **index** and all CareNote / Football Era marketing pages.

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
