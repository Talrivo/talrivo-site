# Public hostname check: October 24, 2026

## Current observations

- `https://talrivo.com/` returned HTTP 200 with certificate validation enabled.
- The apex certificate presented CN and SAN `talrivo.com`, not `www.talrivo.com`.
- `https://www.talrivo.com/` failed hostname validation. The server presented a GitHub wildcard certificate (`*.github.io`) rather than a certificate covering `www.talrivo.com`.
- `http://www.talrivo.com/` returned HTTP 301 to `https://talrivo.com/`. This HTTP redirect does not resolve a certificate mismatch on an HTTPS visit: TLS is checked before the browser can read a redirect.
- Public DNS lookup returned `www CNAME talrivo.github.io` and the four GitHub Pages IPv4 addresses. The apex also returned all four expected addresses. Nameservers were `dns25.hichina.com` and `dns26.hichina.com`.
- A direct authoritative CAA query returned no answer records. It did not show an explicit CAA restriction; it does not establish every aspect of certificate issuance.
- No matching local hosts-file override was found. A second fetch service also could not access the HTTPS www URL, but did not provide a detailed TLS diagnosis. These checks are not a complete worldwide edge test.

This points to missing www HTTPS coverage at GitHub Pages, not a demonstrated need to rewrite HTML or replace the currently correct DNS records.

## Authenticated dashboard follow-up

On October 24, the user opened the Pages settings and signed in. A read-only inspection confirmed:

- Publishing source: GitHub Actions. Custom domain: `talrivo.com`.
- The dashboard initially displayed `DNS Check in Progress`, then changed to `DNS check successful` after a refresh.
- Certificate status: `1 of 3 Certificate Requested: Authorization verification pending.` The previous message said a DNS change was detected and a new certificate was being requested; this does not establish who made that change or when.
- The Enforce HTTPS option remained checked but disabled while issuance was incomplete. The page said provisioning may take up to 15 minutes, while the disabled control advised allowing 24 hours. Neither message establishes a guaranteed completion time.
- A repeat live check still passed the canonical HTTPS homepage and HTTP www redirect, but both HTTPS www checks failed with `ERR_TLS_CERT_ALTNAME_INVALID`. DNS success is not proof that the certificate is issued or that www is repaired.
- A repeat query to `dns25.hichina.com` returned no apex AAAA or CAA answer records. The www CNAME remained `talrivo.github.io`; querying www CAA returned the CNAME, not a CAA restriction.

No domain, DNS, HTTPS, deployment or account setting was changed during this follow-up.

### Verification after activation

During the same session, the dashboard advanced to `3 of 3 Certificate Active`. GitHub warned that global availability may take another 30 minutes to one hour. The provisioning notice then cleared and Enforce HTTPS was enabled and still checked, without any setting change by the assistant.

The next `node scripts/check-live-site.mjs` run exited successfully with all four checks passing under normal certificate validation:

| Request | Result |
| --- | --- |
| `https://talrivo.com/` | HTTP 200 |
| `https://www.talrivo.com/` | HTTP 301 to `https://talrivo.com/` |
| `https://www.talrivo.com/wireless-gaming-headsets/` | HTTP 301 to the identical path on `https://talrivo.com` |
| `http://www.talrivo.com/` | HTTP 301 to `https://talrivo.com/` |

An additional check in the user's signed-in Chrome opened `https://www.talrivo.com/wireless-gaming-headsets/` in a new tab and reached `https://talrivo.com/wireless-gaming-headsets/` with the expected product page content and no security interstitial. The Pages settings tab was left open. No credentials were read or entered by the assistant.

The www TLS mismatch is resolved on the tested connections. This is not a worldwide propagation test or evidence of an indexing, CTR or traffic increase.

## Safe next action

Keep the canonical domain as `talrivo.com` and Enforce HTTPS enabled. The certificate has activated and the live checks now pass; do not remove and re-add the domain or change working DNS records. If an older browser or another location still reports an error, allow the propagation interval shown by GitHub and verify again without bypassing certificate validation. No scheduled recheck has been created; a future check requires an active session or a separately authorized automation.

Do not add a second line to the CNAME file, turn off HTTPS, use an insecure certificate bypass or delete working apex DNS records as a workaround. This site deploys through a custom Actions workflow; editing the CNAME file does not configure the GitHub Pages custom-domain setting.

If DNS is confirmed and GitHub still cannot issue the correct certificate, use the dashboard's actual error and official troubleshooting procedure. Removing and re-adding a custom domain may trigger reissuance, but could interrupt the working main site; it is not performed automatically in this batch.

## Release check

`node scripts/check-live-site.mjs` makes four fixed, read-only HEAD requests: canonical HTTPS homepage, www HTTPS homepage, www HTTPS product path and www HTTP homepage. It requires valid TLS and permanent redirects to the same canonical path. It neither authenticates nor changes configuration. It does not follow arbitrary redirects.

`node scripts/test-live-site.mjs` is offline and uses injected responses only. No live requests are made by this test.

The existing deployment workflow runs the live check after deployment and emits a warning if any connection or redirect fails or cannot be verified. A network timeout is labeled unverified, not proof of downtime. A failed check does not undo a successful deployment or fix the certificate. There is no scheduled monitor or background task in this batch.

The main non-www site remains the public contact and campaign destination. There is no evidence here that this fault explains all low CTR or that correcting it guarantees traffic growth. After repair, require all checks to pass with certificate validation still enabled before calling www fixed.

## Official references

- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
