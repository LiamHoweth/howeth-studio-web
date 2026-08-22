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

Static files are written to `out/`. Railway builds and serves that directory using `railway.toml`.

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

1. Create a Railway project from `github.com/LiamHoweth/howeth-studio-web`.
2. Railway reads `railway.toml`, installs with `npm ci`, builds the static export, and serves `out/` on Railway's assigned `PORT`.
3. Generate a Railway domain, verify the deployment, then attach `howethstudio.com` and complete the DNS instructions Railway provides.
4. Add the optional `NEXT_PUBLIC_*` variables before building. Point `NEXT_PUBLIC_CARENOTE_SUPPORT_FORM_ENDPOINT` to the API service's `/api/contact` route.

## API repository

Optional contact-form and health API: [github.com/LiamHoweth/howeth-studio-api](https://github.com/LiamHoweth/howeth-studio-api). When deployed, point `NEXT_PUBLIC_CARENOTE_SUPPORT_FORM_ENDPOINT` at `https://<your-api-host>/api/contact`.

## DNS for howethstudio.com

At your DNS provider, add the records Railway shows when you attach the domain. Prefer one canonical hostname (apex or `www`) and redirect the other so search engines see one primary URL. Keep the current host active until the Railway URL has been verified, then change DNS to avoid downtime.
