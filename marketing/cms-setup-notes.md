# TALRIVO CMS Setup Notes

The site now includes a Decap CMS admin entry at:

`https://talrivo.com/admin/`

## Current status

The admin files are prepared, but GitHub login still needs OAuth setup before the browser editor can publish content.

## What the CMS can manage

- Insight article drafts in `content/insights`.
- Product video notes in `content/videos`.
- Upload images to `assets/uploads`.
- Keep SEO title, description, buyer question, product model and source evidence in fixed fields.

## Video rule

Do not upload large videos directly to GitHub.

Recommended video hosting:

- YouTube
- Vimeo
- Cloudflare Stream
- Alibaba Cloud OSS
- Tencent Cloud COS

In the CMS, store the video URL, thumbnail image, related product and short caption.

## GitHub OAuth requirement

Decap CMS needs GitHub authentication. Practical options:

1. Use Netlify Identity and Git Gateway.
2. Use a small custom OAuth proxy.
3. Keep the CMS files ready and continue publishing through Codex until OAuth is configured.

For the current GitHub Pages setup, option 3 is safest until the content workflow is stable.

## Publishing workflow

1. Add an article or video note in `/admin/`.
2. Keep status as `draft` while editing.
3. Add product evidence before publishing.
4. Use the article as the source for LinkedIn posts.
5. Ask Codex to convert approved CMS drafts into final HTML pages if no static-site generator is added yet.

## Important limitation

The current website is static HTML. Decap CMS can save structured Markdown content, but the site still needs a build step or manual conversion to turn Markdown drafts into live HTML pages.

Recommended next phase:

- Add a simple content build script that converts `content/insights/*.md` into `/insights/{slug}/index.html`.
- Update `/insights/index.html` automatically from published content.
- Update `sitemap.xml` automatically.
