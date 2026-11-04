# Connection guide: organic entry review

Prepared November 4, 2026. This is an internal change and measurement record,
not a traffic result. No commit, push or indexing request was made by the agent.

## Evidence and choice

Source: `/Users/lily/Downloads/talrivo.com-Performance-on-Search-2026-10-31.xlsx`,
opened read-only with openpyxl. The `过滤器` sheet says Web (text-based), past
three months. The `图表` sheet contains July 29-October 28, 2026, not November data.

The `网页` sheet, row 9, reports the existing 2.4G vs Bluetooth guide at 1 click,
485 impressions, 0.21% CTR (1 / 485), and average position 16.27 for that full
period. This is a ranking-and-relevance opportunity, not proof of a title defect.
The separate query table contains connection-comparison searches; it does not
identify which page received each query. No query/page join or keyword-volume
claim is inferred from separate export tabs.

The report predates the October 29-30 product-copy revisions and today's edits.
It cannot measure their results. The last recorded edit to this guide was
October 22. Keep the product/category titles in their existing observation phase.

Reproduce this source row, without changing the workbook:

```python
import openpyxl
w = openpyxl.load_workbook(
    '/Users/lily/Downloads/talrivo.com-Performance-on-Search-2026-10-31.xlsx',
    read_only=True, data_only=True)
print(list(w['过滤器'].values))
print(w['图表']['A2'].value, w['图表']['A93'].value)
print([c.value for c in w['网页'][9]])
```

## Implementation hypothesis

Make the existing guide answer connection questions more directly, rather than
adding a near-duplicate page or repeatedly changing search metadata.

- Preserve title, description, H1, canonical, robots, model specifications and FAQ.
- Replace the packaging/RFQ-heavy comparison with six practical questions about
  connection, latency evidence, voice chat, PS5, phones and multiple modes.
- Clarify that Bluetooth also uses the 2.4GHz band; cite Bluetooth SIG. Retain
  Microsoft/PlayStation sources and exact-device verification boundaries.
- Surface the existing 86-second physical G938 setup demo and the existing blank
  English sample worksheet. Completed Bluetooth pairing is not clearly visible;
  the clip is not a latency, microphone-quality or universal compatibility test.
- Consolidate repeated definitions, model cards and supplier reminders. Parsed
  main content is 1,913 words versus 3,338 before, a 42.69% reduction; section
  count is 8 versus 17. Word counts use HTMLParser text inside `main` and the
  same `\b[\w-]+\b` token rule before/after, excluding metadata and JSON-LD.
- Keep model links in the specification table and four focused related guides.
  Do not add a price, compatibility promise, rating or new Product/VideoObject.
- Scope CSS to this guide; keep mobile tables scrollable and keyboard-focusable,
  put the answer before the hero image, and give anchor headings a top margin.
- Update only this guide's Article revision and sitemap date. The llms entry is
  descriptive documentation, not an asserted Google ranking mechanism.

## Observation

D0 is verified live deployment, not this file date or a local preview. First
verify the live content and then the crawled/indexed version. At about D+7,
check crawl/display problems; at D+28 compare matching windows for this URL,
device, country and disclosed queries, accounting for average-position changes.
Keep sparse counts and query coverage visible. Do not infer causality from a
before/after CTR change. Search clicks, demo opens, downloads and real inquiries
are separate measures; this batch does not alter analytics or consent behavior.

## Local verification

- All 26 Node workflow checks and all four public-link unit tests passed.
- Source audit: 98 pages, 3,061 links, 1,152 assets, no reported issues.
- Browser checks at 1440, 1024, 390 and 320 CSS pixels found no page overflow,
  missing visible images or script errors. All three tables could be scrolled
  and focused on mobile. Desktop and mobile screenshots were inspected.
- Actual clicks reached both answer anchors, the G938 watch page and the contact
  form with Wireless Gaming Headset Series / Model comparison selected.
- The English worksheet downloaded and matched the repository file byte for byte.
  External requests were blocked during browser testing; zero POSTs were sent.
- Titles, descriptions, FAQ/Article consistency and factual limits are guarded
  in `scripts/test-buyer-guide-copy.mjs`. `git diff --check` passed.

## Sources checked

- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://www.bluetooth.com/learn-about-bluetooth/tech-overview/
- https://support.microsoft.com/en-us/windows/hardware/bluetooth/configuring-bluetooth-le-audio-quality-settings-on-windows-11
- https://blog.playstation.com/2020/11/09/ps5-the-ultimate-faq/
