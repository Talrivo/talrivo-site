# TALRIVO Conversion Tracking Notes

The homepage inquiry form now includes hidden source fields. These fields are added to the Web3Forms submission and to the email fallback message.

## Fields captured

- submitted page URL;
- page title;
- current referrer;
- first landing page;
- first referrer;
- UTM source;
- UTM medium;
- UTM campaign;
- UTM term;
- UTM content;
- selected product source, such as homepage product card or catalogue dialog.

## How to use

When an inquiry email arrives, check the "Source context" section.

Use it to answer:

- Which page generated the inquiry?
- Did the buyer come from LinkedIn, future official social content, Google or direct visit?
- Which product card or catalogue dialog did the buyer click before submitting?
- Which UTM campaign brought the buyer to the site?

Use the findings to update:

- `marketing/geo-evidence-log.md` when a buyer question can become content evidence;
- `marketing/social-publishing-calendar.md` when a social topic produces useful visits or inquiries;
- `marketing/seo/keyword-intent-matrix.md` when the inquiry reveals a new search intent.

## Suggested UTM links

LinkedIn G941 post:

`https://talrivo.com/gaming-headsets/g941-tri-mode-anc/?utm_source=linkedin&utm_medium=social&utm_campaign=g941_product_post`

Future official social G941 post:

`https://talrivo.com/gaming-headsets/g941-tri-mode-anc/?utm_source=future_social&utm_medium=social&utm_campaign=g941_product_post`

Gaming headset evidence checklist:

`https://talrivo.com/insights/gaming-headset-product-evidence-checklist/?utm_source=linkedin&utm_medium=social&utm_campaign=headset_evidence_checklist`

Sample request guide:

`https://talrivo.com/sample-request/?utm_source=email&utm_medium=outreach&utm_campaign=sample_request_followup`

## Google Analytics

- GA4 Measurement ID: `G-ZLN0CNB9PZ`.
- Public pages load `/analytics.js`.
- Analytics storage is denied by default until the visitor accepts it.
- A successful homepage or contact RFQ submission sends the recommended GA4 event `generate_lead`.
- Failed or incomplete form submissions do not send `generate_lead`.
- Consented email, WhatsApp and WeChat controls send `contact_click`, with `contact_method`, `contact_location` and `page_path`. No email address, message text or query parameters are included in this event.
- `contact_click` measures an attempt to start contact, not a successful inquiry. Keep it separate from `generate_lead` and from any automatically collected outbound `click` events. Backend delivery and GA4 ingestion still need live verification.

After deployment, verify page views and `generate_lead` in GA4 Realtime and DebugView. Mark `generate_lead` as a key event if it is not already enabled in the property.

## Buyer resources: October 24, 2026

The microphone guide, packaging guide, import-documents guide and sample-request page now use `buyer_resource_click` for selected main-content links. It runs only after analytics consent, stops on withdrawal and does not block navigation or downloads.

- `resource_type`: `mic_script`, `packing_checklist`, `certificate_match`, `mic_recording_sheet`, `packing_review_sheet`, `red_document`, `rohs_document`, `model_details`, `sample_guide` or `inquiry_form`.
- `page_path`: source pathname only.
- `destination_path`: same-origin destination pathname only.
- No link text, message, email address, query string or arbitrary fragment is included in this custom event payload.

A resource click is not a finished download, an inquiry or a search click. Do not mark it as a lead, add it to `generate_lead`, or add it to enhanced-measurement `click` / `file_download` counts. Enhanced measurement may observe some of the same actions.

After publication, verify one consented action in Realtime / DebugView. Create event-scoped custom dimensions for `resource_type` and `destination_path` if needed for Explorations; this code change does not configure the GA4 property or confirm ingestion. Start observations at verified deployment, not the previous Bing export window. Non-consenting visits and tracking blockers make these counts incomplete.

Use the steps separately: Search Console impressions and search CTR; visits arriving at these guides; resource/model/inquiry-entry clicks; confirmed form acceptance and manually qualified inquiries. A low-volume change is inconclusive, not proof of improvement or failure.

The three guides also pass fixed `reference=mic-comparison-guide`, `reference=packing-checklist` or `reference=import-documents-guide` values to existing contact actions. The contact form displays a topic-specific prompt and includes the known article reference in the submission. This explicit request context needs no tracking storage, does not claim an acquisition channel, and does not replace the buyer's message. Email, WhatsApp and untagged general links retain their existing behavior.

The packaging download is a blank worksheet, not a quote or an approved contents list. All item statuses start as Not confirmed.

Implementation references: [GA4 event setup](https://developers.google.com/analytics/devguides/collection/ga4/events), [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).


## Procurement path and sample tool: November 10, 2026

The existing consent-gated `buyer_resource_click` now also covers main-content links on the gaming, wireless and wired categories, the comparison page and nine explicitly listed model-version pages. New resource types are `model_comparison` and `sample_review_guide`. Existing `model_details`, `sample_guide`, `sample_review_sheet` and `inquiry_form` remain separate. Headers, footers, unrelated destinations and external links do not create buyer-resource events; contact-channel measurement retains its existing scope.

The fill-in tool's enabled preview, download and print controls emit `sample_review_action`, with only `review_action` and `page_path`:

| review_action | Meaning | Does not establish |
| --- | --- | --- |
| preview_request | Buyer clicked Preview Review | Completed review or purchase intent |
| download_request | Buyer requested their text review | File saved/opened or completed download |
| print_request | Buyer requested print preview | Successful printing |

No buyer-entered sample ID, note, result, device, query string or form value enters these event payloads. No new storage is added. No event is emitted before consent, after withdrawal, with inaccessible consent storage, or from disabled review controls. These events are not `generate_lead` and should not be marked as lead key events or summed with successful inquiries. Enhanced-measurement clicks/downloads may overlap with existing resource events; do not add the two streams as unique people or unique actions.

After publication, verify one real consenting session in GA4 Realtime/DebugView. If reporting needs them, configure event-scoped dimensions `review_action`, `resource_type` and `destination_path` in the property. This source change does not configure GA4 or prove event ingestion. Production delivery remains unverified; local browser QA intercepted Google script loading and logged calls only in the local DOM.

Review the sequence separately: Search Console impressions/clicks -> landing-page visits -> resource or model entry -> tool action requests -> inquiry form acceptance -> manually qualified inquiry. Consent blockers and non-consenting visitors make the post-click data incomplete; these events do not explain organic CTR on their own.
