# TALRIVO CMS and GEO Publishing Roadmap

This document is the practical next-step plan for turning TALRIVO from a static website into a repeatable content publishing system for SEO, GEO, LinkedIn and sales follow-up.

## Current Decision

Do not move TALRIVO to Vercel yet.

The current GitHub Pages site is already live, verified in Google Search Console and stable. The next priority is not a new hosting platform. The next priority is a repeatable content workflow:

- publish buyer-intent articles;
- publish product video notes without uploading large videos to GitHub;
- reuse each website topic for LinkedIn;
- collect real buyer questions and product evidence;
- improve Google indexing and AI-search visibility over time.

## Current Website CMS Status

Already prepared in the TALRIVO repository:

- `/admin/index.html`
- `/admin/config.yml`
- `/content/insights/`
- `/content/videos/`
- `/marketing/cms-setup-notes.md`
- `/marketing/content-publishing-guide.md`

Important limitation:

The current site is static HTML. Decap CMS can save Markdown drafts, but the site still needs a build step to convert Markdown content into live HTML pages.

## Recommended Path

### Phase 1: Keep GitHub Pages

Keep the current website online exactly as it is.

Use Codex or GitHub Desktop to publish important pages until the content structure is stable.

### Phase 2: Add a Simple Content Builder

Add a small build script later that:

- reads `/content/insights/*.md`;
- creates `/insights/{slug}/index.html`;
- updates `/insights/index.html`;
- updates `sitemap.xml`;
- keeps canonical URLs, meta descriptions and structured data consistent.

This is the missing bridge between "backend draft" and "live website page".

### Phase 3: Add Video Publishing Rules

Do not upload large videos directly to GitHub.

Use the CMS only to store:

- video title;
- hosted video URL;
- thumbnail image;
- related product model;
- short summary;
- LinkedIn caption;
- product page link.

Recommended hosting options:

- YouTube unlisted or public;
- Google Drive for internal review only;
- Cloudinary;
- Alibaba Cloud OSS;
- Tencent Cloud COS.

### Phase 4: Only Consider Vercel Later

Consider Vercel only if TALRIVO needs:

- automatic build previews;
- a more advanced content build process;
- API routes;
- stronger CMS integration;
- a future Next.js rebuild;
- more frequent article publishing by non-technical users.

Until then, GitHub Pages is enough.

## Weekly Publishing Workflow

Every week, choose one product or buyer question.

Create one content package:

1. Website article
2. Product page internal link
3. LinkedIn post
4. Sales email paragraph
5. Inquiry tracking note

The goal is not to publish many weak pages. The goal is to publish pages that match real buyer search intent.

## Article Draft Template

Use this structure for every SEO/GEO article:

```markdown
---
title:
slug:
date:
status: draft
description:
category:
related_model:
hero_image:
buyer_question:
source_evidence:
linkedin_post:
---

## Buyer Question

Write the real customer question or search intent here.

## Short Answer

Give a direct answer in 2 to 4 sentences.

## What Buyers Should Compare

- Connection type
- Microphone structure
- Comfort and materials
- Battery or cable design
- Logo and packaging options
- Sample confirmation points

## Product Evidence

Use real product photos, sample details or confirmed specifications.
Do not invent data.

## Recommended TALRIVO Direction

Explain which TALRIVO product category or model fits this buyer need.

## Next Step

Invite the buyer to send target market, quantity range, logo requirement and sample plan.
```

## Video Draft Template

```markdown
---
title:
slug:
date:
status: draft
video_url:
thumbnail:
related_model:
related_product_url:
summary:
key_points:
  - 
  - 
  - 
linkedin_caption:
---

## Video Notes

What does the video show?

## Buyer Use

Why should an importer, distributor or OEM/ODM buyer care?

## Follow-up CTA

Ask the buyer to request sample details, logo position or packaging options.
```

## First Content Priorities

Priority 1:

- G941 tri-mode wireless gaming headset
- 2.4G wireless gaming headset selection
- wired vs wireless gaming headset comparison
- gaming headset sample checklist

Priority 2:

- TWS earbuds product line planning
- Bluetooth speaker buyer checks
- Type-C earphone accessory channel guide
- OEM/ODM logo and packaging preparation

## What To Avoid

- Do not publish prices on public product pages.
- Do not add fake reviews or ratings.
- Do not write many generic AI articles.
- Do not mix TALRIVO with old NR/Nanrui social accounts if the brand message becomes confusing.
- Do not upload large raw videos into the GitHub repository.

## Best Next Implementation

When the TALRIVO repository is writable again, add:

- `tools/build-content.mjs`
- `content/insights/example-gaming-headset-buyer-guide.md`
- `content/videos/example-g941-product-video.md`
- an automatic `insights/index.html` update step
- sitemap update logic

This gives TALRIVO a real publishing workflow without moving away from GitHub Pages.
