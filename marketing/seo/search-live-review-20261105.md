# Live Search Console review — November 5, 2026

Read directly from the signed-in TALRIVO domain property. Search type: Web; 28 days, October 7–November 3. This is not a post-release outcome report.

## Verified observations

- Performance: 4 clicks, 913 property impressions; displayed CTR 0.4% (4 / 913 = 0.44%). Data still ends November 3.
- The sample-checklist page has 188 impressions, zero clicks and displayed position 6.0. Its page-filtered Queries tab returned no disclosed rows after loading; no query intent can be assigned to those impressions.
- Sample checklist: indexed, successful smartphone crawl, last crawl October 22 at 17:39:06; self-canonical. Predates November 5 changes.
- G936: indexed, successful smartphone crawl, last crawl October 27 at 11:41:11; self-canonical. Predates the October 29 copy and November 5 changes. The current public page already contains the November 5 TALRIVO introduction and G938 comparison link.
- G938 Video enhancement inspection: last successful crawl November 3 at 14:22:50; four detected video items, including one unnamed item with three critical errors. Google identifies its id as https://talrivo.com/videos/g938-phone-setup-controls/#video and reports missing name, thumbnailUrl and uploadDate. Description and embed/content URL are also absent (non-critical).
- Main sitemap.xml: successfully read November 5, 98 discovered pages. video-sitemap.xml: successfully read November 3, 8 discovered pages, 10 videos.
- Two historical incorrect sitemap submissions remain: sitemap.xml with a trailing Chinese full stop (cannot fetch), and a normal G938-vs-G941 article URL submitted as a sitemap (one error). These are separate from the successful main sitemap and are not established causes of low CTR. No submission was removed or resubmitted.

## Scoped correction

The current G938 WebPage.subjectOf used an incomplete typed VideoObject reference. Reuse the complete existing video metadata from the dedicated watch page, retaining the same video id. The product page already visibly embeds this demonstration. No title, description, visible product copy, video, URL, upload date, thumbnail or performance claim is invented or changed. Add regression checks for the nested required fields and consistency with the watch page. This fixes a local structured-data defect; Google must recrawl after publication before the report can change. Rich-result eligibility does not guarantee a result or more clicks.

Official requirements: https://developers.google.com/search/docs/appearance/structured-data/video

No commit, push, publication, indexing request, analytics acceptance or inquiry submission was performed. Do not keep rewriting recent titles based on pre-release data. Record deployment and later crawl dates separately. Inspect query/page/country/device scopes before claiming the reason for low clicks.
