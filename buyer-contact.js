(() => {
  const config = document.currentScript;
  const product = config?.dataset.product || "gaming-headsets";
  const label = config?.dataset.label || "gaming headsets";
  const root = new URL(config.src, window.location.href);
  const home = new URL("./", root);
  let dock = document.querySelector(".contact-dock");
  if (!dock) {
    dock = document.createElement("nav");
    dock.className = "contact-dock";
    dock.setAttribute("aria-label", "Quick contact");
    const inquiry = new URL("contact/", home);
    inquiry.searchParams.set("product", product);
    inquiry.searchParams.set("inquiry", "quick-question");
    inquiry.hash = "inquiry-form";
    const whatsapp = new URL("https://wa.me/8613824276001");
    whatsapp.searchParams.set("text", `Hello TALRIVO, I would like to ask about ${label}. My target devices and market are: `);
    const email = `mailto:sales@talrivo.com?subject=${encodeURIComponent(`TALRIVO ${label} question`)}`;
    for (const [text, href] of [["Ask a question", inquiry.href], ["WhatsApp", whatsapp.href], ["Email", email]]) {
      const link = document.createElement("a");
      link.textContent = text;
      link.href = href;
      if (text === "WhatsApp") { link.target = "_blank"; link.rel = "noopener"; }
      dock.append(link);
    }
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.textContent = "WeChat";
    trigger.setAttribute("data-open-wechat", "");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "buyer-wechat-dialog");
    dock.append(trigger);
    const dialog = document.createElement("dialog");
    dialog.id = "buyer-wechat-dialog";
    dialog.className = "buyer-wechat-dialog";
    dialog.setAttribute("aria-labelledby", "buyer-wechat-title");
    const close = document.createElement("button"); close.type = "button"; close.textContent = "Close";
    close.className = "buyer-wechat-close"; close.setAttribute("aria-label", "Close WeChat QR code");
    const heading = document.createElement("h2"); heading.id = "buyer-wechat-title"; heading.textContent = "Contact TALRIVO on WeChat";
    const instructions = document.createElement("p"); instructions.textContent = "Scan the QR code with WeChat to ask about models, samples and packaging.";
    const qr = document.createElement("img"); qr.src = new URL("assets/contact/wechat-qr.jpg", home).href;
    qr.alt = "TALRIVO WeChat QR code"; qr.width = 878; qr.height = 722; qr.loading = "lazy";
    const fallback = document.createElement("a"); fallback.href = "mailto:sales@talrivo.com"; fallback.textContent = "Email: sales@talrivo.com";
    dialog.append(close, heading, instructions, qr, fallback);
    document.body.append(dock, dialog);
    trigger.addEventListener("click", () => { dialog.showModal(); close.focus(); });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => trigger.focus());
  }
  dock.classList.add("buyer-contact-dock");
  document.body.classList.add("buyer-contact-enabled");
  const update = () => {
    const active = document.activeElement;
    const typing = active?.matches?.("input, textarea, select, [contenteditable='true']");
    const busy = Boolean(document.querySelector(".analytics-consent, dialog[open]"));
    dock.hidden = typing || busy;
  };
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", () => queueMicrotask(update));
  new MutationObserver(update).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ["open"]});
  update();
})();
