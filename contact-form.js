const contactForm = document.querySelector("#inquiry-form");

if (contactForm) {
  const status = document.querySelector("#form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const pageUrl = document.querySelector("#contact-page-url");
  const pageTitle = document.querySelector("#contact-page-title");
  const referrer = document.querySelector("#contact-referrer");
  const firstLandingPage = document.querySelector("#contact-first-landing-page");
  const firstReferrer = document.querySelector("#contact-first-referrer");
  const utmSource = document.querySelector("#contact-utm-source");
  const utmMedium = document.querySelector("#contact-utm-medium");
  const utmCampaign = document.querySelector("#contact-utm-campaign");
  const utmTerm = document.querySelector("#contact-utm-term");
  const utmContent = document.querySelector("#contact-utm-content");
  const selectedFrom = document.querySelector("#contact-selected-from");
  const productInterest = contactForm.querySelector('select[name="product"]');
  const inquiryType = document.querySelector("#contact-inquiry-type");
  const params = new URLSearchParams(window.location.search);
  const productReference = document.querySelector("#contact-product-reference");
  const referenceNote = document.querySelector("#contact-reference-note");
  const inquiryReferences = {
    "usb-connection-guide": {
      title: "Gaming headset USB audio or lighting guide",
      url: "https://talrivo.com/insights/gaming-headset-usb-audio-or-lighting/",
      type: "guide"
    },
    "g938-phone-setup": {
      title: "G938 phone setup and controls",
      url: "https://youtu.be/AKqT0fzuqW8"
    },
    "hk-headsets-2026": {
      title: "Hong Kong 2026 gaming headset display",
      url: "https://youtu.be/SLcAr-jqdUs"
    }
  };
  const referenceKey = params.get("reference");
  const selectedReference = Object.hasOwn(inquiryReferences, referenceKey) ? inquiryReferences[referenceKey] : null;
  if (selectedReference) {
    referenceNote.hidden = false;
    referenceNote.textContent = selectedReference.type === "guide"
      ? `Guide reference: ${selectedReference.title}. Please include your headset version, target device and USB or 3.5mm connection question.`
      : `Video reference: ${selectedReference.title}. Please include the timestamp of the headset you are interested in.`;
  }
  const sourceStorageKey = "talrivoInquirySource";
  const productSelections = {
    "dock-headset": "Magnetic Charging Dock Headset Preview",
    "identify-headset": "Gaming Headset - Model Not Yet Identified",
    "gaming-headsets": "Gaming Headset Collection",
    "wireless-gaming-headsets": "Wireless Gaming Headset Series",
    "wired-gaming-headsets": "Wired RGB Gaming Headset Series",
    "G942-wired": "G942 RGB Wired Gaming Headset",
    "G935-wired": "G935 RGB Wired Gaming Headset",
    "bluetooth-headphones": "Bluetooth Headphones",
    "bluetooth-speakers": "Bluetooth Speakers",
    "tws-earbuds": "TWS & Open-Ear Earbuds",
    "type-c-earphones": "Type-C Earphones",
    "audio-products": "Custom Audio Project",
    "g938-g941": "G938 / G941 Gaming Headset Comparison",
    g941: "G941 Tri-Mode ANC Gaming Headset",
    g940: "G940 Low-Latency Wireless Gaming Headset",
    g946: "G946 Tri-Mode RGB Gaming Headset",
    g938: "G938 Wireless Gaming Headset",
    g935: "G935 Wireless Gaming Headset",
    g936: "G936 Lightweight Gaming Headset",
    g926: "G926 Wireless Gaming Headset",
    g947: "G947 Tri-Mode Gaming Headset",
    b7: "B7 Bluetooth Over-Ear Headphone",
    b9: "B9 Bluetooth Over-Ear Headphone",
    b10: "B10 Bluetooth Over-Ear Headphone",
    bh101: "BH-101 Portable Bluetooth Speaker",
    tws044f: "TWS044F Earbuds",
    earclip09s: "Earclip09S Open-Ear TWS Earbuds",
    tc1: "TC-1 Type-C Earphone",
    "custom-audio": "Custom Audio Project"
  };
  const inquirySelections = {
    "model-code": "Model comparison",
    "oem-odm": "OEM / private-label project",
    sample: "Sample request",
    oem: "OEM / private-label project",
    rfq: "Quotation request",
    compare: "Model comparison",
    packaging: "Packaging / artwork discussion",
    documents: "Product document question",
    "quick-question": "Quick product question"
  };
  const trackInquirySuccess = (fields, location) => {
    const payload = {
      event: "rfq_form_submit_success",
      form_location: location,
      form_version: fields.get("form_version") || "",
      product_interest: fields.get("product") || "",
      inquiry_type: fields.get("inquiry_type") || "",
      buyer_type: fields.get("buyer_type") || "",
      sales_channel: fields.get("channel") || "",
      market: fields.get("market") || "",
      quantity_stage: fields.get("quantity") || "",
      project_timing: fields.get("timeline") || "",
      selected_from: fields.get("selected_from") || "",
      utm_source: fields.get("utm_source") || "",
      utm_medium: fields.get("utm_medium") || "",
      utm_campaign: fields.get("utm_campaign") || ""
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", {
        method: "contact_rfq_form",
        form_location: payload.form_location,
        form_version: payload.form_version,
        product_interest: payload.product_interest,
        inquiry_type: payload.inquiry_type,
        buyer_type: payload.buyer_type,
        sales_channel: payload.sales_channel,
        market: payload.market,
        quantity_stage: payload.quantity_stage,
        project_timing: payload.project_timing,
        selected_from: payload.selected_from
      });
    }
    window.dispatchEvent(new CustomEvent("talrivo:rfq-submit-success", { detail: payload }));
  };

  const selectedProduct = productSelections[params.get("product")];
  const selectedInquiry = inquirySelections[params.get("inquiry")];
  const firstVisit = {
    firstLandingPage: window.location.href,
    firstReferrer: document.referrer || "Direct / not available"
  };
  const getStoredSource = () => {
    try {
      if (window.localStorage.getItem("talrivoAnalyticsConsent") !== "granted") return firstVisit;
      const savedSource = JSON.parse(window.localStorage.getItem(sourceStorageKey));
      if (savedSource && typeof savedSource === "object" && !Array.isArray(savedSource)) return savedSource;
    } catch (error) {
      // Blocked or invalid storage must not prevent an inquiry.
    }
    return firstVisit;
  };
  const hasCurrentCampaign = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].some(name => params.has(name));
  const getUtmValue = (name, key, storedSource) => hasCurrentCampaign ? params.get(name) || "" : storedSource[key] || "";

  const contactLinkDetails = [
    selectedProduct ? `Product: ${selectedProduct}` : "",
    selectedInquiry ? `Inquiry: ${selectedInquiry}` : ""
  ].filter(Boolean).join(" | ") || "Direct contact page";

  const populateAttribution = () => {
    const storedSource = getStoredSource();
    pageUrl.value = window.location.href;
    pageTitle.value = document.title;
    referrer.value = document.referrer || "Direct / not available";
    firstLandingPage.value = storedSource.firstLandingPage || window.location.href;
    firstReferrer.value = storedSource.firstReferrer || "Direct / not available";
    utmSource.value = getUtmValue("utm_source", "utmSource", storedSource);
    utmMedium.value = getUtmValue("utm_medium", "utmMedium", storedSource);
    utmCampaign.value = getUtmValue("utm_campaign", "utmCampaign", storedSource);
    utmTerm.value = getUtmValue("utm_term", "utmTerm", storedSource);
    utmContent.value = getUtmValue("utm_content", "utmContent", storedSource);
    selectedFrom.value = contactLinkDetails;
    productReference.value = selectedReference ? `${selectedReference.title}: ${selectedReference.url}` : "";
  };

  populateAttribution();

  if (selectedProduct) {
    productInterest.value = selectedProduct;
  }

  if (selectedInquiry) {
    inquiryType.value = selectedInquiry;
  }

  if (params.get("sent") === "1") {
    status.textContent = "If you just submitted an inquiry, please check your email for confirmation. This page cannot verify delivery from the URL alone.";
  }

  let submitting = false;
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    populateAttribution();
    status.classList.remove("success", "error");
    status.textContent = "Sending your inquiry...";
    submitButton.disabled = true;

    const fields = new FormData(contactForm);
    const valueOrFallback = (field, fallback = "Not specified") => {
      const value = fields.get(field);
      return value && String(value).trim() ? value : fallback;
    };
    const originalMessage = fields.get("message") || "Not provided";
    const subject = `TALRIVO ${valueOrFallback("inquiry_type")} - ${valueOrFallback("product")} - ${valueOrFallback("company", "Company not specified")}`;
    const message = [
      "New TALRIVO contact page inquiry",
      "",
      `Name: ${valueOrFallback("name")}`,
      `Business email: ${valueOrFallback("email")}`,
      `Company: ${valueOrFallback("company")}`,
      `Market / country: ${valueOrFallback("market")}`,
      `Buyer type: ${valueOrFallback("buyer_type")}`,
      `Sales channel: ${valueOrFallback("channel")}`,
      `Product interest: ${valueOrFallback("product")}`,
      `Inquiry type: ${valueOrFallback("inquiry_type")}`,
      `Product / video reference: ${valueOrFallback("product_reference")}`,
      `Project quantity stage: ${valueOrFallback("quantity")}`,
      `Project timing: ${valueOrFallback("timeline")}`,
      "",
      "Project requirements:",
      originalMessage,
      "",
      `Submitted from: ${valueOrFallback("page_url")}`,
      `Page title: ${valueOrFallback("page_title")}`,
      `Selected from: ${valueOrFallback("selected_from")}`,
      `Referrer: ${valueOrFallback("referrer")}`,
      `Initial landing page: ${valueOrFallback("first_landing_page")}`,
      `Initial referrer: ${valueOrFallback("first_referrer")}`,
      `UTM source: ${valueOrFallback("utm_source", "Not set")}`,
      `UTM medium: ${valueOrFallback("utm_medium", "Not set")}`,
      `UTM campaign: ${valueOrFallback("utm_campaign", "Not set")}`,
      `UTM term: ${valueOrFallback("utm_term", "Not set")}`,
      `UTM content: ${valueOrFallback("utm_content", "Not set")}`,
      `Form version: ${valueOrFallback("form_version")}`
    ].join("\n");

    fields.set("subject", subject);
    fields.set("from_name", "TALRIVO Contact Page Inquiry");
    fields.set("message", message);

    submitting = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: fields,
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Submission not confirmed");

      contactForm.reset();
      status.classList.add("success");
      status.textContent = "Thank you. Your inquiry has been accepted for delivery. TALRIVO will reply by business email.";
      try { trackInquirySuccess(fields, "contact_page"); } catch (trackingError) {
        // Analytics errors must not turn an accepted inquiry into a failed submission.
      }
    } catch (error) {
      status.classList.add("error");
      status.textContent = "We could not confirm submission. Your details are still here. The message may have reached us; please check your email before retrying, or contact sales@talrivo.com.";
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
    }
  });
}
