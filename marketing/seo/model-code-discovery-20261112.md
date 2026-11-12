# Model-code discovery and contextual product paths — November 12, 2026

Base commit b9a3836; clean worktree at the start. Prior category-loading and inquiry-context improvements were already committed by the user. This batch is local, uncommitted and unpublished. No real form, social post, indexing request or outreach was sent.

## Verified source problems

- The directory offered 13 listed wireless versions, seven listed wired versions and six specification-pending references, but no way to filter a known model code. Buyers had to scan the full tables and reference list.
- Its comparison link and accompanying sentence still named G940, although the target comparison page's current requirement shortlist is G946/G926/G938/G941/G935/G936. Its G946 row did not clearly explain the confirmed same-headset package choice.
- The directory and connection guide hero loaded fixed original JPEGs while responsive variants from those same images already existed.

## Changes

- Added a local model-code finder. G936 shows wired and wireless separately; G941 keeps its specification-pending wired reference separate from its listed wireless product. Supports case, spaces/hyphens, code-plus-connection queries, no-match help, clear/show-all, section shortcuts and keyboard Find. Explicit Find focuses the matching product link. While filtering, general version explanations are hidden so matching groups follow the finder; clearing restores the explanations.
- The finder adds no fetch, tracking call, storage or query-string state. Input is not inserted into HTML or inquiry URLs. The unknown-model help uses the existing generic identify-headset inquiry route. Analytics behavior is unchanged.
- All 26 entries remain static, crawlable links in source HTML. The finder control is hidden until its module initializes; all original tables and reference links remain available without JavaScript. The 20-item structured list still contains only the listed versions, retaining the six pending references as a separate group.
- Corrected the comparison link to #quick-shortlist with a matching requirement-led label. The G946 row now explains Headset Only versus the same headset plus a wireless charging dock, with a direct #sample-configuration link. No price, availability, certification or new technical specification was added.
- Reused existing responsive G938/G941 WebP files for the two heroes, preserving source JPEGs, image content and social-preview URLs. Search titles, descriptions and canonical URLs stay unchanged. The directory content revision/sitemap date is November 12; the guide's image-only change does not advance its article date. llms.txt describes the visible local tool; no ranking benefit is asserted for that file.

## Validation

- All 30 deployment-workflow checks passed, including new finder tests using the actual 26 source entries. Covered case/separator matching, wired/wireless separation, pending status, unknown code and G9360, keyboard focus, clear, section shortcuts, source-link retention and no network/storage code.
- Browser verified G936 → two listed versions; G941 → one listed version plus one pending reference; G9360 → no match. Show All restored all 26 entries. A group shortcut also cleared the filter, so anchors cannot lead into hidden results.
- Finder and connection guide at 320/390/820/1440 requested widths showed no page-level overflow or broken loaded images. Existing table-region scrolling is retained on small screens. Real keyboard activation opened the matching G936 wireless page, and its sample link selected the correct G936 product in the contact form. No form was submitted.
- Built final public bundle and passed the 98-page link/fragment/asset audit. Removed only this newly generated untracked build after verifying its source equality. git diff --check passed. Prior category/inquiry files and original JPEGs remained byte-identical to HEAD.
- Evidence and screenshot: /Users/lily/Documents/New project 3/outputs/talrivo-model-discovery-20261112/ . QA server/analytics interception are outside the repository and public bundle.

## Limits and next review

This improves a confirmed directory task and inaccurate link expectation. It is not a measured Google CTR, ranking, organic traffic or inquiry lift. No fresh page-filtered Search Console query export was available in this batch, so no causal CTR diagnosis or arbitrary title rewrite was made. After user publication, verify the module/CSS return valid MIME types, then evaluate page-filtered queries, target countries/devices and qualified inquiries over non-overlapping observation periods.

Primary references consulted: https://developers.google.com/search/docs/crawling-indexing/links-crawlable and https://developers.google.com/search/docs/fundamentals/creating-helpful-content .
