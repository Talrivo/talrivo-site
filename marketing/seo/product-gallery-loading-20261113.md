# Product-detail image delivery — November 13, 2026

Base: 4bc2a34. The prior model finder batch was already committed; worktree clean at the start. This batch is local and unpublished. No real inquiry, indexing request, outreach or social post was submitted.

## Confirmed problems and changes

- G935/G941 heroes and most of the G935/G936/G938/G941 supplied-image galleries used fixed original JPEGs. Replaced the two heroes and 28 gallery placements with uncropped 480/960px WebP previews. Reused three existing identical image pairs, avoiding duplicate new assets. Source JPEGs remain byte-identical, available from 28 keyboard-accessible image links.
- Browser QA found lazy images could have zero-height link targets before loading because existing gallery CSS overrides the HTML aspect ratio. Reserved each gallery image's actual aspect ratio and provided block-sized link targets and visible keyboard focus.
- Added one short instruction in each gallery introduction. Product text, claims, image alt text, schema, canonical URLs, search titles/descriptions, social images, scripts, inquiry routes and revision dates remain unchanged. Shared stylesheet URL revised only on these four pages to load the new focus/link rules. No JavaScript was added.
- Existing build-entry-images.py generates the 26 new source pairs at quality 85 without cropping, enlargement or source replacement. Existing entry-image checks cover all four pages, byte budgets, reserved proportions and accessible original links.

## Image file-size comparison

Unique product-image src files per page, excluding logos. The after column uses each 960px fallback; browsers may choose smaller candidates. These are file sizes, not measured page transfers, PageSpeed scores or loading times.

| Model | Before bytes | After bytes | Reduction |
| --- | ---: | ---: | ---: |
| G935 wireless | 725972 | 238092 | 67.20% |
| G936 wireless | 2385701 | 304594 | 87.23% |
| G938 | 1098181 | 408214 | 62.83% |
| G941 | 1326592 | 443974 | 66.53% |

## Verification

- All 30 validation-workflow checks passed after the final code change, including source/asset/FAQ/inquiry checks. git diff --check passed.
- Final public bundle is byte-identical to selected source files. Public audit: 98 pages, 3115 links, 1341 asset references, zero issues. Only the newly generated ignored public directory was removed after verification.
- Browser layout checks for all four pages at requested widths 320/390/820/1440: no document-level horizontal overflow, no completed broken images and no zero-size original-image targets. Deferred images are not counted as loaded by that check.
- G936 gallery was scrolled into view and its images confirmed loaded. Keyboard Enter on its receiver/cable image opened the original 1600x1600 JPEG in a new tab. Desktop/mobile gallery screenshots saved.
- Each page's actual primary sample button reached Contact with its corresponding selected model. No form was submitted.
- Source-image SHA-256 checks and automated before/after comparisons verified unchanged metadata, scripts and product text apart from the gallery-viewing instruction.

Evidence: /Users/lily/Documents/New project 3/outputs/talrivo-product-gallery-20261113/ .

## Limits and follow-up

This addresses image delivery, stable layout and detailed product inspection on four core product pages. Other product pages still have large originals; keep them for later prioritization rather than extending this batch without review. No fresh scoped Search Console export or live post-deployment performance measurement was obtained. No claim of ranking, CTR, organic traffic or inquiry lift is made.

Primary reference consulted: https://developers.google.com/search/docs/appearance/google-images . Use standard img/src, responsive srcset/sizes and useful landing-page context; no special ranking mechanism is asserted.
