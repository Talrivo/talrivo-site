(() => {
  document.querySelectorAll('[data-catalogue-format]').forEach((link) => {
    link.addEventListener('click', () => {
      let consent = null;
      try { consent = window.localStorage.getItem('talrivoAnalyticsConsent'); } catch { return; }
      if (consent !== 'granted' || typeof window.gtag !== 'function') return;
      window.gtag('event', 'catalogue_download', {
        catalogue_name: 'TALRIVO TWS 2026',
        file_format: link.dataset.catalogueFormat,
        file_name: link.getAttribute('download'),
        link_url: link.href
      });
    });
  });
})();
