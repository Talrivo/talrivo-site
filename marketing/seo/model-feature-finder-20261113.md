# Listed-feature discovery in the gaming headset directory

Date: 2026-11-13. Started from clean baafc08. Local work only.

## Observed problem

The existing local finder matched only the model-link text. Browser baseline checks returned no results for charging dock, fabric cushions and 50mm, despite the directory containing those details. The full-width model query Ｇ９４６ incorrectly matched all 26 entries because it produced no ASCII tokens.

## Implemented together

- Extend the current matcher to use the visible product-direction and review-detail table cells alongside the model label. No new capability dataset, claims, compatibility assumptions or hidden keyword list.
- Keep wired/wireless terms tied to version labels: searching wired must not mix in tri-mode wireless rows merely because they mention a wired connection.
- Pending image references remain a separate group and have no feature data borrowed from similarly named products.
- Normalize full-width characters and common code/unit spacing: G 936 / G-936, 50mm / 50 mm, 1000mAh / 1000 mAh, 2.4G / 2.4GHz. Search uses token prefixes, so G936 does not match G1936 or G9360.
- Unsupported or punctuation-only queries show no matches rather than every product; empty queries and Show all retain the full list. Existing live counts, keyboard focus, recovery shortcuts and photo/video identification route remain.
- Update the input label, examples, explanatory text and module cache version. Original 20 product rows, six pending links, metadata, dates, schema, specifications and inquiry paths are unchanged.
- Filtering remains entirely local. The finder does not send, store or insert the query as HTML. No new analytics event or dependency.

## Verified examples

- charging dock → G946 wireless, retaining both package descriptions.
- fabric cushions → G936 wireless.
- 50mm and 50 mm → the same six listed rows: G941, G939, G927, G926, G946, G947.
- 53 mm → G938; 1000mAh → G941/G939/G938 according to the existing directory cells.
- Ｇ９４６ → only G946.
- G941 wired → the pending wired reference only, no borrowed Bluetooth specification.
- phone charging, wired fabric and punctuation-only input → no listed match.

This searches the details shown in this directory, not every fact on every product page. Missing search results do not establish that a product lacks a feature; the existing detail pages and sample confirmation remain authoritative.

## Local validation

- All 30 existing deployment checks passed. Expanded the finder regression suite to cover the real table-cell details, normalized inputs, numeric/version boundaries, pending references and existing recovery/privacy behavior.
- Compared before/after HTML: product rows, pending-reference section, all meta tags, title, canonical and JSON-LD are identical.
- Browser checks at 320/390/820/1440px: no page-level horizontal overflow; input and buttons remain usable, buttons at least 48px high. Wide tables keep their existing labeled horizontal-scroll regions.
- Actual keyboard navigation: charging dock → G946 package section → dock-bundle sample inquiry; visible configuration note and selected model/inquiry type correct, message blank. Also fabric cushions → G936 → G936 sample request on mobile. No real inquiry submitted.
- Show all and wireless-section shortcut restore all 20 product versions plus six pending references; no browser error logs observed on checked paths.
- Temporary public build: 98 pages, 3,132 links and 1,357 asset references; no issues. Built directory HTML/module match source. Temporary public output and owned browser/server cleaned afterward.

Evidence: /Users/lily/Documents/New project 3/outputs/talrivo-feature-finder-20261113/
Screenshots: finder-desktop.png, finder-mobile.png.

## Search scope and next measurement

Original product URLs stay in static HTML anchors rather than being generated only after a search. Google reference checked 2026-11-13:
https://developers.google.com/search/docs/crawling-indexing/links-crawlable

This improves on-site product discovery for visitors who know a requirement before a model code. It is not proof of more search impressions, improved search CTR, indexing, leads or deployed behavior. No fresh page-filtered GSC data was available. No auto commit/push/deploy, indexing request, outreach or social publication.

Suggested commit: 完善耳机型号目录的需求筛选与搜索识别
