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

## Follow-up: align video sitemap with actual watch pages

The prior correction was committed by the user as 6461e5c. Working tree was clean at the start of this follow-up. A static mapping of every video-sitemap player to its landing-page HTML found five product-page entries whose listed videos are only external links, not matching initial-HTML players. G938 embeds the phone demonstration, not the two films listed for its product URL.

Retain the three existing watch pages with actual matching players: G936 target-device reference, G938 phone setup, and the local assembly clip. Remove five product-page video-sitemap entries only; retain every product page, video link, product schema and all 98 ordinary sitemap URLs. No video is deleted. Add a regression check requiring each listed video player/content URL to match an initial-HTML media source on its actual landing page.

This aligns video discovery metadata with current content; it does not guarantee video indexing or fix an established cause of ordinary Web CTR. The earlier Search Console observation of 8 pages/10 videos describes the pre-change sitemap, not a new Google result.

Sources:
- https://developers.google.com/search/docs/appearance/video
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps

No Search Console records were removed or resubmitted. No indexing request, commit, push or publication was performed.

## Follow-up: index-coverage caution and sample-entry gap

The user committed the video-sitemap alignment as e534e55; working tree was clean. The signed-in index-coverage summary displayed an October 23 update date, 52 indexed and 26 excluded known URLs. The crawled-not-indexed example list includes nine URLs, including two TXT worksheets, sitemap.xml and six HTML pages. It cannot be compared directly with the current 98-page sitemap or treated as a current count of missing products. Individual URL inspection is needed before changing any indexing directive; the microphone page already has impressions in the newer performance export. No robots, canonical or noindex setting was changed.

A current-file navigation check found G946 missing from the sample-request gaming shortlist, despite its priority placement in the wireless category. Add one G946 choice with the two already confirmed package configurations, retaining each selected configuration through the existing contact reference parameter. Preserve all six earlier choices, stable title/description, all other audio categories and FAQ. Update only the sample-page revision and corresponding documentation. This improves sample discovery and inquiry continuity, not a demonstrated cause of low search CTR or guaranteed traffic growth.

No new GSC performance period or post-release traffic improvement was established.

## Receiver-guide relevance follow-up

The sample-entry update was committed by the user as 2d7bd3c. G946 assets remain pending; this batch does not edit that model. The current receiver guide title asks USB-A versus USB-C, but its hero/social image showed a generic G941 headset. Reuse the existing supplied G938 receiver/adapter/cable reference, with verified intrinsic dimensions 1117 by 1110. Lead with the selection answer: match the receiver and host port, then verify playback and microphone behavior. Keep the selected-package and compatibility limits explicit. Simplify the model-comparison heading to match the models already listed.

Search title, description, H1, URL, FAQ, model specifications, player/download destinations and inquiry routes remain unchanged. Align the Article image and revision, social images, sitemap date and llms documentation. This is a relevance and presentation hypothesis; no new keyword-volume data, fresh indexing status or traffic gain is established.
