# Beopity domain migration

DNS configured October 7, 2026. The registrar remains Namecheap and the application,
API, PostgreSQL, volumes, buckets, repositories, and app identities stay in their
existing Railway project. No registrar transfer or paid plan change is needed for
the primary apex domain.

## Current state

- `beopity.com` is attached to `howeth-studio-web`, port 8080.
- `api.beopity.com` is attached to `football-era-api`, port 8080.
- Existing `howethstudio.com` and `api.howethstudio.com` remain attached.
- Namecheap uses `dns1.registrar-servers.com` and `dns2.registrar-servers.com`.
  The apex ALIAS, API CNAME, and both ownership TXT records are saved. Existing
  mail settings, SPF, nameservers, and DNSSEC settings were preserved.
- The API now allows the new website origins while preserving the old origins.
- Railway verifies both new domains and reports valid TLS certificates. Both
  new HTTPS origins respond successfully. Production is configured with Beopity
  canonical/API URLs and permanent legacy website redirects. Cutover deployment
  `c4a2948f-292b-4bfe-ae34-52b108cebbaa` is SUCCESS on reviewed main `cb4c906`.
  Old website deep links preserve paths and query strings with 308. Both API
  health endpoints report the existing database ready; Beopity CORS passes.
- The current Railway plan rejects a third custom web hostname. `www.beopity.com`
  is not attached. Namecheap forwards HTTP `www` requests permanently to
  `https://beopity.com/`; HTTPS `www` is not supported by that forwarding.
  Do not remove the legacy apex just to free its slot.

## Namecheap DNS

In Domain List → beopity.com → Manage → Advanced DNS, preserve unrelated records,
including mail, ownership verification, and any DNSSEC configuration. Replace only
conflicting parking/redirect/A/AAAA records at the specific website hosts after
inventorying them. These targets are from the actual Railway domain creation.

| Type | Host | Value |
| --- | --- | --- |
| ALIAS | `@` | `c95is0ti.up.railway.app` |
| TXT | `_railway-verify` | `railway-verify=f4b4e12a2c226d92921e7bd37adb9961e338bca3ca317fc3abd83bf2ac1031a4` |
| CNAME | `api` | `gts55kam.up.railway.app` |
| TXT | `_railway-verify.api` | `railway-verify=f714c8e54d0546bcce13b28a1c90462c2a0b83ec3736224ef0321493bd8686d0` |

Use Automatic TTL for CNAME/TXT. Namecheap saves the ALIAS with its fixed five-minute
TTL. The `www` parking CNAME was replaced with a Permanent (301) URL Redirect to
`https://beopity.com/`. Namecheap supports ALIAS at the root, where an ordinary CNAME
cannot coexist with the zone's other records. Keep its existing nameservers.

References: [Namecheap ALIAS instructions](https://www.namecheap.com/support/knowledgebase/article.aspx/10128/2237/how-to-create-an-alias-record/)
and [Railway domain instructions](https://docs.railway.com/networking/domains/working-with-domains).

## Verify before activating

Check `railway domain status beopity.com --service howeth-studio-web --json` and
`railway domain status api.beopity.com --service football-era-api --json` in the
linked production checkout. Both domain verification and certificate issuance must
finish. Check new HTTPS URLs without disabling certificate validation, including
the home page, localized Elevenward policies, support/deletion resources, and
`https://api.beopity.com/health`.

Add the new website origins to the API's comma-separated `FRONTEND_ORIGIN` while
preserving its existing origins:

```text
https://howethstudio.com,https://www.howethstudio.com,https://beopity.com,https://www.beopity.com
```

## Activate the primary domain

For future migrations, until DNS and HTTPS are verified, deploy the brand with web variables
`NEXT_PUBLIC_SITE_URL=https://howethstudio.com` and `SITE_REDIRECTS_ENABLED=false`.
This keeps current search and support URLs reachable during setup.

The production cutover sets these web variables together and rebuilds reviewed main:

```bash
railway variable set NEXT_PUBLIC_SITE_URL=https://beopity.com NEXT_PUBLIC_API_ORIGIN=https://api.beopity.com SITE_REDIRECTS_ENABLED=true --service howeth-studio-web
```

The static export must be rebuilt because canonical, Open Graph, language alternate,
robots, sitemap, and API URLs are embedded at build time. Confirm a successful
Railway deployment before claiming cutover. Test old-domain deep links and query
strings: they must return 308 to the same path at Beopity. New-domain pages must
return 200, with canonical URLs, sitemap, robots, artwork, and four locale tags
correct. The old API hostname continues serving released applications directly.

Do not point `www` at Railway until it can be attached to a service that issues its
certificate. Namecheap's HTTP URL forwarding is not proof of HTTPS `www` support.
If `www` is required, resolve Railway's hostname limit separately; do not purchase
an upgrade without owner approval.

## Rollback and follow-up

Set `SITE_REDIRECTS_ENABLED=false` and `NEXT_PUBLIC_SITE_URL=https://howethstudio.com`
and redeploy to restore the legacy primary. Keep both domains and the old API.
No database migration, OAuth credential change, app identifier change, or store
resubmission is part of this website cutover.

The existing inbox `howethstudio@gmail.com` stays functional. Set
`NEXT_PUBLIC_BEOPITY_CONTACT_EMAIL` only after a new inbox or forwarding is verified;
do not invent a working email address. Later store/support metadata and publisher
display-name updates need their own owner/account review. Register the new domain
in search tools and submit the new sitemap when the domain is live.

AI assets were produced with the built-in image generation tool. The original logo
prompt requested a sculptural lowercase b above the exact wordmark "beopity", on
charcoal with ivory type and subtle teal edge lighting, inspired by the current
Football Era and Elevenward icons. The icon edit preserved the b and removed the
wordmark/background. `public/beopity/brand-original.png` and `icon-original.png`
retain the originals; optimized website, social, and favicon assets are siblings.
