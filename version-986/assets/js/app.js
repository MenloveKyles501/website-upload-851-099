
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

ready(() => {
  const year = document.getElementById('yearNow');
  if (year) year.textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => menu.classList.toggle('is-open'));
  }

  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'));
    let index = 0;
    const show = (i) => {
      index = i % slides.length;
      if (index < 0) index = slides.length - 1;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === index));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === index));
    };
    dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
    setInterval(() => show(index + 1), 5200);
    show(0);
  }

  const tabBtns = Array.from(document.querySelectorAll('[data-tab-btn]'));
  const tabPanels = Array.from(document.querySelectorAll('[data-tab-panel]'));
  if (tabBtns.length && tabPanels.length) {
    const activate = (name) => {
      tabBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.tabBtn === name));
      tabPanels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.tabPanel === name));
    };
    tabBtns.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tabBtn)));
  }

  const video = document.querySelector('[data-player]');
  if (video) {
    const sourceBtns = Array.from(document.querySelectorAll('[data-source]'));
    const mp4 = video.dataset.mp4;
    const hls = video.dataset.hls;
    let hlsInstance = null;

    const setActive = (mode) => {
      sourceBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.source === mode));
    };

    const destroyHls = () => {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        try { hlsInstance.destroy(); } catch (err) {}
      }
      hlsInstance = null;
    };

    const useMp4 = () => {
      destroyHls();
      video.src = mp4;
      video.load();
      setActive('mp4');
      video.play().catch(() => {});
    };

    const useHls = () => {
      destroyHls();
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(hls);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        setActive('hls');
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hls;
        video.load();
        setActive('hls');
        video.play().catch(() => {});
        return;
      }
      useMp4();
    };

    sourceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.source === 'hls') useHls();
        else useMp4();
      });
    });
    useMp4();
  }

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchCount = document.getElementById('searchCount');
  if (searchInput && searchResults && window.MOVIE_INDEX) {
    const params = new URLSearchParams(location.search);
    const initial = params.get('q') || '';
    searchInput.value = initial;

    const renderCard = (item) => `
      <a class="movie-card" href="${item.url}">
        <div class="movie-poster-wrap">
          <img class="movie-poster" src="${item.poster}" alt="${item.title}">
          <div class="movie-badge">${item.type}</div>
          <div class="movie-year">${item.year}</div>
        </div>
        <div class="movie-meta">
          <h3>${item.title}</h3>
          <p>${item.one_line}</p>
          <div class="movie-tags"><span>${item.genre}</span><span>${item.region}</span></div>
        </div>
      </a>`;

    const doSearch = (query) => {
      const q = (query || '').trim().toLowerCase();
      let list = window.MOVIE_INDEX.slice();
      if (q) {
        list = list.filter(item => {
          const hay = [item.title, item.region, item.type, item.genre, item.one_line, item.tags].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      searchCount.textContent = q ? `找到 ${list.length} 部影片` : `默认展示 ${Math.min(60, list.length)} 部热门影片`;
      const view = q ? list.slice(0, 120) : list.slice(0, 60);
      searchResults.innerHTML = view.map(renderCard).join('') || '<div class="detail-article">未找到匹配结果，请尝试别的关键词。</div>';
    };

    searchInput.addEventListener('input', () => doSearch(searchInput.value));
    doSearch(initial);
  }
});
