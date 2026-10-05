# Website dependency mitigation, October 4, 2026

The website installs `braces@3.0.3` through the Next.js ESLint development toolchain.
The reviewed advisory, CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm, reports stack exhaustion
from deeply nested input and has no published fixed version. The installed package
is absent from the production-only static serving dependency graph.

The website reuses the Baseball Era security implementation's braces-only patch,
with the same reviewed original/patched SHA-256 hashes and npm package integrity.
It bounds brace/parenthesis nesting to 128 and bounds recursive compile, expand,
and stringify traversal, including direct or cyclic AST input. The limit cannot
be disabled through options. This is a temporary local mitigation, not a claim
that an upstream fixed version has been published.

`scripts/security-patches.cjs` verifies every physical installed copy against the
lock, version, registry integrity, exact original or patched file bytes, and patch
contexts. It validates the whole tree before applying changes and fails on source
drift, changed package metadata, missing files or unexpected copies. Installation
applies the patch and runs the exploit/compatibility regressions. Package versions
and npm integrity values remain unchanged.

`npm run build` explicitly requires `npm run validate:security` before Next.js,
so skipping lifecycle hooks cannot bypass the gate. The gate verifies source hashes,
runs regressions and negative gate tests, captures fresh **unaltered** `npm audit
--json` output and its actual npm exit status, and follows every finding's dependency
chain. It accepts only the complete reviewed advisory snapshot with every audited
copy locally mitigated. New advisories, changed details or severity, unresolved
chains, unmitigated copies, malformed reports and audit transport errors fail.
The optional `--report` mode is for captured-report diagnostics only and must not
be used for a release decision; the build command always performs the live audit.

CI builds with this mandatory gate, separately requires a clean production-only
audit, and uploads the raw full audit report/status as `dependency-audit-evidence`.
Raw full npm audit still returns exit 1 with five propagated high findings. The
verified mitigation gate is green; this is not npm audit zero. No `continue-on-error`,
audit filtering, version spoofing, or unsupported Next.js downgrade is used.

## Verification

- Original installed source reproduced the stack-overflow exploit with two public
  recursive APIs and eight ordinary-pattern/boundary checks under a controlled
  512-KiB stack: 10 original-source checks.
- Patched regression checks cover ordinary nested/escaped/range expansion, the exact
  128-level boundary, rejection at 129 levels, malicious braces and parentheses,
  non-overridable options, direct AST input, and cyclic AST input: 28 checks.
- Gate checks include unknown or changed advisory data, missing/mismatched paths,
  audit errors, inherited severity changes, unpatched/modified source, atomic patch
  failure, idempotence, changed versions/integrity and unexpected installed copies:
  23 checks. They mutate controlled scratch copies only.
- Evidence is retained under ignored `.build/security/`; raw reports include a
  neighboring `.status.json` file recording npm's actual exit status.

No public page, browser bundle, artwork, studio API, database, or app source was
changed in this security pass. Required heavy build validation runs in GitHub CI
while native app builds continue independently.

## Sources and removal

- [Reviewed advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [Upstream issue and recursion-bound recommendation](https://github.com/micromatch/braces/issues/70)

When a supported fixed upstream release is published, review its source and advisory,
update the lock, and run these regressions plus lint/build before removing the local
patch and reviewed advisory allowance. Changed versions intentionally fail the
current pinned checks until that review is complete.
