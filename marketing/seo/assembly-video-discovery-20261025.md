# Assembly video discovery batch - October 25, 2026

## Decision

Use the supplied workshop footage to answer an actual supplier-selection question:
"What assembly work can I see before I order a gaming headset sample?"
Do not publish another generic factory article or repeatedly change the recently
updated manufacturer, wireless and model search titles.

## Implemented locally

- New video-primary page: `/videos/gaming-headset-assembly/`.
- The original HTML contains one self-hosted HTML5 video with controls, an actual
  workshop poster, metadata-only preload and no autoplay. The original 71-second
  MP4 was remuxed losslessly with fast-start metadata; YouTube remains an alternative.
  No action is required to create the player; playback requires the visitor's action.
- Category, sample, customization, quality-review, supplier-guide and resource
  directory links connect the video to model selection and sample review.
- The dedicated page is listed in both the page and video sitemaps. The video
  sitemap uses the existing workshop poster, matching MP4 content URL and the
  verified local clip duration.
- Original quality-review section anchor remains available for old links.
- Inquiry links preserve `reference=g935-assembly` without assuming a wired or
  wireless version. The reference label now says assembly and finishing.
- Claims that this specific clip shows packing were narrowed across linked pages.
- The llms.txt entry is kept consistent as documentation, not treated as a Google
  ranking lever or a special AI submission mechanism.

## Evidence and limits

The supplied local MP4 was inspected using `/usr/local/bin/ffmpeg`: 71 seconds,
1280 x 720, 24 fps. The source review contact sheet is at
`/Users/lily/Documents/New project 3/output/g935-assembly-source-review-20261025.jpg`.
Visible stages include headband material preparation and routing, inner-layer
positioning, support brackets, alignment, fastening, module and earcup/headband
assembly, manual finishing and completed headsets on racks. The closing product
presentation is not assembly proof.

The video does not establish a complete packing procedure, inspection results,
capacity, certification or which connection version a buyer will receive.
Do not treat sampled contact-sheet timestamps as verified chapter boundaries.

The user supplied the published URL `https://youtu.be/1KQfLCmMhE4`.
The original YouTube upload date and hosted duration could not be independently
verified during this batch (web fetch unavailable; direct request timed out).
Do not invent them from the local file modification date. VideoObject rich-result
markup is deferred until the upload date is verified; the optional video-sitemap
publication date is omitted. The self-hosted video, required video-sitemap fields and ordinary
WebPage/Breadcrumb metadata do not depend on that date. The local player avoids
the repeated YouTube redirect failure observed in the isolated test browser.

## Local validation

- All 16 Node checks in the deployment validation block passed, including the new
  assembly-watch regression test; all four Python link-auditor unit tests passed.
- Source and generated public bundle audits: 61 pages, 1,975 links, 573 asset
  references, no reported issues. Public bundle generation passed.
- Responsive checks at 1440, 820, 390 and 320 px: no horizontal overflow, broken
  images or overflowing button text. Video metadata reports 71 seconds, 1280 x 720.
- Actual local browser playback advanced beyond 0.5 seconds, decoded 21 frames and
  reported no media error. This is local playback, not a deployed-host test.
- Opening the question CTA preserved the collection and
  `G935 assembly and finishing process: https://youtu.be/1KQfLCmMhE4` reference.
  No form was submitted and no email was sent.
- Demuxed audio/video packet SHA-256 matches between source and fast-start copy:
  `9900531981d1a1223ee69d0c568df563e5b462fca28c3929a1a45868e5f2bebb`.
- Changed JavaScript syntax checks and `git diff --check` passed.

## Release and measurement

Local changes are not a confirmed deployment, crawl, video index or AI citation.
After the user's commit and successful Pages deployment, check the new live URL,
its local video and thumbnail, the deployed sitemap, and IndexNow workflow output.
Submission success is not indexing success.

Record the first verified live date as D0. Compare complete periods rather than
attributing immediate movements to this batch:

- Search Console: the new URL's impressions, clicks, CTR and search type Video;
  separate assembly/manufacturer/private-label queries from model-only queries.
- Existing category pages: non-model buyer-query impressions and clicks, with
  country, device and position held in view. Do not evaluate CTR in isolation.
- Bing AI Performance: cited pages and citations are visibility, not visits.
- Website inquiries: distinguish a video reference or question from an actual
  submitted inquiry. Opening a form must not be counted as a lead.

No traffic gain, new crawl or citation is confirmed by local validation.

## Primary references

- https://developers.google.com/search/docs/appearance/video
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/ai-features

Google's video guidance supports a dedicated watch page with a prominent,
discoverable player and consistent video information. It does not guarantee
video indexing. AI guidance favors helpful original evidence, not GEO hacks.
