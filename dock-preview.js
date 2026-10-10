(() => {
  const notices = document.querySelectorAll('[data-show-expires]');
  const update = () => {
    notices.forEach((notice) => {
      const expiry = Date.parse(notice.dataset.showExpires);
      notice.hidden = !Number.isFinite(expiry) || Date.now() >= expiry;
    });
  };
  update();
  window.setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
})();
