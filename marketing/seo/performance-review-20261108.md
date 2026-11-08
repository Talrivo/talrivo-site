# TALRIVO performance batch — November 8, 2026

Status: local changes only, based on clean commit 1a99f60. No commit, push, deployment, indexing request or real inquiry submission was performed.

## Live evidence before this batch is published

- Existing homepage report: https://pagespeed.web.dev/analysis/https-talrivo-com/v9yqo9l434?form_factor=mobile — mobile 98, LCP 1.20 s; desktop 100. No field/CrUX data.
- G946 report: https://pagespeed.web.dev/analysis/https-talrivo-com-gaming-headsets-g946-rgb/2cempv4hgz?form_factor=mobile — mobile 100, LCP 0.94 s. No field data. This is the existing published page, not a score for this batch.
- Category first attempt could not resolve the URL. Next report scored 74 and recorded a failed styles.css request, so it is not a stable baseline.
- Category retry: https://pagespeed.web.dev/analysis/https-talrivo-com-gaming-headsets/tofei97loo?form_factor=mobile — performance 76, accessibility/best practices/SEO 100, LCP 4.91 s, CLS 0. LCP target was G946 bundle image, with 4.15 s element render delay. Large G936/G926 card images were flagged. Image loading alone is not established as the sole cause of render delay.
- Initial homepage analytics error was not reproduced in current read-only checks: analytics.js returns HTTP 200 with application/javascript. Homepage, existing redirects, main CSS and quick-contact JS all passed seven live checks.
- Current asset response Cache-Control is max-age=600 from GitHub Pages. No cache headers were changed. Do not add an unsupported _headers file or HTML cache meta tag and claim the hosting response changed. Longer HTTP caching requires supported hosting/CDN configuration and separate review.

## Implemented

- Homepage: scoped darker secondary text on light surfaces, separate light label on dark customization section. No search-title or product-claim changes.
- Added 720px workshop/G938/B9 variants and more accurate homepage image slot sizes. TWS card and dark logo now use responsive WebP. Original images remain.
- G946 five supplied visuals now use responsive 480/800/1200px WebP; at the same maximum width their total is 857,371 -> 198,806 bytes, down 76.81%. Same product appearance/content, both configuration links and manual-play videos retained.
- All eight category model images now use responsive variants; remaining original JPEG cards converted to WebP, with corrected actual intrinsic dimensions. First G946 image retains high priority; second G938 image no longer uses lazy loading. Remaining cards remain lazy.
- Fixed legacy !important grid rules overriding the intended category layout: four desktop, three medium, two tablet, one small-phone column.
- Category mobile header links and style-video link have separated 44px touch targets.
- Existing post-deployment live checker now also checks analytics.js, main CSS and contact JS status and MIME type. HTML fallback/error pages cannot count as successful JS/CSS. Offline failure-path tests updated; no real analytics or consent behavior changed.

## Validation

- 28 existing workflow checks passed after the final image/grid changes (26 Node and two Python commands, including four Python link tests).
- Build completed; public audit: 98 pages, 3,080 links, 1,271 asset references, zero issues. git diff --check passed.
- 43 generated model pages verified unchanged by generator check.
- Local browser checks: homepage/G946 at 390 and 1440 widths; category at 320/390/820/1440. No horizontal overflow or broken loaded local images observed. Category mobile targets measured 44px, tablet two columns and desktop four columns verified.
- Browser viewport override did not take effect in this environment; responsive checks used actual 320/390/820/1440px iframe browsing contexts in a temporary local-only QA wrapper outside the repository. This is layout QA, not an independent mobile Lighthouse score.
- Screenshots: /Users/lily/Documents/New project 3/outputs/talrivo-performance-20261108/ . QA wrapper is not included in the published bundle.

## After user publishes

Re-run mobile PageSpeed for homepage, category and G946. Compare valid runs and inspect category LCP render delay again. No improved score, ranking, organic traffic or CTR is claimed before publication and fresh measurement. Continue prioritizing query/page evidence from fresh Search Console data over chasing 100 points.

Reference: Google image delivery guidance https://developer.chrome.com/docs/performance/insights/image-delivery . HTTP caching is controlled by response headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control .
