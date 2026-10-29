# Product-led search copy revision

Prepared on October 29, 2026. Local implementation, not a deployment or traffic result.

## Authorization and scope

The user authorized implementing the findings from the October 29 Google and headset-brand research. This replaces the earlier hold on the G938 title and starts a new copy-revision observation phase. The October 22 description note remains historical; this is not a continuation of an isolated description test.

Five existing pages are changed:

| Page | Change |
| --- | --- |
| G936 at `/gaming-headsets/g936-lightweight/` | Lead the title, heading and introduction with wireless gaming and fabric ear cushions. Keep the 40mm driver, 800mAh battery, listed 20ms latency and lights-off runtime in the specification content. |
| G938 at `/gaming-headsets/g938-wireless/` | Use `Tri-Mode Wireless Gaming Headset, 53mm | G938` instead of the compressed connection/sourcing title. Lead with three connection options and the detachable mic. |
| G941 at `/gaming-headsets/g941-tri-mode-anc/` | Rewrite the description and introduction around the product, connections and microphone. Preserve the existing title, canonical and version boundaries; do not introduce the unconfirmed steel-wire version or stronger ANC claims. |
| `/wired-gaming-headsets/` | Replace `RGB OEM` in the title with `RGB Models`. Simplify the introduction while preserving the distinction between USB lighting and USB audio, and separately purchased adapters. |
| `/oem-odm/` | Lead with headset, logo, color, retail packaging and sample options. Keep selected-model availability and separate engineering feasibility review in the visible content. |

The manufacturer and wireless collection titles, G939 title, existing image assets, inquiry keys, canonical paths, FAQs, listed specifications, compatibility limits and approved accessory scope remain unchanged. No new price, MOQ, delivery, certification, review, rating or performance-test claim is added.

## Consistency

- Search, Open Graph and Twitter titles/descriptions agree on each changed page.
- Existing WebPage, CollectionPage or Service descriptions agree with the search description. CreativeWork revision dates and the five sitemap dates use October 29; no unsupported dateModified is added to Service.
- The five llms entries describe the current product-first scope. llms is documentation, not a promised ranking mechanism.
- Sample buttons retain their existing product and inquiry parameters. Checklist links still lead to checklists, not a mislabeled sample form.
- Tests in `scripts/test-buyer-entry.mjs` check the new copy, metadata agreement, schema, dates, routes and factual boundaries. Existing procurement-title guards remain in place.

## Release and observation

1. D0 is verified live deployment, not this document date or a Git commit. No commit, push, indexing request or paid campaign is performed by this patch.
2. The October 24 export covers a period ending October 22. It predates this batch and cannot measure this batch's results. No October 29 authenticated Search Console report was obtained during the research.
3. After publishing, check live title, description, heading, canonical and sample routes. Separately check the indexed version; an HTTP 200 does not prove Google adopted the copy.
4. At approximately D+7, check crawl/display problems, not short-term CTR winners. At approximately D+28, compare equal windows by query, page, country, device and similar position where data permits.
5. Keep model queries separate from procurement and product-feature queries. Show sparse counts and incomplete query coverage rather than treating missing rows as zero demand.
6. This batch changes titles and visible copy together. It is not a randomized A/B test, and neither a higher CTR nor temporal coincidence proves the copy caused a change.
7. Track procurement-related search clicks, actual visits and qualified inquiries separately. Do not call page views, downloads, form opens or email-button clicks confirmed leads.

## Verification completed locally

- All 24 Node checks from the existing workflow passed, including model pages, buyer copy, media references, contact routes, contact actions and offline indexing/live-site tests. The four Python public-link tests passed.
- Source and generated public-bundle audits each covered 98 pages, 3,022 links and 1,128 asset references with no reported issues. The Pages build completed successfully.
- Isolated Playwright checks covered all five changed pages at 1440 x 1080 and 390 x 844. Hero images loaded, headings and buttons fitted their containers, and no document-level horizontal overflow or overlapping hero buttons was detected. Screenshots were inspected.
- Each hero sample/customization link opened the contact form with the expected product and inquiry type. External requests were blocked; no inquiry was submitted. This does not verify third-party services, email delivery or live deployment.
- Screenshots are retained under `/Users/lily/Documents/New project 3/output/playwright/` with filenames containing `copy` and `20261029`.

## References

- Google title guidance: https://developers.google.com/search/docs/appearance/title-link
- Google snippet guidance: https://developers.google.com/search/docs/appearance/snippet
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Local research: `/Users/lily/Documents/New project 3/outputs/seo/2026-10-29-google-headset-ctr-research.md`

These changes test buyer clarity and factual differentiation. They do not establish higher CTR, ranking, indexing speed or inquiry volume.
