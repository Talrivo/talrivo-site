# Search landing-page batch — November 6, 2026

The user requested one consolidated batch covering multiple verified problems. Working tree was clean at start; latest user commit was faa62bc. No new product claims, keyword-volume study or post-release search lift is asserted.

## Changes and evidence

| Problem | Scope | Correction |
| --- | --- | --- |
| Sample guide inherited image-first mobile hero | Sample checklist | Reuse practical-guide CSS; put its answer/download actions before the image below 920px. |
| Tablet breakpoint gap | Shared practical guides and connection comparison | Image-order override stopped at 760px while the base layout switched at 920px. Extend only image ordering to 920px; retain the existing 760px single-column content grid. |
| Packaging FAQ contradicted sample/packing review | Sample checklist visible FAQ and FAQPage | Require confirmation of sample accessories and packing list before approval; distinguish later retail artwork and bulk-order specification approval. |
| Guide context disappeared at contact entry | Sample checklist, receiver guide, connection comparison | Preserve a fixed guide reference in the visible note and submitted product-reference field, keeping product and inquiry type. Context requires no analytics consent or storage. |
| Resource-event allowlist omitted key guides | Same three guides | Extend existing consent-gated buyer_resource_click coverage to worksheet downloads, guide anchors and existing resource destinations. Keep generate_lead behavior unchanged; clicks/downloads/form opens are not leads. No messages, query strings or buyer-entered content enter the event payload. |
| Incorrect intrinsic dimensions | G938 accessory reference in sample guide; responsive G938 hero in sample request | Use actual file dimensions 1117x1110 and 960x1034. No image file is modified. |

Existing search titles, descriptions, H1s and canonicals are preserved. No robots/noindex change, new page, G946 revision, certificate change or company-positioning change is included. Update the three guide Article revisions, sample-request revision, sitemap dates and documentation. Shared-style-only page references retain their content revision dates.

## Verification

- Final validation after the tablet correction: all 26 workflow Node checks and four Python link tests passed; public-link audit covered 98 pages, 3065 links and 1167 asset references with no issues. git diff --check passed.
- Five guides checked at 390, 820 and 1440 CSS pixels: sample evaluation, receiver setup, connection comparison, microphone and packaging. No document overflow. Mobile/tablet text ordering verified; the connection guide's 820px issue found during this check was corrected and rechecked. Desktop images remain beside the text. Representative phone/tablet/desktop screenshots inspected.
- Three actual local contact destinations opened and displayed their expected product, original inquiry type and guide-specific reference note. No form submitted.
- Added regression cases cover visible/structured FAQ agreement, source context with null/denied/granted consent, worksheet/anchor resource clicks with consent and withdrawal, and no lead events or private event payloads.
- No request to Google to index or validate a repair; no production analytics event or inquiry intentionally submitted. No commit, push or deployment performed.

## Measurement boundary and next review

Latest supplied GSC period ends November 3, predating this batch. Earlier authenticated checks show some crawls predate recent changes. Record confirmed publication and later Google crawl dates separately. Compare like-for-like page/query/country/device scopes while considering rank and sparse clicks. Resource events measure post-click use among consenting visitors; they do not measure organic CTR or all downloads. A later increase in clicks alone would not isolate the cause because several improvements are bundled.
