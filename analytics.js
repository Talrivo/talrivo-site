(() => {
  const measurementId = "G-ZLN0CNB9PZ";
  const consentStorageKey = "talrivoAnalyticsConsent";
  const inquirySourceStorageKey = "talrivoInquirySource";
  const sourceParameterNames = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  let savedConsent = null;
  try {
    savedConsent = window.localStorage.getItem(consentStorageKey);
  } catch (error) {
    savedConsent = null;
  }

  // A source hint is evidence of a link/referrer, not proof of AI influence.
  const getSourceTouch = (params) => {
    const sourceHosts = {
      "chatgpt.com": "chatgpt", "chat.openai.com": "chatgpt",
      "perplexity.ai": "perplexity", "www.perplexity.ai": "perplexity",
      "gemini.google.com": "gemini", "copilot.microsoft.com": "copilot",
      "linkedin.com": "linkedin", "www.linkedin.com": "linkedin", "lnkd.in": "linkedin",
      "facebook.com": "facebook", "www.facebook.com": "facebook", "m.facebook.com": "facebook",
      "l.facebook.com": "facebook", "lm.facebook.com": "facebook", "fb.me": "facebook",
      "youtube.com": "youtube", "www.youtube.com": "youtube", "m.youtube.com": "youtube", "youtu.be": "youtube",
      "reddit.com": "reddit", "www.reddit.com": "reddit", "old.reddit.com": "reddit", "new.reddit.com": "reddit", "out.reddit.com": "reddit"
    };
    const sourceTags = {
      chatgpt: "chatgpt", "chatgpt.com": "chatgpt",
      perplexity: "perplexity", "perplexity.ai": "perplexity",
      gemini: "gemini", "gemini.google.com": "gemini",
      copilot: "copilot", "copilot.microsoft.com": "copilot",
      linkedin: "linkedin", "linkedin.com": "linkedin", "lnkd.in": "linkedin",
      facebook: "facebook", "facebook.com": "facebook", "fb.me": "facebook",
      youtube: "youtube", "youtube.com": "youtube", "youtu.be": "youtube",
      reddit: "reddit", "reddit.com": "reddit"
    };
    let externalHost = "";
    try {
      const previous = new URL(document.referrer);
      if (["http:", "https:"].includes(previous.protocol)
        && previous.hostname.replace(/^www\./, "") !== window.location.hostname.replace(/^www\./, "")) {
        externalHost = previous.hostname;
      }
    } catch { /* Missing/invalid referrer cannot establish an external source. */ }
    const tagged = params.has("utm_source");
    if (!tagged && !externalHost) return null;
    const tag = (params.get("utm_source") || "").trim().toLowerCase();
    const channel = tagged ? (Object.hasOwn(sourceTags, tag) ? sourceTags[tag] : tag ? "other" : "unknown")
      : Object.hasOwn(sourceHosts, externalHost) ? sourceHosts[externalHost] : "other";
    return {
      channel, evidence: tagged ? "tagged_link" : "external_referrer",
      landingPath: window.location.pathname, recordedAt: new Date().toISOString()
    };
  };

  const captureInquirySource = () => {
    const params = new URLSearchParams(window.location.search);
    let storedSource = {};

    try {
      const parsed = JSON.parse(window.localStorage.getItem(inquirySourceStorageKey));
      storedSource = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      storedSource = {};
    }

    const source = {
      ...storedSource,
      firstLandingPage: storedSource.firstLandingPage || window.location.href,
      firstReferrer: storedSource.firstReferrer || document.referrer || "Direct / not available",
      latestLandingPage: window.location.href,
      latestReferrer: document.referrer || "Direct / not available"
    };

    const touch = getSourceTouch(params);
    if (touch) source.latestSourceTouch = touch;
    // An untagged external arrival replaces a prior campaign; internal page
    // views preserve the last observed touch instead of overwriting it.
    if (touch || sourceParameterNames.some((name) => params.has(name))) {
      for (const name of sourceParameterNames) {
        const key = name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        source[key] = params.get(name) || "";
      }
    }

    try {
      window.localStorage.setItem(inquirySourceStorageKey, JSON.stringify(source));
    } catch (error) {
      // Attribution remains unavailable when storage cannot be used.
    }
  };

  const clearInquirySource = () => {
    try {
      window.localStorage.removeItem(inquirySourceStorageKey);
    } catch (error) {
      // No stored attribution needs clearing when storage is unavailable.
    }
  };

  if (savedConsent === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    captureInquirySource();
  } else if (savedConsent === "denied") {
    clearInquirySource();
  }

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(googleTag);

  const saveConsent = (value) => {
    try {
      window.localStorage.setItem(consentStorageKey, value);
    } catch (error) {
      // The consent choice still applies for this page when storage is unavailable.
    }
  };

  const applyConsent = (value) => {
    window.gtag("consent", "update", {
      analytics_storage: value === "granted" ? "granted" : "denied"
    });
    saveConsent(value);
    if (value === "granted") {
      captureInquirySource();
    } else {
      clearInquirySource();
    }
  };

  const buildConsentPanel = () => {
    const panel = document.createElement("section");
    panel.className = "analytics-consent";
    panel.setAttribute("data-nosnippet", "");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "analytics-consent-title");
    panel.innerHTML = `
      <div>
        <strong id="analytics-consent-title">Analytics preferences</strong>
        <p>We use Google Analytics to understand visits and successful inquiry submissions. Analytics storage stays off unless you accept.</p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" data-analytics-consent="denied">Reject</button>
        <button class="primary" type="button" data-analytics-consent="granted">Accept analytics</button>
      </div>
    `;

    panel.addEventListener("click", (event) => {
      const button = event.target.closest("[data-analytics-consent]");
      if (!button) return;
      applyConsent(button.dataset.analyticsConsent);
      panel.remove();
      showPreferencesButton();
    });

    return panel;
  };

  const showConsentPanel = () => {
    document.querySelector(".analytics-consent")?.remove();
    document.querySelector(".analytics-preferences-button")?.remove();
    document.body.appendChild(buildConsentPanel());
  };

  const showPreferencesButton = () => {
    if (document.querySelector(".analytics-preferences-button")) return;
    const button = document.createElement("button");
    button.className = "analytics-preferences-button";
    button.type = "button";
    button.textContent = "Analytics settings";
    button.addEventListener("click", showConsentPanel);
    document.body.appendChild(button);
  };

  const initializeConsentControls = () => {
    if (savedConsent === "granted" || savedConsent === "denied") {
      showPreferencesButton();
    } else {
      showConsentPanel();
    }
  };

  document.addEventListener("click", (event) => {
    let consent = null;
    try {
      consent = window.localStorage.getItem(consentStorageKey);
    } catch {
      return;
    }
    if (consent !== "granted") return;
    const target = event.target?.closest?.("a[href], [data-open-wechat], #sample-review-preview, #sample-review-download, #sample-review-print");
    if (!target) return;
    const sampleReviewPath = "/insights/evaluate-gaming-headset-sample-before-bulk-order/";
    const reviewActions = new Map([
      ["sample-review-preview", "preview_request"],
      ["sample-review-download", "download_request"],
      ["sample-review-print", "print_request"]
    ]);
    const reviewAction = reviewActions.get(target.id);
    if (reviewAction) {
      if (window.location.pathname === sampleReviewPath && target.closest("#sample-review-tool")
        && !target.disabled && !target.closest("fieldset[disabled]")) {
        // A requested action is not a completed download, print or inquiry.
        // Read no form values, sample IDs, notes, query strings or results.
        window.gtag("event", "sample_review_action", {
          review_action: reviewAction,
          page_path: window.location.pathname
        });
      }
      return;
    }
    const href = target.getAttribute("href") || "";
    let method = null;
    if (target.hasAttribute("data-open-wechat")) method = "wechat";
    else if (/^mailto:/i.test(href)) method = "email";
    else if (/^https:\/\/(?:wa\.me|api\.whatsapp\.com)(?:\/|$)/i.test(href)) method = "whatsapp";
    const location = target.closest(".contact-dock") ? "contact_dock"
      : target.closest(".site-header") ? "header"
      : target.closest(".site-footer") ? "footer" : "content";
    if (method) {
      window.gtag("event", "contact_click", {
        contact_method: method,
        contact_location: location,
        page_path: window.location.pathname
      });
      return;
    }

    const guidePages = [
      "/insights/evaluate-gaming-headset-sample-before-bulk-order/",
      "/insights/choose-2-4g-wireless-gaming-headset/",
      "/insights/2-4g-vs-bluetooth-gaming-headsets-importers/",
      "/insights/",
      "/insights/gaming-headset-microphone-performance/",
      "/insights/gaming-headset-packaging-accessories-checklist/",
      "/insights/gaming-headset-import-documents-checklist/",
      "/sample-request/",
      "/rfq-guide/",
      "/insights/private-label-gaming-headset-rfq-checklist/",
      "/insights/in-ear-vs-open-ear-tws-earbuds-private-label/",
      "/insights/compare-tws-earbuds-private-label-sampling/",
      "/insights/open-ear-tws-earbuds-private-label-buyers/"
    ];
    // Explicit published routes keep unknown URLs and buyer text outside resource tracking.
    const audioModelPages = [
      "/bluetooth-headphones/b10-bluetooth/",
      "/bluetooth-headphones/b7-bluetooth/",
      "/bluetooth-headphones/b9-bluetooth/",
      "/tws-earbuds/bch-002/",
      "/tws-earbuds/earclip09s/",
      "/tws-earbuds/ows-035/",
      "/tws-earbuds/ows-103/",
      "/tws-earbuds/tws002/",
      "/tws-earbuds/tws005/",
      "/tws-earbuds/tws007/",
      "/tws-earbuds/tws008/",
      "/tws-earbuds/tws012/",
      "/tws-earbuds/tws013/",
      "/tws-earbuds/tws016/",
      "/tws-earbuds/tws017/",
      "/tws-earbuds/tws019/",
      "/tws-earbuds/tws029/",
      "/tws-earbuds/tws031/",
      "/tws-earbuds/tws035/",
      "/tws-earbuds/tws040/",
      "/tws-earbuds/tws042s/",
      "/tws-earbuds/tws044/",
      "/tws-earbuds/tws044f/",
      "/tws-earbuds/tws052/",
      "/tws-earbuds/tws056/",
      "/tws-earbuds/tws057/",
      "/tws-earbuds/tws058/",
      "/tws-earbuds/tws059/",
      "/tws-earbuds/tws070/",
      "/tws-earbuds/twsz10/"
];
    const productPages = [
      "/gaming-headsets/", "/wireless-gaming-headsets/", "/wired-gaming-headsets/", "/product-comparison/",
      "/gaming-headset-models/",
      "/gaming-headsets/g926-wired/", "/gaming-headsets/g926-wireless/", "/gaming-headsets/g935-wireless/",
      "/gaming-headsets/g936-lightweight/", "/gaming-headsets/g938-wireless/",
      "/gaming-headsets/g940-low-latency/", "/gaming-headsets/g941-tri-mode-anc/",
      "/gaming-headsets/g946-rgb/", "/gaming-headsets/g947-foldable/",
      "/tws-earbuds/", "/bluetooth-headphones/",
      ...audioModelPages
    ];
    if (![...guidePages, ...productPages].includes(window.location.pathname) || !target.closest("main")) return;
    let destination;
    try {
      destination = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (destination.origin !== window.location.origin) return;
    const resources = {
      "/assets/downloads/g946-configuration-packing-review.txt": "g946_packing_sheet",
      "/assets/downloads/gaming-headset-rfq-template.txt": "rfq_template_file",
      "/assets/downloads/gaming-headset-quote-scope-review.txt": "quote_scope_file",
      "/rfq-guide/": "rfq_template_guide",
      "/insights/private-label-gaming-headset-rfq-checklist/": "quote_scope_guide",
      "/gaming-headset-models/": "model_directory",
      "/assets/downloads/gaming-headset-mic-recording-sheet.txt": "mic_recording_sheet",
      "/assets/downloads/gaming-headset-packing-review-sheet.txt": "packing_review_sheet",
      "/assets/downloads/wireless-gaming-headset-sample-review.txt": "sample_review_sheet",
      "/assets/certificates/sit240719190301-red.pdf": "red_document",
      "/assets/certificates/sit240719190302r-rohs.pdf": "rohs_document",
      "/product-comparison/": "model_comparison",
      [sampleReviewPath]: "sample_review_guide",
      "/sample-request/": "sample_guide",
      "/contact/": "inquiry_form"
    };
    let resource = Object.hasOwn(resources, destination.pathname) ? resources[destination.pathname] : null;
    if (destination.pathname === window.location.pathname) {
      resource = window.location.pathname === "/rfq-guide/" && destination.hash === "#rfq-download" ? "rfq_template_section"
        : window.location.pathname === "/insights/private-label-gaming-headset-rfq-checklist/" && destination.hash === "#quote-comparison" ? "quote_scope_section"
        : destination.hash === "#quick-mic-test" ? "mic_script"
        : destination.hash === "#packing-checklist" ? "packing_checklist"
        : destination.hash === "#certificate-match" ? "certificate_match"
        : ["#review-worksheet", "#sample-review-tool"].includes(destination.hash) ? "sample_worksheet"
        : destination.hash === "#receiver-checks" ? "receiver_checklist"
        : destination.hash === "#connection-comparison" ? "connection_comparison" : null;
    } else if (/^\/gaming-headsets\/[^/]+\/$/.test(destination.pathname) || audioModelPages.includes(destination.pathname)) {
      resource = "model_details";
    }
    if (!resource) return;
    // Record fixed resource names and paths, never link text, queries or buyer messages.
    window.gtag("event", "buyer_resource_click", {
      resource_type: resource,
      destination_path: destination.pathname,
      page_path: window.location.pathname
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConsentControls, { once: true });
  } else {
    initializeConsentControls();
  }
})();
