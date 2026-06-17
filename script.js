const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll(".product-card");
const form = document.querySelector("#inquiry-form");
const productSelect = document.querySelector("#product-interest");
const formStatus = document.querySelector("#form-status");
const sourceFields = {
  pageUrl: document.querySelector("#page-url"),
  pageTitle: document.querySelector("#page-title"),
  referrer: document.querySelector("#page-referrer"),
  firstLandingPage: document.querySelector("#first-landing-page"),
  firstReferrer: document.querySelector("#first-referrer"),
  utmSource: document.querySelector("#utm-source"),
  utmMedium: document.querySelector("#utm-medium"),
  utmCampaign: document.querySelector("#utm-campaign"),
  utmTerm: document.querySelector("#utm-term"),
  utmContent: document.querySelector("#utm-content"),
  selectedFrom: document.querySelector("#selected-from")
};
const mailbox = "sales@talrivo.com";
const catalogue = (window.talrivoCatalog || []).filter((product) => product.public !== false);
const catalogueGrid = document.querySelector("#catalogue-grid");
const catalogueCount = document.querySelector("#catalogue-count");
const catalogueTabs = document.querySelectorAll(".catalogue-tab");
const productDialog = document.querySelector("#product-dialog");
const wechatDialog = document.querySelector("#wechat-dialog");
const wechatTriggers = document.querySelectorAll("[data-open-wechat]");
const wechatClose = document.querySelector("#wechat-close");
const dialogMainImage = document.querySelector("#dialog-main-image");
const thumbnailList = document.querySelector("#thumbnail-list");
const dialogVideo = document.querySelector("#dialog-video");
const videoPending = document.querySelector("#video-pending");
const dialogHighlights = document.querySelector("#dialog-highlights");
const dialogTechnical = document.querySelector("#dialog-technical");
const dialogFit = document.querySelector("#dialog-fit");
const dialogOem = document.querySelector("#dialog-oem");
const dialogHero = document.querySelector("#dialog-hero");
const dialogUsecases = document.querySelector("#dialog-usecases");
const dialogBuyer = document.querySelector("#dialog-buyer");
const dialogPoster = document.querySelector("#dialog-poster");
const posterEyebrow = document.querySelector("#poster-eyebrow");
const posterTitle = document.querySelector("#poster-title");
const posterSubtitle = document.querySelector("#poster-subtitle");
const posterImage = document.querySelector("#poster-image");
const posterCalloutLeft = document.querySelector("#poster-callout-left");
const posterCalloutRight = document.querySelector("#poster-callout-right");
const posterFooter = document.querySelector("#poster-footer");
let selectedCatalogueProduct = null;
const sourceStorageKey = "talrivoInquirySource";

