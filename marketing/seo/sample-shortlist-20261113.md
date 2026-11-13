# Native sample shortlist — November 13, 2026

Base HEAD: 4c273f2, plus nine uncommitted paths from the previous resource-measurement/mobile-order batch. Those nine paths were hashed at the start and remain byte-identical. No commit, push, deployment, indexing request or real inquiry was made.

## Buyer task and implementation

The comparison page offered a six-model requirement shortlist and multi-model sample advice, but its inquiry links selected only the generic collection and comparison type. Added a way to carry the buyer's actual selected candidates into that existing inquiry.

- Kept all six existing model descriptions/links and the seventh sample-preparation card. Added labeled native checkboxes for G946/G926/G938/G941/G935/G936, with no default winner.
- Wrapped the existing cards in a GET form directed to /contact/#inquiry-form. Only fixed product/inquiry/reference fields and selected public model codes are carried in the URL. No message, email, phone or private buyer field is in this form.
- Added a reset button; an empty selection remains a valid request for advice. Checkbox/GET behavior needs no additional selection JavaScript; the existing contact script performs the destination-page prefill.
- Added the fixed model-shortlist guide reference and a six-code allowlist to contact-form.js. Unknown/prototype-like/HTML values are ignored, duplicates removed and no arbitrary values inserted into HTML. Both the visible note and submitted product_reference record approved model codes.
- G946 remains the same headset with two package choices. The context explicitly asks to confirm Headset Only or the same headset with a wireless charging dock; no other package contents, availability, compatibility, price or delivery terms are inferred.
- In the final implementation, selected model context is active only for Gaming Headset Collection plus Model comparison. Changing the product or inquiry type clears the model list/package note; returning to that original combination restores the candidates from the link. The original guide source remains a source reference. Buyer message text is not rewritten.
- An optional attempt to retain the list across inquiry types was rejected by automatic approval review before execution. It was not retried or worked around. The clear-on-type-change implementation was retained. This records the review outcome, not an additional product requirement authored by the user.
- Kept search titles/descriptions, canonical URLs, product facts, comparison figures and visible/structured FAQ unchanged. Updated only the comparison content revision/sitemap date and its llms description; contact markup changes only its script cache version. Added no new page URL, telemetry event, cookie or storage.

## Verification

- All 30 existing deployment checks passed. Added cases cover the native form's six choices, no selection, duplicate/unknown/injection values, the G946 package boundary, all three consent states, no storage/lead on entry, stale-context clearing, preserved message and isolated submitted product_reference fields. No real POST occurred.
- 320/390/820/1440 browser checks: six checkboxes, no document overflow or off-screen buttons; every choice label has a 44px minimum height.
- Actually selected G946/G938/G936 on desktop and continued via the form. The destination selected Gaming Headset Collection / Model comparison and visibly listed those three models plus the G946 package question.
- Actually changed product and inquiry type and verified the old shortlist disappeared; restoring the original combination restored it. Actually selected a model and used Clear Selection, confirming zero checked boxes. Mobile G946/G938 selection also reached the correct visible context.
- Final public bundle: 98 pages, 3125 links, 1341 asset references, zero issues; changed published files match source. git diff --check passed.
- All nine previous uncommitted paths remain byte-identical, verified by SHA-256. Comparison title/meta/canonical and specification table were compared with the starting version and retained.

Evidence: /Users/lily/Documents/New project 3/outputs/talrivo-sample-shortlist-20261113/ . Screenshots include shortlist-desktop.png and inquiry-shortlist-mobile.png. Only this batch's generated public directory was removed after checks; owned preview server and tab were closed.

## Scope and next review

This makes an existing commercial landing page usable for an actual comparison request, following the research principle of providing original buyer utility. It is not proof of more Google clicks, rankings or qualified leads. No fresh Search Console data or post-publication performance evidence was obtained. Existing consent-based resource clicks remain distinct from an actual submitted inquiry.

Primary sources checked:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
