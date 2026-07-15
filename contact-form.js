const contactForm = document.querySelector("#inquiry-form");

if (contactForm) {
  const status = document.querySelector("#form-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const pageUrl = document.querySelector("#contact-page-url");
  const referrer = document.querySelector("#contact-referrer");
  const utmSource = document.querySelector("#contact-utm-source");
  const utmMedium = document.querySelector("#contact-utm-medium");
  const utmCampaign = document.querySelector("#contact-utm-campaign");
  const inquiryType = document.querySelector("#contact-inquiry-type");
  const params = new URLSearchParams(window.location.search);

  pageUrl.value = window.location.href;
  referrer.value = document.referrer || "Direct / not available";
  utmSource.value = params.get("utm_source") || "";
  utmMedium.value = params.get("utm_medium") || "";
  utmCampaign.value = params.get("utm_campaign") || "";

  if (params.get("inquiry") === "sample") {
    inquiryType.value = "Sample request";
  }

  if (params.get("sent") === "1") {
    status.classList.add("success");
    status.textContent = "Your inquiry has been sent. TALRIVO will reply by business email.";
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.classList.remove("success", "error");
    status.textContent = "Sending your inquiry...";
    submitButton.disabled = true;

    const fields = new FormData(contactForm);
    const originalMessage = fields.get("message") || "Not provided";
    const subject = `TALRIVO ${fields.get("inquiry_type")} - ${fields.get("product")} - ${fields.get("company")}`;
    const message = [
      "New TALRIVO contact page inquiry",
      "",
      `Name: ${fields.get("name")}`,
      `Business email: ${fields.get("email")}`,
      `Company: ${fields.get("company")}`,
      `Market / country: ${fields.get("market")}`,
      `Buyer type: ${fields.get("buyer_type")}`,
      `Sales channel: ${fields.get("channel") || "Not specified"}`,
      `Product interest: ${fields.get("product")}`,
      `Inquiry type: ${fields.get("inquiry_type")}`,
      `Estimated quantity: ${fields.get("quantity")}`,
      `Project timing: ${fields.get("timeline") || "Not specified"}`,
      "",
      "Project requirements:",
      originalMessage,
      "",
      `Submitted from: ${window.location.href}`,
      `Referrer: ${document.referrer || "Direct / not available"}`,
      `UTM source: ${params.get("utm_source") || "Not set"}`,
      `UTM medium: ${params.get("utm_medium") || "Not set"}`,
      `UTM campaign: ${params.get("utm_campaign") || "Not set"}`
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
      status.textContent = "Your inquiry has been sent. TALRIVO will reply by business email.";
    } catch (error) {
      status.classList.add("error");
      status.textContent = "Online submission is temporarily unavailable. Please copy and email your requirements to sales@talrivo.com.";
    } finally {
      submitButton.disabled = false;
    }
  });
}
