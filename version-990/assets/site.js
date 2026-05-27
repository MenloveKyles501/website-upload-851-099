
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  const path = location.pathname.replace(/\/index\.html$/, '/').split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .chip[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href) return;
    const clean = href.replace(/^\.\//, '').replace(/^\//, '');
    if (path === clean || location.pathname.endsWith(clean)) a.classList.add('active');
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const cards = Array.from(document.querySelectorAll('[data-search]'));
  const resultCount = document.querySelector('[data-result-count]');
  const filterHint = document.querySelector('[data-filter-hint]');

  function applyFilter() {
    if (!filterInput || !cards.length) return;
    const q = filterInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const hay = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      const ok = !q || hay.includes(q);
      card.style.display = ok ? '' : 'none';
      if (ok) visible++;
    });
    if (resultCount) resultCount.textContent = visible;
    if (filterHint) filterHint.textContent = q ? `当前筛选：${q}` : '输入片名、类型、地区或标签即可筛选';
  }
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  document.querySelectorAll('[data-filter-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-filter-tag') || '';
      if (filterInput) {
        filterInput.value = v;
        filterInput.focus();
        applyFilter();
      }
    });
  });

  const playerWrap = document.querySelector('[data-player]');
  if (playerWrap) {
    const video = playerWrap.querySelector('video');
    const button = playerWrap.querySelector('[data-player-button]');
    const overlay = playerWrap.querySelector('.player__overlay');

    function setPlayingState() {
      playerWrap.classList.add('is-playing');
    }
    function setPausedState() {
      playerWrap.classList.remove('is-playing');
    }

    const mp4Src = video?.dataset.videoSrc || '';
    const hlsSrc = video?.dataset.hlsSrc || '';

    if (video) {
      video.preload = 'metadata';
      const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      if (hlsSrc && location.protocol !== 'file:' && window.Hls && Hls.isSupported()) {
        try {
          const hls = new Hls({enableWorker: true, lowLatencyMode: false});
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {});
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (mp4Src && !video.src) video.src = mp4Src;
          });
        } catch (err) {
          if (mp4Src) video.src = mp4Src;
        }
      } else if (canNativeHls && hlsSrc && location.protocol !== 'file:') {
        video.src = hlsSrc;
      } else if (mp4Src) {
        video.src = mp4Src;
      }

      video.addEventListener('play', setPlayingState);
      video.addEventListener('pause', setPausedState);
      video.addEventListener('ended', setPausedState);
    }

    const triggerPlay = () => video?.play().catch(() => {});
    if (button) button.addEventListener('click', triggerPlay);
    if (overlay) overlay.addEventListener('click', triggerPlay);
    playerWrap.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (video && video.paused) triggerPlay();
    });
  }

  const topBtn = document.querySelector('[data-backtop]');
  if (topBtn) {
    topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();
