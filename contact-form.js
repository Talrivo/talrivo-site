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
  const sourceStorageKey = "talrivoInquirySource";
  const productSelections = {
    "gaming-headsets": "Gaming Headset Collection",
    "wireless-gaming-headsets": "Wireless Gaming Headset Series",
    "wired-gaming-headsets": "Wired RGB Gaming Headset Series",
    "bluetooth-headphones": "Bluetooth Headphones",
    "bluetooth-speakers": "Bluetooth Speakers",
    "tws-earbuds": "TWS & Open-Ear Earbuds",
    "type-c-earphones": "Type-C Earphones",
    g941: "G941 Tri-Mode ANC Gaming Headset",
    g940: "G940 Wireless Gaming Headset",
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
    sample: "Sample request",
    oem: "OEM / private-label project",
    rfq: "Quotation request",
    compare: "Model comparison",
    packaging: "Packaging / artwork discussion",
    documents: "Product document question"
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

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      window.gtag("event", payload.event, {
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
  let storedSource = firstVisit;

  try {
    const savedSource = JSON.parse(window.localStorage.getItem(sourceStorageKey));
    if (savedSource?.firstLandingPage) {
      storedSource = savedSource;
    } else {
      window.localStorage.setItem(sourceStorageKey, JSON.stringify(firstVisit));
    }
  } catch (error) {
    storedSource = firstVisit;
  }

  const contactLinkDetails = [
    selectedProduct ? `Product: ${selectedProduct}` : "",
    selectedInquiry ? `Inquiry: ${selectedInquiry}` : ""
  ].filter(Boolean).join(" | ") || "Direct contact page";

  const populateAttribution = () => {
    pageUrl.value = window.location.href;
    pageTitle.value = document.title;
    referrer.value = document.referrer || "Direct / not available";
    firstLandingPage.value = storedSource.firstLandingPage || window.location.href;
    firstReferrer.value = storedSource.firstReferrer || "Direct / not available";
    utmSource.value = params.get("utm_source") || "";
    utmMedium.value = params.get("utm_medium") || "";
    utmCampaign.value = params.get("utm_campaign") || "";
    utmTerm.value = params.get("utm_term") || "";
    utmContent.value = params.get("utm_content") || "";
    selectedFrom.value = contactLinkDetails;
  };

  populateAttribution();

  if (selectedProduct) {
    productInterest.value = selectedProduct;
  }

  if (selectedInquiry) {
    inquiryType.value = selectedInquiry;
  }

  if (params.get("sent") === "1") {
    status.classList.add("success");
    status.textContent = "Thank you. Your inquiry has been sent. TALRIVO will reply by business email.";
    trackInquirySuccess(new FormData(contactForm), "contact_page_redirect");
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
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

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: fields
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Submission failed");

      contactForm.reset();
      status.classList.add("success");
      status.textContent = "Thank you. Your inquiry has been sent. TALRIVO will reply by business email.";
      trackInquirySuccess(fields, "contact_page");
    } catch (error) {
      status.classList.add("error");
      status.textContent = "Online submission is temporarily unavailable. Please copy and email your requirements to sales@talrivo.com.";
    } finally {
      submitButton.disabled = false;
    }
  });
}
