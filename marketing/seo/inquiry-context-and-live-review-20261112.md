# Live deployment, mobile performance and inquiry context review

Batch started November 11 and completed November 12, 2026. Base commit: 856b429. This batch remains local: no commit, push, deployment, indexing request or real form submission.

## Confirmed live evidence

- Eight public pages and four scripts/styles returned HTTP 200, expected MIME types and bytes identical to the committed checkout before this batch. Included the homepage, category, comparison, sample guide, G936/G938/G946, contact page, contact form script, analytics, quick-contact script and styles. This confirms the previous batch's publication on those paths, not every URL, indexing or traffic growth.
- Python's local certificate bundle initially failed issuer verification. The macOS system curl client subsequently verified all twelve HTTPS responses with certificate checking enabled; no TLS bypass was used. That initial environment error did not establish a website outage.
- New category PageSpeed mobile report: https://pagespeed.web.dev/analysis/https-talrivo-com-gaming-headsets/zpanumkrig?form_factor=mobile . Captured November 11, 23:06 GMT+8; simulated Moto G Power, slow 4G, Lighthouse 13.6.0. Performance 78, accessibility/best-practices/SEO 100 each; FCP 2.6 s, LCP 4.3 s, TBT 110 ms, CLS 0. No field data. This is a single lab observation for the already deployed page, not a speed score for the new local inquiry fix, a controlled before/after test or evidence of ranking change.
- LCP target: G946 dock-bundle card. The breakdown showed 70 ms resource-load delay, 390 ms resource-load duration and 1,800 ms element-render delay. Image savings and render-blocking requests were also flagged. Do not attribute the full LCP solely to image weight; no speculative shared-CSS rewrite or hosting cache change was made.
- Actual live G946 dock inquiry link selected the correct model/package. Changing the dropdown to G938 left the G946 configuration note and hidden product reference in place. No real inquiry was sent while reproducing this issue.

## Implemented corrections

- A configuration reference applies only while the current product is G946. Switching to another model clears the package note and submitted product_reference; returning to G946 restores the package from the incoming link. Initial malformed model/configuration links are also handled, and submission refreshes context even if a change event was skipped.
- Guide/video references remain useful source context after a model change. Original incoming-link attribution stays available as source context; buyer-entered message text is never overwritten by model changes.
- Submit button shows Sending inquiry… while pending, then restores its label. Existing duplicate protection and strict response.success === true acceptance remain.
- On unconfirmed delivery, the existing draft is retained and a nearby email/WhatsApp fallback group appears. Its links contain generic text only, with no buyer names, emails or requirements encoded into link URLs. Retry hides the fallback while sending; confirmed success hides it and clears stale package UI after reset.
- Kept search title, meta description, canonical, contact details, consent and analytics code unchanged. Updated the contact asset versions, form version and revision dates; no new tracking event or inquiry count is added by changing a model or opening a fallback.

## Validation and limits

- All 29 deployment-workflow checks passed; contact tests cover 72 product routes, all 717 published contact links, configuration switching/return, incoming mismatch, guide retention, final submission refresh, pending label, failure alternatives, strict success, rejection, HTTP/JSON/network errors, timeout, duplicate prevention and retry.
- Local browser at 320/390/820/1440 widths: initial and failed state had no page-level horizontal overflow; initial loaded images were intact. Fallback links had 44 px height.
- Local-only fetch stub rejected the first attempt and accepted the second without contacting Web3Forms. Observed G938 submission with no G946 configuration, then restored G946 dock submission with the correct reference; message retained across failure and model changes, fallback hidden after success, stale configuration note cleared after form reset. These are frontend simulation checks, not proof of actual email delivery.
- Built final public bundle and passed the 98-page link/fragment/asset audit. Removed only the new, untracked build after checking all files matched their sources. git diff --check passed.
- Local evidence and mobile screenshot: /Users/lily/Documents/New project 3/outputs/talrivo-live-check-20261111/ . Test server and network stubs are outside the repository and public bundle.

## Next evidence-led work

The inquiry fix reduces a confirmed source of product/package ambiguity; CTR, qualified inquiries and conversion improvement remain unmeasured. After the user publishes, recheck real dropdown behavior without submitting. Category performance remains an open task: inspect its render-blocking dependency chain and confirm repeatable LCP behavior before changing shared CSS or loading behavior. Obtain fresh page-filtered Search Console queries before revising search titles. Real delivery validation requires a separately authorized test inquiry and recipient confirmation.

References: https://developer.chrome.com/docs/performance/insights/lcp-breakdown and https://www.w3.org/WAI/tutorials/forms/notifications/ .
