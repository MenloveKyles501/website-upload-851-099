
(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
    return `
      <a class="movie-card" href="${movie.url}" aria-label="${escapeHTML(movie.title)}">
        <div class="movie-card__poster">
          <img src="${movie.poster}" alt="${escapeHTML(movie.title)}" loading="lazy">
          <span class="movie-card__badge">${escapeHTML(movie.type)}</span>
        </div>
        <div class="movie-card__body">
          <h3 class="movie-card__title">${escapeHTML(movie.title)}</h3>
          <div class="movie-card__meta">
            <span>${escapeHTML(movie.region)}</span>
            <span>${escapeHTML(movie.year)}</span>
          </div>
          <div class="movie-card__tags">${tags}</div>
        </div>
      </a>
    `;
  }

  function sideCard(movie) {
    return `
      <a class="side-card" href="${movie.url}">
        <img src="${movie.poster}" alt="${escapeHTML(movie.title)}" loading="lazy">
        <div>
          <h4>${escapeHTML(movie.title)}</h4>
          <p>${escapeHTML(movie.one_line || movie.summary || "")}</p>
        </div>
      </a>
    `;
  }

  function rankCard(movie, rank) {
    return `
      <article class="rank-card">
        <div class="rank-num">${rank}</div>
        <img src="${movie.poster}" alt="${escapeHTML(movie.title)}" loading="lazy">
        <div>
          <h4><a href="${movie.url}">${escapeHTML(movie.title)}</a></h4>
          <p class="mini">${escapeHTML(movie.region)} · ${escapeHTML(movie.year)} · ${escapeHTML(movie.type)} · ${escapeHTML(movie.genre || "")}</p>
          <p class="mini">${escapeHTML(movie.one_line || "")}</p>
        </div>
        <div class="score">${movie.heat.toFixed(1)}</div>
      </article>
    `;
  }

  function setupMobileNav() {
    const toggle = $('[data-nav-toggle]');
    const panel = $('[data-mobile-nav]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      panel.classList.toggle('is-open');
      const expanded = panel.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', String(expanded));
    });
  }

  function setupCarousel() {
    const root = $('[data-carousel]');
    if (!root) return;
    const track = $('[data-carousel-track]', root);
    const slides = $all('[data-carousel-slide]', root);
    const dots = $all('[data-carousel-dot]', root);
    const prev = $('[data-carousel-prev]', root);
    const next = $('[data-carousel-next]', root);
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;

    const go = (n) => {
      index = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 4200);
    };

    prev && prev.addEventListener('click', () => { go(index - 1); play(); });
    next && next.addEventListener('click', () => { go(index + 1); play(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { go(i); play(); }));

    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', play);

    go(0);
    play();
  }

  function setupPlayer() {
    const video = $('[data-hls-video]');
    if (!video) return;
    const overlay = $('[data-play-overlay]');
    const source = video.dataset.src;

    function showOverlay(show) {
      if (!overlay) return;
      overlay.classList.toggle('is-hidden', !show);
    }

    function attachNative() {
      video.src = source;
      video.addEventListener('play', () => showOverlay(false));
      video.addEventListener('pause', () => showOverlay(true));
      video.addEventListener('ended', () => showOverlay(true));
    }

    function attachHls() {
      if (!window.Hls || !window.Hls.isSupported || !window.Hls.isSupported()) {
        attachNative();
        return;
      }
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        showOverlay(true);
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          try {
            hls.destroy();
          } catch (e) {}
          attachNative();
        }
      });
      video.addEventListener('play', () => showOverlay(false));
      video.addEventListener('pause', () => showOverlay(true));
      video.addEventListener('ended', () => showOverlay(true));
    }

    if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      attachNative();
    } else {
      attachHls();
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      });
    }

    // first tap anywhere on wrapper also plays
    const wrap = video.closest('.video-wrap');
    if (wrap) {
      wrap.addEventListener('dblclick', () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      });
    }
  }

  function getMovies() {
    return Array.isArray(window.MOVIES) ? window.MOVIES : [];
  }

  function withUrl(movie, base = "") {
    if (!movie) return movie;
    const url = movie.url || `${base}movie/${movie.id}.html`;
    return Object.assign({}, movie, { url });
  }

  function setupSearchPage() {
    const body = document.body;
    if (!body || !body.dataset.page) return;
    const page = body.dataset.page;

    const movies = getMovies().map((m) => withUrl(m, body.dataset.base || ""));

    if (!movies.length) return;

    function renderGrid(target, list) {
      if (!target) return;
      if (!list.length) {
        target.innerHTML = `
          <div class="empty-state">
            没有找到符合条件的影片。<br>
            试试换一个关键词、年份或分类。
          </div>
        `;
        return;
      }
      target.innerHTML = list.map(movieCard).join("");
    }

    if (page === "browse") {
      const input = $('[data-browse-search]');
      const grid = $('[data-browse-grid]');
      const count = $('[data-browse-count]');
      const sortSelect = $('[data-browse-sort]');
      const pills = $all('[data-browse-type]');
      const paramType = new URLSearchParams(window.location.search).get("type");
      let currentType = paramType || body.dataset.initialType || "全部";

      const types = ["全部", ...new Set(movies.map((m) => m.type).filter(Boolean)).values()];

      function applySort(list) {
        const sort = sortSelect ? sortSelect.value : "heat";
        const arr = list.slice();
        if (sort === "year") {
          arr.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
        } else if (sort === "title") {
          arr.sort((a, b) => a.title.localeCompare(b.title, "zh-Hans-CN"));
        } else {
          arr.sort((a, b) => b.heat - a.heat);
        }
        return arr;
      }

      function filteredMovies() {
        const q = (input ? input.value : "").trim().toLowerCase();
        let list = movies.slice();
        if (currentType !== "全部") {
          list = list.filter((m) => m.type === currentType);
        }
        if (q) {
          list = list.filter((m) => {
            const text = [
              m.title,
              m.region,
              m.year,
              m.type,
              m.genre,
              (m.tags || []).join(" "),
              m.one_line,
              m.summary
            ].join(" ").toLowerCase();
            return text.includes(q);
          });
        }
        return applySort(list);
      }

      function rerender() {
        const list = filteredMovies();
        if (count) count.textContent = String(list.length);
        renderGrid(grid, list.slice(0, 180));
      }

      pills.forEach((pill) => {
        pill.classList.toggle('active', (pill.dataset.browseType || "全部") === currentType);
        pill.addEventListener('click', () => {
          currentType = pill.dataset.browseType || "全部";
          pills.forEach((p) => p.classList.toggle('active', p === pill));
          rerender();
        });
      });

      if (input) {
        input.addEventListener('input', rerender);
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', rerender);
      }
      rerender();
    }

    if (page === "search") {
      const input = $('[data-search-input]');
      const grid = $('[data-search-grid]');
      const counter = $('[data-search-count]');
      const suggestions = $('[data-search-suggestions]');
      const params = new URLSearchParams(window.location.search);
      const initial = (params.get("q") || "").trim();
      if (input && initial) input.value = initial;

      function searchList() {
        const q = (input ? input.value : "").trim().toLowerCase();
        if (!q) {
          return movies.slice().sort((a, b) => b.heat - a.heat).slice(0, 60);
        }
        return movies.filter((m) => {
          const text = [
            m.title,
            m.region,
            m.year,
            m.type,
            m.genre,
            (m.tags || []).join(" "),
            m.one_line,
            m.summary
          ].join(" ").toLowerCase();
          return text.includes(q);
        }).sort((a, b) => b.heat - a.heat);
      }

      function rerender() {
        const q = (input ? input.value : "").trim();
        const list = searchList();
        if (counter) counter.textContent = String(list.length);
        renderGrid(grid, list.slice(0, 180));
        if (suggestions) {
          const picks = movies.slice(0, 12).sort(() => Math.random() - 0.5).slice(0, 6);
          suggestions.innerHTML = picks.map((m) => `<a class="filter-pill" href="search.html?q=${encodeURIComponent(m.title)}">${escapeHTML(m.title)}</a>`).join("");
        }
        if (!q) {
          body.dataset.searchEmpty = "1";
        } else {
          delete body.dataset.searchEmpty;
        }
      }

      if (input) {
        input.addEventListener('input', rerender);
      }
      rerender();
    }

    if (page === "ranking") {
      const rankList = $('[data-rank-list]');
      const rankGrid = $('[data-rank-grid]');
      const top = movies.slice().sort((a, b) => (b.heat - a.heat) || ((parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)));
      if (rankList) {
        rankList.innerHTML = top.slice(0, 40).map((m, i) => rankCard(m, i + 1)).join("");
      }
      if (rankGrid) {
        rankGrid.innerHTML = top.slice(0, 24).map(movieCard).join("");
      }
    }

    if (page === "home") {
      const quick = $('[data-home-quick]');
      if (quick) {
        const top = movies.slice().sort((a, b) => b.heat - a.heat).slice(0, 12);
        quick.innerHTML = top.map(movieCard).join("");
      }
    }
  }

  function bindSearchForms() {
    $all('[data-go-search]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('[data-go-search-input]', form);
        const q = input ? input.value.trim() : '';
        if (!q) return;
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupCarousel();
    setupPlayer();
    setupSearchPage();
    bindSearchForms();
  });
})();
