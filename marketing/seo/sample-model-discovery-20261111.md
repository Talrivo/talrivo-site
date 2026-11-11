# Sample/model discovery improvements — 2026-11-11

Base commit: 988e2a1. Local implementation only; no commit, push, deployment, indexing request or public account action.

## Confirmed issues and changes

- The sample guide's model section omitted a direct G936 route and incorrectly described G940 as a row in the specification comparison. Replaced the redundant generic card with a factual G936 fabric-cushion direction. Added a separate G946 configuration link and a requirement-shortlist link.
- The comparison page visibly listed six models, while its ItemList omitted G946 and used a different order. Aligned the structured list with those six visible choices, retaining the existing four-model specification table and every listed figure. Added the #quick-shortlist target for contextual links.
- Added a G936 related-page link back to the requirement-led comparison. Its existing wireless-collection comparison route remains available.
- The sample guide and comparison hero loaded fixed JPEGs. Added 480/800/1200 WebP variants for the guide, reusing existing 480/720/960 G938 WebP variants for the comparison. Original JPEGs and social-preview URLs remain intact. No new product claim, price, MOQ, compatibility promise or test result.
- Search titles, descriptions and canonical URLs remain unchanged. Updated actual content revision dates in those three pages and the sitemap. llms.txt reflects the visible guide and model choices; no ranking benefit is asserted for that file or generic ItemList markup.

## Validation

- All 29 existing deployment-workflow checks passed, including extended assertions for model-list alignment, contextual routes and responsive image budgets.
- Browser checks at 320, 820 and 1440 pixels for all three pages: no page-level horizontal overflow or broken loaded images. Actual clicks verified guide → G936 → comparison shortlist and guide → G946 configuration.
- Published-bundle offline link/fragment/asset audit passed. Temporary public output was removed only after verifying it was newly generated, untracked and byte-identical to its source files.
- git diff --check passed. Source JPEG preserved byte-for-byte. Guide hero largest variant: 45,536 bytes vs 131,890 original (65.47% smaller); comparison hero largest variant: 35,236 vs 105,061 original (66.46% smaller). These are image-file savings, not measured page-speed or Core Web Vitals results.

## Search evidence limits and next review

The earlier logged-in GSC snapshot for 2026-10-13 through 2026-11-09 showed 4 property clicks from 1,035 impressions; guide 0/241, G936 0/150, G938 0/86. Page/query aggregates cannot establish which queries produced a page's impressions or explain CTR causally. No new page-filtered query export was available for this batch; browser access to that GSC URL had been stopped, and was not retried.

This batch improves confirmed navigation, markup consistency and image transfer size. It does not establish a live publication, indexing, ranking, CTR or inquiry lift. Once published, compare non-overlapping periods with page-filtered queries, country/device and position; keep referral visits and inquiry outcomes separate from GSC search CTR. Use sufficient observations rather than daily title changes.

Local QA evidence: /Users/lily/Documents/New project 3/outputs/talrivo-discovery-20261111/ (not included in the public bundle).

Primary references consulted: https://developers.google.com/search/docs/crawling-indexing/links-crawlable and https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data .
