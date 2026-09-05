(() => {
  const measurementId = "G-ZLN0CNB9PZ";
  const consentStorageKey = "talrivoAnalyticsConsent";

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

  if (savedConsent === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
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
  };

  const buildConsentPanel = () => {
    const panel = document.createElement("section");
    panel.className = "analytics-consent";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeConsentControls, { once: true });
  } else {
    initializeConsentControls();
  }
})();
