# TALRIVO public content guide

This repository contains the public website source and the scripts needed to build it.
Changes are reviewed in Git and deployed through the GitHub Actions Pages workflow.

## Editing public content

- Keep model identity, product details and document references accurate.
- Use approved images and preserve original media needed by build scripts.
- Keep visible FAQ answers and structured data consistent.
- Run the validation commands in `.github/workflows/deploy-pages.yml` before publishing.
- Build with `node scripts/build-pages.mjs` and check `public/` with `python3 scripts/audit-public-links.py --root public`.

## Private working material

Store customer records, outreach drafts, analytics exports, internal diagnostics,
credentials and unpublished business plans outside this public repository.
The visitor-facing build exclusions do not make repository files private.
The optional editor configuration retains this public guide as its help document.
