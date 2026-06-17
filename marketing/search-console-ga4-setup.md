# TALRIVO Search Console and GA4 Setup

This file is the account-side setup checklist for measuring SEO, GEO content and inquiry quality.

## Goal

Track which TALRIVO pages bring visitors, which topics create inquiries and which social posts or email links produce useful buyer conversations.

## Google Search Console

Recommended property:

- Domain property: `talrivo.com`
- Backup URL-prefix properties:
  - `https://talrivo.com/`
  - `https://www.talrivo.com/`

Setup steps:

1. Open Google Search Console.
2. Add `talrivo.com` as a domain property.
3. Verify with DNS at the domain provider.
4. Submit sitemap: `https://talrivo.com/sitemap.xml`.
5. Use URL Inspection for these priority pages:
   - `https://talrivo.com/`
   - `https://talrivo.com/gaming-headsets/`
   - `https://talrivo.com/wireless-gaming-headsets/`
   - `https://talrivo.com/sample-request/`
   - `https://talrivo.com/contact/`
   - `https://talrivo.com/insights/`

## Weekly Search Console Review

Record these items every week:

- top queries;
- top pages;
- pages with impressions but low clicks;
- pages discovered but not indexed;
- countries with impressions;
- product or question terms that deserve a new page.

Useful checks:

- If a page gets impressions but low clicks, improve the title and meta description.
- If a topic gets impressions from many countries, consider a regional article or translated summary.
- If a query contains a model name, strengthen the model page and link to the sample request page.

## GA4 Setup

Create one GA4 property for TALRIVO.

Required items from GA4:

- Measurement ID, formatted like `G-XXXXXXXXXX`.
- Data stream URL: `https://talrivo.com`.

Website-side next step:

- Add the GA4 tag to the `<head>` after the real Measurement ID is available.
- Do not add a fake Measurement ID to the website.

## Recommended GA4 Events

Track these events first:

- `generate_lead`: inquiry form submitted.
- `select_product`: homepage product card or catalogue product selected.
- `click_contact`: contact button clicked.
- `view_item`: product page viewed.
- `view_article`: insight article viewed.

The homepage form already sends source context in the inquiry email. Use GA4 later to match traffic behavior with inquiry quality.

## UTM Naming

Use lower-case campaign names with underscores.

Format:

`utm_source=linkedin&utm_medium=social&utm_campaign=g941_product_post`

Recommended sources:

- `linkedin`
- `facebook`
- `email`
- `whatsapp`
- `google`

Recommended mediums:

- `social`
- `outreach`
- `paid`
- `referral`

## Monthly Review

At the end of each month, update:

- `marketing/seo/keyword-intent-matrix.md`
- `marketing/geo-evidence-log.md`
- `marketing/social-publishing-calendar.md`
- `marketing/conversion-tracking-notes.md`

Decision rule:

- Keep publishing topics that produce impressions, clicks or real inquiry questions.
- Stop expanding topics that have no search intent, no product evidence and no buyer use case.
