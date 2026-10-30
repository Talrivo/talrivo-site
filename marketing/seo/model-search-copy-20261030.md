# G-Series and Bluetooth search-copy review

Prepared October 30, 2026. The agent did not commit, push or request indexing. During verification, the checkout advanced from `24e9056` to `e386b60` (commit subject: `优化词名`), which contains the main copy revisions. Final wording refinements remain local. A Git commit or matching remote-tracking ref does not confirm live deployment or a traffic result.

## Scope and decisions

The user requested continued CTR-oriented improvement after the first five-page revision. All 26 G-Series versions and three Bluetooth model pages were reviewed in the current working tree. Fourteen pages receive new copy, nine remain as they were, and six specification-pending references stay gated. TWS/open-ear pages are unchanged, following the requested G-Series and Bluetooth priority.

This is a clarity and relevance hypothesis, not evidence that these terms have higher search volume, that competitors have higher CTR, or that copy alone caused the site's existing results. No new Search Console export or country-level keyword-volume data was obtained in this implementation turn.

## Fourteen revised pages

| Page | Search and introduction angle | Boundary retained |
| --- | --- | --- |
| G940 wireless | Dual-driver wireless gaming headset; 35mm + 16mm | Confirmed 500mAh; listed lights-off runtime; receiver-based use, not Bluetooth |
| G935 wireless | Wireless gaming headset with detachable mic | 40mm, 500mAh, listed 25-hour lights-off runtime; separate from wired G935 |
| G946 | Tri-mode RGB wireless gaming headset | Dock inclusion/functions require confirmation; style video is not a test |
| G947 | Tri-mode gaming headset with aluminum frame | No foldability claim from the historical URL; exact device/mode checks retained |
| B7 | ANC Bluetooth headphones with rotating earcups | Catalogue ANC, not a new measurement; rotation does not establish folding |
| B9 | Bluetooth 5.3 over-ear headphones, 40mm | No inherited ANC claim; black/white views and accessory layout are references |
| B10 | ANC Bluetooth over-ear headphones, USB-C | Listed runtime retained with ANC/volume conditions to confirm; no new battery test |
| G923 wireless | Wireless gaming headset, 40mm driver | Listed 1000mAh and lights-off runtime; not the wired configuration |
| G942 wired | RGB wired gaming headset for custom branding | 3.5mm + USB listing does not establish USB audio |
| G936 wired | Wired gaming headset, approximately 191g | Approximate listed weight; no wireless fabric or battery carryover |
| G939 wired | 50mm wired gaming headset | No wireless receiver/battery carryover |
| G923 wired | 52mm RGB wired gaming headset | Keep the wired driver and interface separate from wireless G923 |
| G921 wired | 52mm wired gaming headset for your brand | No promotion or specification carryover from pending G921 wireless |
| G919 wired | 50mm wired gaming headset for custom branding | No promotion or specification carryover from pending G919 wireless |

Titles, search/Open Graph/Twitter descriptions, visible introductions, existing WebPage descriptions, sitemap dates and corresponding llms entries are aligned. Specification tables, FAQs, images, canonical URLs, inquiry keys and actual link destinations are preserved. Some section headings are simplified from internal review terminology. No new price, MOQ, lead time, certification, rating, latency test or universal compatibility claim is added.

## Pages left alone

- G936 wireless, G938 and G941 retain the preceding October 29 working-tree changes; the G941 steel-wire version is not introduced.
- G920 wireless, G927 wireless, G939 wireless, G926 wireless, G942 wireless and G935 wired already have product-led search angles. Their files remain byte-identical to the start of this turn. The G942 wireless driver conflict stays withheld.
- G921 wireless, G919 wireless, G941 wired, G920 wired, G926 wired and G909 wired remain noindex and absent from the sitemap. Missing specifications are not filled by guessing or borrowing from the other connection version.

## Maintainability and verification

The seven generated-page changes live in `content/model-page-reviews.json`, not only in the output HTML. Only the relevant records receive October 30 dates; the global revision date and TWS records remain unchanged. The existing click-path test now checks per-model revision dates consistently with the generator. A new workflow test checks the fourteen titles, descriptions, headings, contextual sample links and factual limits.

The following local checks passed:

- All 25 Node workflow checks, including the new search-copy regression checks, and four Python link tests.
- Source and generated-bundle audits: 98 pages, 3,022 links and 1,128 asset references with no reported issues.
- A comparison across 56 product pages found exactly fourteen changed files. Canonicals, robots markup, image markup, FAQ data and ordered link destinations were unchanged. All 43 generated source records preserve non-copy fields, including specifications, conflicts, notes, images and inquiry keys.
- Isolated browser checks covered fourteen pages at 1440 x 1080, 390 x 844 and 360 x 800. Hero images loaded, headings/buttons fitted and no document overflow, overlapping hero buttons or JavaScript page errors were detected. Representative desktop and mobile screenshots were inspected.
- All fourteen hero sample links opened the correct product and `Sample request` selection. External requests were blocked; no form was submitted or delivery tested.

Screenshots are in `/Users/lily/Documents/New project 3/output/playwright/`, with `copy` and `20261030` in the filenames.

## Publication and measurement

Publish through the user's GitHub Desktop workflow. D0 is verified live deployment, not this note's date. Check the actual live metadata, canonicals and sample paths after deployment, and separately confirm the crawled/indexed version. Check crawl/display problems around D+7 and compare equal query/page/country/device windows around D+28 where data is sufficient. Keep model, product-feature and procurement queries separate; account for position changes and sparse counts.

Commit `e386b60` includes the preceding October 29 batch and the main October 30 revisions. If deployed together, record a combined release, not two independent experiments; also record any later deployment of the final wording refinements. A change in CTR after deployment does not by itself establish causality, and form opens or button clicks are not confirmed inquiries.
