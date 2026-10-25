const productionPlayer = document.querySelector('#g935-production-player');
const productionPlayButton = productionPlayer?.querySelector('button');

if (productionPlayButton) {
  productionPlayButton.hidden = false;
  productionPlayButton.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/1KQfLCmMhE4?autoplay=1';
    frame.title = 'G935 gaming headset assembly and finishing video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    productionPlayer.replaceChildren(frame);
    frame.focus();
  }, { once: true });
}
