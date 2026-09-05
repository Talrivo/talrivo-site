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

After deployment, verify page views and `generate_lead` in GA4 Realtime and DebugView. Mark `generate_lead` as a key event if it is not already enabled in the property.
