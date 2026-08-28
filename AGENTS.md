# Repository guide for coding agents

## Purpose

This repository is the public Howeth Studio marketing site. It contains the studio pages plus product pages and support/privacy routes for Football Era and CareNote CNA.

## Runtime and hosting

- Next.js App Router with TypeScript and React.
- `output: "export"` creates a static site in `out/`.
- Railway builds and serves the export using the canonical `.railway/railway.ts`
  topology, which also declares the API and preserved production data resources.
- The API is a separate repository at `LiamHoweth/howeth-studio-api`. The ignored local `backend/` directory is a neighboring checkout, not part of this repository.

## Required validation

Run before committing:

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=high
```

## Important boundaries

- Preserve trailing-slash routes because the static export emits `route/index.html`.
- Keep product-specific styling scoped to its product root.
- Never put server secrets in `NEXT_PUBLIC_*`; these values are embedded in the browser bundle.
- When Football Era data collection changes, update `app/football-era/privacy/page.tsx` in the same change.
- Do not commit `.next/`, `out/`, environment files, or the ignored `backend/` checkout.

## Commit and pull request descriptions

Use a short imperative subject and a body that explains:

1. What behavior changed.
2. Why it changed.
3. Deployment or privacy impact.
4. Exact validation commands run.
