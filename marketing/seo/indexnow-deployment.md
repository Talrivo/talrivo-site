# IndexNow deployment notifications

Implemented October 23, 2026. This is update discovery plumbing, not a diagnosed
cause or a promised remedy for the observed decrease in AI citations.

## What happens

After a successful main-branch push deploy, GitHub Actions checks the entire push
commit range. It notifies IndexNow only about changed public HTML pages listed in
the current or previous sitemap, including removed pages from the previous map.
Marketing notes, scripts, admin pages, private paths and arbitrary URLs are not
submitted. A rename is treated as a deletion plus an addition.

The first push containing the ownership key also notifies five priority pages:
home, gaming headsets, wireless headsets, USB audio guide and microphone guide.
This is a one-time bootstrap, not a daily whole-site submission.

Before any notification, the script verifies the key at the deployed HTTPS URL.
The text file is intentionally public, as required by the protocol. It is not an
account password, a Google verification token or a customer-data export.

The notification sends only the site host, ownership key, key URL and public page
URLs. It sends no inquiry, email, visitor identifier or analytics payload.

## Run status and limits

- Default CLI behavior is preview only. A real POST requires `--submit`.
- Automatic submission runs only after a successful push deployment to main.
- A manually dispatched deployment does not automatically resubmit URLs.
- HTTP 200 means the notification was received, not that a page was indexed.
- HTTP 202 means verification is pending, not that indexing is complete.
- The key check retries three times. HTTP 429 and server errors retry up to three
  POST attempts. Other errors or timeouts remain visible in the workflow log.
- Notification failure does not cancel a successful website deployment. Review
  the warning rather than treating a green deployment as a confirmed notification.
- An unavailable old Git revision causes a warning, not a whole-site fallback.
- CSS, JavaScript, image-only and PDF-only changes do not trigger submissions in
  this first implementation. Sitemap-only changes also do not notify every page.
- This protocol targets participating search engines such as Bing. It is not a
  Google URL submission mechanism and does not promise AI citations or clicks.

## Preview and verification

From the repository root:

```sh
node scripts/test-indexnow.mjs
node scripts/notify-indexnow.mjs --bootstrap
```

The preview sends no network request. After the first push, inspect the GitHub
Actions step named "Notify IndexNow after deployment". Check the logged URL list
and response status. If the key has not propagated yet, retry the exact commit
range after the key becomes reachable; do not repeatedly submit the whole site.

Do not infer that an HTTP response confirms Bing has crawled the new page. Use
Bing URL Inspection separately to check the indexed version and actual crawl
state. Keep citation trends, search clicks, referral visits and qualified
inquiries as separate measures.

Official protocol references:
- https://www.indexnow.org/documentation
- https://www.indexnow.org/faq