const detailLibrary = {
  "G941-wireless": {
    poster: {
      eyebrow: "Tri-Mode ANC Gaming",
      title: "G941",
      subtitle: "Wireless freedom for PC, console and mobile gaming channels.",
      callouts: ["ANC positioning", "Approx. 50H playback"],
      footer: "2.4G / Bluetooth / wired direction"
    },
    hero: "A premium tri-mode gaming headset direction for importers that need one hero model to cover PC gaming, console use, mobile play and lifestyle wireless listening.",
    highlights: ["Tri-mode positioning supports 2.4G wireless, Bluetooth and wired use cases for wider channel coverage", "ANC story helps separate the model from basic wireless gaming headsets in buyer presentations", "Long-use battery profile supports extended gaming sessions and retail comparison pages", "Detachable boom microphone gives buyers a cleaner lifestyle look when the headset is used outside gaming"],
    usecases: ["Gaming accessory distributors", "E-commerce private-label launches", "Premium retail headset series", "Console and PC gaming bundles"],
    technical: [["Connection direction", "2.4G wireless / Bluetooth / wired positioning"], ["Driver", "40 mm / 50 mm option"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    buyer: ["Strong specification story for catalogue pages", "Clear upgrade path from basic 2.4G models", "Suitable for sample comparisons across multiple markets", "Works well as a private-label hero item"],
    fit: "Suitable for buyers looking for a higher-end wireless gaming headset with ANC positioning, stronger battery story, and private-label appearance options.",
    oem: "Recommended for color matching, logo discussion, packaging customization, user manual localization and market-specific accessory bundle planning."
  },
  "G940-wireless": {
    poster: {
      eyebrow: "Low-Latency Wireless",
      title: "G940",
      subtitle: "Futuristic hollowed design with RGB shelf impact.",
      callouts: ["20 ms listed latency", "Dual-driver audio story"],
      footer: "Distinctive wireless gaming look"
    },
    hero: "A visually distinctive low-latency wireless model for buyers who want a futuristic gaming look without moving into a heavy premium product position.",
    highlights: ["Dual-driver acoustic structure creates a stronger product story than ordinary single-driver wireless models", "Hollowed 3D exterior gives the headset a recognizable shelf and thumbnail appearance", "Detachable microphone supports gaming communication and cleaner daily-use presentation", "RGB accents help the model stand out in online stores and retail comparison visuals"],
    usecases: ["Entry-to-mid gaming headset programmes", "Online marketplace product lines", "Youth gaming and streaming bundles", "Regional distributor assortments"],
    technical: [["Connection direction", "2.4G wireless gaming positioning"], ["Driver", "35 mm + 16 mm dual unit"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "400 mAh"], ["Playback time", "Approx. 20 hours without lights"], ["Charging time", "1 - 2 hours"], ["Transmission distance", "10 meters"]],
    buyer: ["Distinct design for product-page differentiation", "Balanced wireless specification for mainstream channels", "Good model for colorway and packaging testing", "Easy to position as a value gaming wireless option"],
    fit: "Good for gaming channels that want a distinctive low-latency wireless look with a compact battery and strong visual differentiation.",
    oem: "Useful for channel-exclusive colorways, packaging sets, online listing images and entry-to-mid wireless gaming assortments."
  },
  "G942-wireless": {
    highlights: ["Abyss-light design language with clean gaming styling", "Plug-in microphone for clear team communication", "Large stainless-steel bar and anti-vibration single beam", "Single-headband structure with high-fidelity speaker positioning"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for buyers who need a strong 2.4G wireless gaming model with a clean appearance and long battery narrative.",
    oem: "Can be positioned as a hero wireless item for private-label launch ranges and gaming accessory bundles."
  },
  "G923-wireless": {
    highlights: ["RGB dynamic running light for gaming shelf impact", "Aluminum fork arm with full-coverage earcups", "Plug-in microphone and single-headband structure", "High-fidelity speaker positioning for immersive gameplay"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Good for distributors comparing wireless gaming headsets with RGB styling and strong visual appeal.",
    oem: "Recommended for private-label packaging, retail kit planning, and model comparison during sample selection."
  },
  "G920-wireless": {
    highlights: ["RGB dynamic running light", "Aluminum fork arm and full-coverage earcups", "Plug-in microphone for gaming communication", "Single-headband gaming structure"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for value-focused wireless gaming assortments that still need RGB styling and long-use positioning.",
    oem: "Useful for regional channel bundles and branded packaging projects."
  },
  "G936-wireless": {
    highlights: ["RGB dynamic running light with clean wireless silhouette", "Plug-in microphone and stainless-steel support bar", "Lightweight simple design with extendable headband", "Balanced 40 mm speaker positioning"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "800 mAh"], ["Playback time", "Approx. 40 hours without lights"], ["Charging time", "3 hours"], ["Transmission distance", "10 meters"]],
    fit: "Good for buyers wanting a simple RGB wireless gaming option with solid battery performance.",
    oem: "Recommended for color and packaging customization after sample confirmation."
  },
  "G939-wireless": {
    highlights: ["RGB dynamic running light", "Plug-in microphone with stainless-steel support", "Cool string appearance and lightweight structure", "Wireless gaming configuration with long playback profile"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for wireless gaming lines that need a visually active RGB model and reliable specification story.",
    oem: "Can support private-label visual matching and channel-specific model selection."
  },
  "G927-wireless": {
    highlights: ["RGB dynamic running light", "Rotating microphone design", "Metal mesh earcup detail with large stainless-steel bar", "Single-headband structure with gaming-forward styling"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Good for buyers looking for a strong gaming visual with rotating mic and textured earcup design.",
    oem: "Recommended for branded gaming bundles, sample review, and market-specific color direction."
  },
  "G926-wireless": {
    highlights: ["RGB dynamic running light", "Plug-in microphone and stainless-steel support bar", "Metal mesh earcups with cool string design", "Wireless gaming direction for mainstream channels"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for mainstream wireless gaming assortments where RGB appearance and practical microphone design matter.",
    oem: "Good candidate for private-label packaging and entry-to-mid gaming channel ranges."
  },
  "G938-wireless": {
    highlights: ["RGB dynamic running light", "Aluminum fork arm and full-coverage earcups", "Plug-in microphone and single-headband layout", "Immersive gaming appearance with 2.4G positioning"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "1000 mAh"], ["Playback time", "Approx. 50 hours without lights"], ["Charging time", "3 - 4 hours"], ["Transmission distance", "10 meters"]],
    fit: "Good for channels that want a familiar gaming headset profile with wireless convenience and RGB styling.",
    oem: "Suitable for branded retail kits and model-by-model selection."
  },
  "G935-wireless": {
    highlights: ["Clean minimalist gaming design", "Plug-in microphone with built-in stainless-steel bar", "Lightweight structure with extendable headband", "Balanced 40 mm speaker positioning"],
    technical: [["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Latency", "20 ms listed"], ["Battery", "500 mAh"], ["Playback time", "Approx. 25 hours without lights"], ["Charging time", "2 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for buyers who prefer a cleaner wireless gaming style without an overly aggressive appearance.",
    oem: "Recommended for understated private-label gaming lines and channel-specific color matching."
  },
  "B7-bluetooth": {
    highlights: ["Zinc-alloy process with 180-degree rotation", "Over-ear design with premium rounded appearance", "Ergonomic headband structure for pressure-free wear", "Bluetooth and ANC positioning available for lifestyle audio lines"],
    technical: [["Bluetooth", "5.3 + EDR / ANC option"], ["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Battery", "300 mAh / 500 mAh option"], ["Music time", "16 - 22 hours / 15 - 20 hours option"], ["Charging interface", "Type-C on ANC version"], ["Transmission distance", "10 meters"]],
    fit: "Good for lifestyle audio importers and retailers looking for a more premium over-ear Bluetooth option.",
    oem: "Suitable for color extension, packaging localization, and Bluetooth / ANC version selection."
  },
  "B9-bluetooth": {
    highlights: ["Rotatable headphone arms for portable use", "Skin-friendly over-ear cushions", "Ergonomic oval ear shell design", "Lightweight lifestyle Bluetooth positioning"],
    technical: [["Bluetooth", "5.3 + EDR / ANC option"], ["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Battery", "300 mAh / 500 mAh option"], ["Music time", "16 - 22 hours / 15 - 20 hours option"], ["Charging time", "2 - 3 hours"], ["Transmission distance", "10 meters"]],
    fit: "Suitable for consumer electronics channels looking for a simple, modern Bluetooth over-ear headphone.",
    oem: "Good for lifestyle colorways, packaging sets, and ANC / non-ANC product planning."
  },
  "B10-bluetooth": {
    highlights: ["Rotatable headphone arms and over-ear comfort", "Skin-friendly cushions with ergonomic oval ear shells", "Bluetooth ANC positioning available", "Clean appearance for retail audio assortments"],
    technical: [["Bluetooth", "5.3 + EDR / ANC option"], ["Driver", "40 mm"], ["Frequency response", "20 Hz - 20 kHz"], ["Battery", "301 mAh / 500 mAh option"], ["Music time", "16 - 22 hours / 20 - 30 hours option"], ["Charging interface", "Type-C on ANC version"], ["Transmission distance", "10 meters"]],
    fit: "Good for buyers building a clean Bluetooth headphone series with optional ANC positioning.",
    oem: "Recommended for private-label lifestyle audio, color planning, and packaging customization."
  },
  "G946-new": {
    poster: {
      eyebrow: "RGB Hero Concept",
      title: "G946",
      subtitle: "High-impact gaming visual for catalogue covers and buyer sample review.",
      callouts: ["RGB hero lighting", "Boom microphone"],
      footer: "Specification sheet to confirm before sale"
    },
    hero: "A high-impact RGB gaming headset concept built for visual selling: strong lighting, oversized earcup presence and a gaming-first silhouette for catalogue covers, online listings and buyer sample review.",
    highlights: ["Large RGB visual area creates an immediate gaming identity for product thumbnails and display pages", "Over-ear structure and boom microphone make the product easy to understand for PC gaming buyers", "Multiple image angles are available for catalogue, marketplace and social media product presentation", "Strong hero-model appearance supports private-label launch discussions before final specification confirmation"],
    usecases: ["Catalogue hero pages", "Gaming brand launch visuals", "Importer sample review", "Retail shelf concept presentation"],
    technical: [["Positioning", "RGB gaming concept"], ["Microphone", "Boom microphone"], ["Application", "Gaming headset selection"], ["Visual assets", "Multiple product angles prepared"], ["Documentation", "Specification sheet to confirm before sale"]],
    buyer: ["Best used as a visual lead model", "Useful for checking market reaction before bulk planning", "Supports private-label appearance discussions", "Can anchor a gaming headset range presentation"],
    fit: "Suitable as a visual hero model for buyer discussions, new product selection and marketing concept review.",
    oem: "Use for branding concept review, appearance discussion, color direction, packaging planning and sample confirmation."
  },
  "G947-new": {
    highlights: ["New gaming headset visual direction", "Over-ear structure for gaming channels", "Clean model candidate for upcoming assortment planning", "Suitable for buyer sample review"],
    technical: [["Positioning", "New design candidate"], ["Application", "Gaming headset selection"], ["Configuration", "To confirm by sample"], ["Documentation", "Specification sheet to confirm"]],
    fit: "Suitable for buyers looking for upcoming headset designs and visual alternatives.",
    oem: "Recommended for early-stage selection, color review, and branding feasibility discussion."
  },
  "G942-wired": {
    highlights: ["Abyss-light gaming appearance", "Plug-in microphone", "Large stainless-steel bar with anti-vibration single beam", "Single-headband wired RGB gaming structure"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Product size", "193*90*210 mm"], ["Packaging size", "210*110*230 mm"]],
    fit: "Suitable for wired RGB gaming shelves where visual impact and straightforward compatibility are important.",
    oem: "Good candidate for private-label wired gaming bundles and retail packaging customization."
  },
  "G935-wired": {
    highlights: ["RGB dynamic running light", "Plug-in microphone and plug-in main cable", "Built-in stainless-steel strip", "Lightweight minimalist design with 40 mm speaker positioning"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Weight", "Approx. 190 g"]],
    fit: "Suitable for buyers seeking a light, clean wired RGB gaming headset.",
    oem: "Recommended for branded wired gaming lines and channel-exclusive packaging."
  },
  "G936-wired": {
    highlights: ["RGB dynamic running light", "Plug-in microphone", "Stainless-steel support bar", "Lightweight design with extendable headband"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Weight", "Approx. 191 g"]],
    fit: "Good for simple wired RGB gaming assortments with a cleaner appearance.",
    oem: "Suitable for private-label wired headset ranges and packaging localization."
  },
  "G939-wired": {
    highlights: ["RGB dynamic LED lighting", "Plug-in microphone", "Steel-wire support arm and cool string design", "Adjustable intelligent control"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Speaker positioning", "50 mm high-fidelity speaker"]],
    fit: "Suitable for wired gaming channels seeking RGB styling with strong visual identity.",
    oem: "Good for private-label wired headset programmes and regional gaming accessory lines."
  },
  "G923-wired": {
    highlights: ["RGB dynamic running light", "Plug-in microphone", "Metal mesh earcup styling", "Single-headband structure with adjustable control"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.4 KΩ"], ["Speaker positioning", "52 mm high-fidelity speaker"]],
    fit: "Good for value gaming programmes needing RGB appearance and durable wired communication.",
    oem: "Recommended for retail bundles, packaging customization, and market-specific color planning."
  },
  "G941-wired": {
    highlights: ["Wired gaming visual candidate", "Over-ear gaming structure", "Boom microphone positioning", "Product image set available for buyer review"],
    technical: [["Configuration", "To confirm"], ["Application", "Wired gaming headset selection"], ["Documentation", "Specification sheet to confirm"]],
    fit: "Suitable for buyers comparing wired gaming visual directions before final specification confirmation.",
    oem: "Use for early-stage model selection and branding feasibility discussion."
  },
  "G921-wired": {
    highlights: ["RGB dynamic running light", "Plug-in microphone", "Metal mesh earcups", "Single-headband design with adjustable control"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Speaker positioning", "52 mm high-fidelity speaker"]],
    fit: "Suitable for wired gaming assortment expansion with RGB and metal-mesh visual cues.",
    oem: "Good for branded entry wired gaming selections and packaging projects."
  },
  "G919-wired": {
    highlights: ["RGB dynamic running light", "Plug-in microphone", "Stainless-steel support bar", "Single-headband design with adjustable control"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Speaker positioning", "50 mm high-fidelity speaker"]],
    fit: "Good for wired gaming headset programmes that need RGB lighting and a direct communication setup.",
    oem: "Recommended for private-label wired gaming bundles and channel-specific packaging."
  },
  "G907-wired": {
    highlights: ["Cool gaming appearance", "Single-headband structure", "LED backlight", "Long-handle folding microphone"],
    technical: [["Interface", "3.5 mm + USB"], ["Microphone response", "50 - 16000 Hz"], ["Microphone sensitivity", "-45 dB ± 3 dB"], ["Microphone impedance", "≤2.3 KΩ"], ["Speaker positioning", "50 mm high-fidelity speaker"]],
    fit: "Suitable for entry wired gaming ranges that need LED styling and simple communication features.",
    oem: "Good for promotional wired gaming assortments and private-label packaging."
  }
};

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const filter = tab.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll(".inquiry-pick").forEach((button) => {
  button.addEventListener("click", () => {
    setProductInterest(button.dataset.product);
    setSelectedFrom(`Homepage product card: ${button.dataset.product}`);
    document.querySelector("#rfq").scrollIntoView({ behavior: "smooth" });
    formStatus.textContent = `${button.dataset.product} selected for your inquiry.`;
  });
});

function getStoredSourceContext() {
  const current = {
    firstLandingPage: window.location.href,
    firstReferrer: document.referrer || "Direct / not available"
  };
  try {
    const stored = window.localStorage.getItem(sourceStorageKey);
    if (stored) return JSON.parse(stored);
    window.localStorage.setItem(sourceStorageKey, JSON.stringify(current));
  } catch (error) {
    return current;
  }
  return current;
}

function getUtmValue(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function setSelectedFrom(value) {
  if (sourceFields.selectedFrom) {
    sourceFields.selectedFrom.value = value;
  }
}

function populateSourceFields() {
  if (!form) return;
  const storedSource = getStoredSourceContext();
  const values = {
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer || "Direct / not available",
    firstLandingPage: storedSource.firstLandingPage || window.location.href,
    firstReferrer: storedSource.firstReferrer || "Direct / not available",
    utmSource: getUtmValue("utm_source"),
    utmMedium: getUtmValue("utm_medium"),
    utmCampaign: getUtmValue("utm_campaign"),
    utmTerm: getUtmValue("utm_term"),
    utmContent: getUtmValue("utm_content")
  };
  Object.entries(values).forEach(([key, value]) => {
    if (sourceFields[key]) sourceFields[key].value = value;
  });
}

function setProductInterest(productName) {
  const existingOption = Array.from(productSelect.options).find((option) => option.value === productName);
  if (!existingOption) {
    const option = new Option(productName, productName);
    productSelect.add(option);
  }
  productSelect.value = productName;
}

function assetPath(product, image) {
  return `assets/catalog/${product.folder}/${image}`;
}

function detailKey(product) {
  return `${product.model}-${product.category}`;
}

function renderDetailBlock(block, content, renderer) {
  const hasContent = Array.isArray(content) ? content.length > 0 : Boolean(content);
  block.classList.toggle("hidden", !hasContent);
  if (hasContent) renderer();
}

function renderPoster(product, poster) {
  dialogPoster.classList.toggle("hidden", !poster);
  if (!poster) return;
  posterEyebrow.textContent = poster.eyebrow;
  posterTitle.textContent = poster.title;
  posterSubtitle.textContent = poster.subtitle;
  posterImage.src = assetPath(product, product.images[0]);
  posterImage.alt = `${product.model} ${product.name} poster preview`;
  posterCalloutLeft.textContent = poster.callouts[0];
  posterCalloutRight.textContent = poster.callouts[1];
  posterFooter.textContent = poster.footer;
}

function renderCatalogue(filter = "all") {
  const displayed = catalogue.filter((product) => filter === "all" || product.category === filter);
  catalogueCount.textContent = `${displayed.length} models`;
  catalogueGrid.innerHTML = displayed.map((product, index) => `
    <button class="catalogue-card" type="button" data-product-index="${catalogue.indexOf(product)}" aria-label="View ${product.model} ${product.name}">
      <img class="catalogue-card-image" src="${assetPath(product, product.images[0])}" alt="${product.model} ${product.name}">
      <span class="catalogue-card-copy">
        <span class="series">${product.label}</span>
        <h3>${product.model} ${product.name}</h3>
        <span class="catalogue-meta"><span>${product.images.length} images</span><span class="${product.video ? "video-ready" : ""}">${product.video ? "Video" : "Video slot"}</span></span>
        <span class="catalogue-action">View model</span>
      </span>
    </button>
  `).join("");
  catalogueGrid.querySelectorAll(".catalogue-card").forEach((card) => {
    card.addEventListener("click", () => openProductDialog(catalogue[Number(card.dataset.productIndex)]));
  });
}

function openProductDialog(product) {
  selectedCatalogueProduct = product;
  const details = product.details || detailLibrary[detailKey(product)] || {};
  document.querySelector("#dialog-series").textContent = product.label;
  document.querySelector("#dialog-title").textContent = product.name;
  document.querySelector("#dialog-model").textContent = `Reference model: ${product.model}`;
  document.querySelector("#dialog-summary").textContent = product.summary;
  document.querySelector("#dialog-specs").innerHTML = product.specs.map((spec) => `<li>${spec}</li>`).join("");
  renderPoster(product, details.poster);
  renderDetailBlock(document.querySelector("#dialog-hero-block"), details.hero, () => {
    dialogHero.textContent = details.hero;
  });
  renderDetailBlock(document.querySelector("#dialog-highlights-block"), details.highlights, () => {
    dialogHighlights.innerHTML = details.highlights.map((item) => `<li>${item}</li>`).join("");
  });
  renderDetailBlock(document.querySelector("#dialog-usecases-block"), details.usecases, () => {
    dialogUsecases.innerHTML = details.usecases.map((item) => `<li>${item}</li>`).join("");
  });
  renderDetailBlock(document.querySelector("#dialog-technical-block"), details.technical, () => {
    dialogTechnical.innerHTML = details.technical.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("");
  });
  renderDetailBlock(document.querySelector("#dialog-buyer-block"), details.buyer, () => {
    dialogBuyer.innerHTML = details.buyer.map((item) => `<li>${item}</li>`).join("");
  });
  renderDetailBlock(document.querySelector("#dialog-fit-block"), details.fit, () => {
    dialogFit.textContent = details.fit;
  });
  renderDetailBlock(document.querySelector("#dialog-oem-block"), details.oem, () => {
    dialogOem.textContent = details.oem;
  });
  dialogMainImage.src = assetPath(product, product.images[0]);
  dialogMainImage.alt = `${product.model} ${product.name}`;
  thumbnailList.innerHTML = product.images.map((image, index) => `
    <button class="${index === 0 ? "active" : ""}" type="button" data-image="${image}" aria-label="View product image ${index + 1}">
      <img src="${assetPath(product, image)}" alt="">
    </button>
  `).join("");
  thumbnailList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      thumbnailList.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      dialogMainImage.src = assetPath(product, button.dataset.image);
      if (!dialogPoster.classList.contains("hidden")) {
        posterImage.src = assetPath(product, button.dataset.image);
      }
    });
  });
  if (product.video) {
    dialogVideo.src = product.video;
    dialogVideo.classList.add("available");
    videoPending.classList.add("hidden");
  } else {
    dialogVideo.removeAttribute("src");
    dialogVideo.classList.remove("available");
    videoPending.classList.remove("hidden");
  }
  productDialog.showModal();
}

catalogueTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    catalogueTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    renderCatalogue(tab.dataset.catalogueFilter);
  });
});

document.querySelector("#dialog-close").addEventListener("click", () => {
  dialogVideo.pause();
  productDialog.close();
});

document.querySelector("#dialog-inquiry").addEventListener("click", () => {
  if (!selectedCatalogueProduct) return;
  const productName = `${selectedCatalogueProduct.model} ${selectedCatalogueProduct.name}`;
  setProductInterest(productName);
  setSelectedFrom(`Catalogue dialog: ${selectedCatalogueProduct.model} ${selectedCatalogueProduct.name}`);
  form.querySelector("textarea").value = `Please provide specifications, MOQ and available branding options for reference model ${selectedCatalogueProduct.model} (${selectedCatalogueProduct.name}).`;
  productDialog.close();
  document.querySelector("#rfq").scrollIntoView({ behavior: "smooth" });
  formStatus.textContent = `${selectedCatalogueProduct.model} added to your inquiry request.`;
});

wechatTriggers.forEach((button) => {
  button.addEventListener("click", () => {
    wechatDialog.showModal();
  });
});

wechatClose.addEventListener("click", () => {
  wechatDialog.close();
});

wechatDialog.addEventListener("click", (event) => {
  if (event.target === wechatDialog) {
    wechatDialog.close();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  populateSourceFields();
  const fields = new FormData(form);
  formStatus.classList.remove("success", "error");
  const subject = `TALRIVO RFQ - ${fields.get("product")} - ${fields.get("company")}`;
  const message = [
    "Hello TALRIVO,",
    "",
    "I would like to request product information.",
    "",
    `Name: ${fields.get("name")}`,
    `Business email: ${fields.get("email")}`,
    `Company: ${fields.get("company")}`,
    `Market / country: ${fields.get("market")}`,
    `Buyer type: ${fields.get("buyer_type") || "Not specified"}`,
    `Sales channel: ${fields.get("channel") || "Not specified"}`,
    `Product interest: ${fields.get("product")}`,
    `Estimated order quantity: ${fields.get("quantity")}`,
    `Project timeline: ${fields.get("timeline") || "Not specified"}`,
    `Branding needs: ${fields.get("branding") || "Not specified"}`,
    "",
    "Requirements:",
    fields.get("message") || "Please provide available options and commercial details.",
    "",
    "Source context:",
    `Submitted from: ${fields.get("page_url") || "Not available"}`,
    `Page title: ${fields.get("page_title") || "Not available"}`,
    `Selected from: ${fields.get("selected_from") || "Manual form selection"}`,
    `First landing page: ${fields.get("first_landing_page") || "Not available"}`,
    `Referrer: ${fields.get("referrer") || "Direct / not available"}`,
    `First referrer: ${fields.get("first_referrer") || "Direct / not available"}`,
    `UTM source: ${fields.get("utm_source") || "Not set"}`,
    `UTM medium: ${fields.get("utm_medium") || "Not set"}`,
    `UTM campaign: ${fields.get("utm_campaign") || "Not set"}`,
    `UTM term: ${fields.get("utm_term") || "Not set"}`,
    `UTM content: ${fields.get("utm_content") || "Not set"}`
  ].join("\n");
  const web3formsKey = form.dataset.web3formsKey.trim();

  if (web3formsKey) {
    fields.append("access_key", web3formsKey);
    fields.append("subject", subject);
    fields.append("from_name", "TALRIVO Website Inquiry");
    fields.append("message", message);
    formStatus.textContent = "Sending your inquiry...";
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: fields
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Submission failed");
      form.reset();
      formStatus.classList.add("success");
      formStatus.textContent = "Your inquiry has been sent. We will reply by email within 24 hours. For urgent sample discussion, you can also scan the WeChat QR code below.";
      return;
    } catch (error) {
      formStatus.classList.add("error");
      formStatus.textContent = `Online submission is unavailable. Please email ${mailbox} directly.`;
      return;
    }
  }

  const emailLink = `mailto:${mailbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  formStatus.textContent = `Your email draft is ready. If no mail window opens, email ${mailbox} directly.`;
  window.location.href = emailLink;
});

document.querySelector("#year").textContent = new Date().getFullYear();
populateSourceFields();
renderCatalogue();
