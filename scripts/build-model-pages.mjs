import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const review = JSON.parse(readFileSync('content/model-page-reviews.json', 'utf8'));
const imageSizes = JSON.parse(readFileSync('content/model-page-image-sizes.json', 'utf8'));
const group = process.argv[2] || 'all';
const check = process.argv.includes('--check');
if (!['all', 'gaming', 'tws'].includes(group)) throw new Error('Expected all, gaming or tws');
const context = { window: {} };
vm.runInNewContext(readFileSync('catalog.js', 'utf8'), context);
const catalogue = context.window.talrivoCatalog;
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const jsonScript = value => JSON.stringify(value).replaceAll('<', '\\u003c');

function render(model) {
  const tws = model.category === 'tws';
  const wired = model.category === 'wired';
  const family = tws ? 'TWS and Open-Ear Earbuds' : 'Gaming Headsets';
  const familyPath = tws ? 'tws-earbuds/' : 'gaming-headsets/';
  const variant = tws ? model.name : wired ? 'Wired Gaming Headset' : 'Wireless Gaming Headset';
  const name = `${model.model} ${variant}`;
  const title = model.title || `${name} | Sample & OEM Review | TALRIVO`;
  const description = model.description || `Review ${name.toLowerCase().replace(model.model.toLowerCase(), model.model)} with supplied product images, listed model data and a version-specific sample inquiry.`;
  const canonical = `https://talrivo.com/${model.page}`;
  const contact = `../../contact/?product=${encodeURIComponent(model.inquiryKey)}`;
  const specs = model.specifications;
  const modified = [review.pageRevisionDate || review.date, model.dateModified || review.date].sort().at(-1);
  const sibling = !tws && catalogue.find(item => item.model === model.model && item.category !== model.category
    && ['wired', 'wireless'].includes(item.category));
  const siblingPage = sibling && sibling.public !== false && sibling.pageStatus !== 'specification-pending'
    && (sibling.page || review.models.find(item => item.folder === sibling.folder)?.page);
  const image = imageSizes[model.folder];
  if (!image) throw new Error(`Missing image metadata: ${model.folder}`);
  const hero = image.variants.at(-1);
  const connectionAnswer = tws
    ? `This page is for ${model.model} ${model.name.toLowerCase()}. Confirm the exact Bluetooth version, earbud or headset design and selected configuration on the sample.`
    : `This page is for the ${wired ? 'wired' : 'wireless'} ${model.model} version. ${wired ? 'Do not carry over battery or receiver specifications from a wireless model.' : 'Do not assume Bluetooth pairing or wired audio through a charging port unless the selected version supports it.'}`;
  const faqs = model.faqs || [
    { question: `Which ${model.model} version does this page cover?`, answer: connectionAnswer },
    { question: `Are the ${model.model} images an approved packing list?`, answer: 'No. Supplied product images help identify the model, but accessories, colors, cables, receiver or charging case and packaging must be confirmed for the selected sample. Pictured parts are not automatically included.' },
    { question: `How can I ask about ${name}?`, answer: `Use the model-specific inquiry link and share your target devices, market and sample question. Logo, color, packaging and document needs can be discussed after the base version is clear.` },
  ];
  if (tws && !model.faqs) faqs.push({ question: `Is the listed ${model.model} runtime earbud-only playback?`, answer: 'Do not assume so. Confirm whether a listed playback or talk-time figure refers to a single charge or charging-case-assisted use, and whether ANC is on or off. The catalogue figure is not a new runtime test.' });
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name, url: canonical, description,
      dateModified: modified, image: `https://talrivo.com/${model.assets[0]}`,
      isPartOf: { '@type': 'WebSite', name: 'TALRIVO', url: 'https://talrivo.com/' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({
      '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://talrivo.com/' },
      { '@type': 'ListItem', position: 2, name: family, item: `https://talrivo.com/${familyPath}` },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ] },
  ];
  const imageMarkup = model.assets.length > 1 ? `<div class="model-gallery">${model.assets.map((asset, index) => {
    const dimensions = image.assets[index];
    const detail = model.assetDescriptions?.[index];
    const preview = dimensions.variants;
    const responsive = preview ? ` srcset="${preview.map(item => `../../${item.path} ${item.width}w`).join(', ')}" sizes="(max-width: 760px) calc(100vw - 32px), 560px"` : '';
    return `<figure><a href="../../${esc(asset)}" target="_blank" rel="noopener" aria-label="Open full-size ${esc(name)} image ${index + 1}"><img src="../../${esc(preview ? preview.at(-1).path : asset)}"${responsive} alt="${esc(detail?.alt || `Supplied ${name} product reference, view ${index + 1}`)}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" decoding="async"></a><figcaption>${esc(detail?.caption || `Supplied model view ${index + 1}.`)} <a href="../../${esc(asset)}" target="_blank" rel="noopener">View full-size image</a></figcaption></figure>`;
  }).join('\n')}</div>` : `<p><a href="../../${esc(model.assets[0])}" target="_blank" rel="noopener">View full-size ${esc(model.model)} product image</a>. Additional views can be requested with your sample question.</p>`;
  const extraSections = (model.sections || []).map(section => `    <section class="seo-section" id="${esc(section.id)}"><div class="section-heading"><div><p class="label">${esc(section.label)}</p><h2>${esc(section.heading)}</h2></div><p class="intro">${esc(section.intro)}</p></div><div class="buyer-summary">${section.items.map(item => `<div><strong>${esc(item.label)}</strong><span>${esc(item.text)}</span></div>`).join('\n')}</div></section>\n`).join('');
  return `<!DOCTYPE html>
<!-- Generated from content/model-page-reviews.json; edit the reviewed record before rebuilding. -->
<html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/assets/brand/talrivo-mark.svg" type="image/svg+xml">
  <script src="/analytics.js?v=20260911a" defer></script>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${model.indexable ? 'index' : 'noindex'}, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="https://talrivo.com/${esc(model.assets[0])}">
  <meta property="og:site_name" content="TALRIVO">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="https://talrivo.com/${esc(model.assets[0])}">
  <title>${esc(title)}</title>
  <link rel="stylesheet" href="../../styles.css?v=20261019nav">
  <link rel="stylesheet" href="../../gaming-headsets/buyer-product.css?v=20261019a">
  <link rel="stylesheet" href="../../gaming-headsets/model-pages.css?v=20261028flow">
  ${schemas.map(schema => `<script type="application/ld+json">${jsonScript(schema)}</script>`).join('\n  ')}
</head><body>
  <header class="site-header">
    <a class="brand" href="../../" aria-label="TALRIVO home"><img class="brand-logo" src="../../assets/brand/talrivo-wordmark-new-dark.png" alt="TALRIVO"></a>
    <nav class="navigation seo-nav" aria-label="Primary navigation">
      <a href="../../gaming-headsets/">Gaming Headsets</a><a href="../../bluetooth-headphones/">Bluetooth Headphones</a><a href="../../tws-earbuds/">TWS</a>
      <a class="nav-action" href="${contact}&amp;inquiry=quick-question#inquiry-form">Ask a Product Question</a>
    </nav>
  </header>
  <main class="seo-page model-page buyer-product-page" data-model="${esc(model.folder)}">
    <section class="seo-hero product-detail">
      <div><p class="label">${esc(model.eyebrow || (tws ? model.name : wired ? 'Wired model reference' : 'Wireless model reference'))}</p>
        <h1>${esc(model.heading || name)}</h1><p>${esc(model.overview)}</p>
        ${model.indexable ? '' : '<p class="model-status">Specification confirmation is still needed for this version. Review the images and ask for the current details before sample or order approval.</p>'}
        <nav aria-label="Model details"><a href="#product-images">Product images</a> / <a href="#specifications">Listed details</a>${(model.sections || []).map(section => ` / <a href="#${esc(section.id)}">${esc(section.label)}</a>`).join('')} / <a href="#sample-check">Sample questions</a></nav>
        <div class="hero-actions seo-cta-actions"><a class="button primary" href="${contact}&amp;inquiry=quick-question#inquiry-form">Ask About ${esc(model.model)}</a><a class="button secondary" href="${contact}&amp;inquiry=sample#inquiry-form">${model.indexable ? 'Discuss a Sample' : 'Discuss This Version'}</a></div>
${siblingPage ? `        <p class="model-version-link">Need the other connection version? <a href="../../${siblingPage}">View ${esc(model.model)} ${sibling.category === 'wired' ? 'wired' : 'wireless'}</a>. Specifications and accessories differ.</p>` : ''}
      </div>
      <img src="../../${hero.path}" srcset="${image.variants.map(item => `../../${item.path} ${item.width}w`).join(', ')}" sizes="(max-width: 820px) calc(100vw - 32px), 560px" alt="${esc(name)} supplied product reference" width="${image.assets[0].width}" height="${image.assets[0].height}" fetchpriority="high" decoding="async">
    </section>
    <section class="seo-section" id="product-images">
      <div class="section-heading"><div><p class="label">Product images</p><h2>Take a closer look at ${esc(model.model)}</h2></div><p class="intro">${esc(model.galleryIntro || 'Use the supplied views to identify this model and prepare sample questions. Images are not test reports or an approved packing list.')}</p></div>
      ${imageMarkup}
    </section>
    <section class="seo-section" id="specifications">
      <div class="section-heading"><div><p class="label">Listed model details</p><h2>${esc(model.specificationHeading || 'What is documented for this version?')}</h2></div><p class="intro">${esc(model.specificationIntro || 'These are existing catalogue references, not new test results. Confirm the current sample and specification sheet for your project.')}</p></div>
      ${specs.length ? `<div class="buyer-summary">${specs.map(([key, value]) => `<div><strong>${esc(key)}</strong><span>${esc(value)}</span></div>`).join('\n')}</div>` : '<p>The current reference does not provide enough confirmed specifications for this version. Ask for the exact connection, driver, microphone and accessory details rather than borrowing figures from a similar model.</p>'}
      ${model.notes.map(note => `<p>${esc(note)}</p>`).join('\n')}
    </section>
${extraSections}    <section class="seo-section" id="sample-check">
      <div class="section-heading"><div><p class="label">Before choosing a sample</p><h2>What should we check for your market?</h2></div></div>
      <div class="buyer-summary">
        <div><strong>${tws ? 'Phone, fit and call use' : wired ? 'Audio connector and microphone' : 'Receiver and target devices'}</strong><span>${tws ? 'Share the phone, intended listening and call use. Check pairing, fit and microphone behavior on the sample.' : wired ? 'Confirm 3.5mm or USB audio, combined versus separate microphone connections and any splitter requirement. A listed USB connector alone does not prove USB audio.' : 'Share the exact PC, console or mobile device. Check the selected receiver, any adapter, playback and microphone input separately.'}</span></div>
        <div><strong>Included parts</strong><span>${tws ? 'Confirm the charging case or cable, tips if applicable, manual and approved packing list. A charging-case image does not establish all included accessories.' : 'Confirm cables, receiver where applicable, microphone parts, manual and approved packing list. Pictured accessories are not automatically standard.'}</span></div>
        <div><strong>Your brand and packaging</strong><span>Share your market, channel, logo, color and manual-language needs. Confirm the base version before final artwork or document review.</span></div>
      </div>
    </section>
    <section class="seo-section seo-faq"><div class="section-heading"><div><p class="label">Product FAQ</p><h2>Questions about ${esc(model.model)}</h2></div></div><div class="seo-grid">${faqs.map(item => `<article><h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p></article>`).join('\n')}</div></section>
    <section class="seo-cta"><h2>Ask about this ${esc(model.model)} version</h2><p>Send your target device, market and model question. A finished RFQ is not needed to start.</p><div class="seo-cta-actions"><a class="button primary" href="${contact}&amp;inquiry=quick-question#inquiry-form">Ask a Product Question</a><a class="email-link" href="mailto:sales@talrivo.com?subject=${encodeURIComponent(name + ' question')}">Email TALRIVO</a></div></section>
    <section class="seo-section model-resources"><nav class="link-list" aria-label="Related product resources"><a href="../../${familyPath}">${esc(family)}</a>${tws ? '' : '<a href="../../gaming-headset-models/">Gaming Headset Models</a>'}<a class="model-sample-link" href="${contact}&amp;inquiry=sample#inquiry-form">${model.indexable ? `Request a ${esc(model.model)} Sample` : `Discuss This ${esc(model.model)} Version`}</a><a href="../../sample-request/">Sample Review Guide</a><a href="../../oem-odm/">OEM and Private Label</a></nav></section>
  </main>
  <footer class="site-footer"><div class="footer-brand"><img src="../../assets/brand/talrivo-wordmark-new-white.png" alt="TALRIVO"><p>Gaming headsets and audio products by TALRIVO.</p></div><div class="footer-links"><a href="../../">Home</a><a href="../../${familyPath}">${esc(family)}</a><a href="${contact}&amp;inquiry=quick-question#inquiry-form">Contact</a></div></footer>
</body></html>
`;
}

let count = 0;
for (const model of review.models) {
  if (group !== 'all' && (model.category === 'tws') !== (group === 'tws')) continue;
  const file = resolve(root, model.page, 'index.html');
  if (existsSync(file) && !readFileSync(file, 'utf8').includes('Generated from content/model-page-reviews.json')) {
    throw new Error(`Refusing to overwrite a hand-maintained page: ${model.page}`);
  }
  const expected = render(model);
  if (check) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== expected) {
      throw new Error(`Generated model page is stale or missing: ${model.page}`);
    }
  } else {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, expected);
  }
  count += 1;
}
console.log(`${check ? 'Verified' : 'Built'} ${count} ${group} independent model pages.`);
