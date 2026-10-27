# Independent Model Pages: 2026-10-27

## Scope and Delivery

- Priority: G-Series, existing Bluetooth over-ear pages, then TWS/open-ear.
- G-Series: 26 wired/wireless versions, including 18 new pages.
- Bluetooth over-ear: B7, B9 and B10 already had pages; their addresses were preserved.
- TWS/open-ear: 27 models, including 25 new pages.
- Total: 56 model pages in scope, 43 newly generated.
- SY, speakers, adapters and Type-C products are outside this batch.
- No commit, push or production deployment was performed during implementation.

## Sources and Publishing Boundaries

`content/model-page-reviews.json` records existing catalogue/modal specifications,
individual introductions, source images, inquiry labels and indexing eligibility.
This is a source snapshot, not new engineering confirmation.

Six pages are accessible to customers but remain `noindex, follow` and excluded
from the sitemap until specifications and availability are confirmed:

- G921 wireless
- G919 wireless
- G941 wired
- G920 wired
- G926 wired
- G909 wired

At initial generation, G942 wireless and G939 wireless had conflicting driver
descriptions (40 mm versus 50 mm). The subsequently supplied six G939 graphics
specify 50 mm; the G939 page, catalogue and modal now agree. G942 remains pending
driver confirmation and its new page still omits a fixed driver size.

TWS019 and TWS016 have low-resolution source hero images (439 px and 448 px wide).
They were not enlarged. Replace them when higher-resolution material is available.
All responsive images preserve the supplied framing; original assets are unchanged.

New pages contain no invented price, certification, review or rating claims.
TWS runtime wording asks buyers to confirm single-charge versus case-assisted
figures and relevant ANC conditions. Compatibility remains sample/device-specific.

## Integration

- Catalogue cards and static category lists link to independent model pages.
- Wired and wireless versions of the same model have separate pages and inquiry labels.
- Contact CTAs preselect the exact model/version.
- Existing B7/B9/B10, G936, G947, TWS044F and Earclip09S addresses are preserved.
- Only the 37 eligible new pages are included in `sitemap.xml` and `llms.txt`.
- The generated files are checked in; deployment does not need Pillow installed.

## Maintenance Commands

After editing reviewed data or replacing source images, regenerate locally:

```sh
/Users/lily/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/build-model-images.py all
node scripts/build-model-pages.mjs all
node scripts/build-model-pages.mjs all --check
node scripts/test-model-pages.mjs
node scripts/test-contact-flow.mjs
node scripts/validate-site.mjs
node scripts/build-pages.mjs
git diff --check
```

The image builder produces `content/model-page-image-sizes.json` and responsive
WebPs. The page builder refuses to replace hand-maintained pages without its
generated-file marker. Review factual changes before enabling indexing.

## Verification Completed

- Existing deployment validation suite passed, including model facts, JSON-LD,
  sitemap rules, media checks, contact regressions and public-link tests.
- New model-page checks passed for all 56 scoped routes, including six pending pages.
- Contact flow passed for 72 product routes and 664 published contact links.
- Static build succeeded; built-public audit reported 98 pages, 3000 links,
  1093 asset references and no issues.
- Browser checks visited all 43 new pages at 1440 px and 390 px widths (86 checks).
  Images decoded, no horizontal overflow or JavaScript page errors were found.
- Actual inquiry clicks on G939 wireless, G939 wired and TWS013 selected the right
  product and inquiry type. No inquiry was submitted.
- Representative desktop/mobile screenshots were visually inspected and saved in
  `/Users/lily/Documents/New project 3/output/playwright/`.

These checks confirm local implementation, not production deployment, search
indexing, rankings, AI citations or increased traffic. After the user commits and
pushes, verify GitHub Pages deployment and representative live model URLs.
